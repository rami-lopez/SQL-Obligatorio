from fastapi import FastAPI,APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from api import (
    auth, 
    participante, 
    sala, 
    edificio, 
    programa, 
    reserva, 
    sancion,
    facultad,
    turno,
    consultas,
    admin
)
from contextlib import asynccontextmanager
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from services.scheduler_service import (
    procesar_reservas_finalizadas
)

# Para decodificar token y consultar rol
from jose import JWTError, jwt
from services.auth_services import SECRET_KEY, ALGORITHM
from db import fetch_all
from context import userRol

scheduler = BackgroundScheduler()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manejo del ciclo de vida de la aplicación"""
    
    print("\n Iniciando jobs")
    
    # 1. Procesar reservas finalizadas: cada hora en punto
    scheduler.add_job(
        procesar_reservas_finalizadas,
        trigger=CronTrigger(minute=0), 
        id='procesar_reservas',
        name='Procesar reservas finalizadas',
        replace_existing=True
    )
    print("✓ Tarea 'procesar_reservas' configurada (cada hora en punto)")
    
    
    # Iniciar scheduler
    scheduler.start()
    print("✅ Scheduler iniciado correctamente\n")
    yield  
    print("\n🛑 Deteniendo tareas programadas...")
    scheduler.shutdown()
    print("✅ Scheduler detenido\n")



app = FastAPI(
    title="Sistema Reserva Salas - UCU",
    description="Sistema de gestión de reservas de salas de estudio",
    version="1.0.0",
    lifespan=lifespan
)


@app.middleware("http")
async def attach_user_role_middleware(request: Request, call_next):
    """Middleware que extrae el token Bearer (si existe), lo decodifica y
    guarda request.state.user y request.state.role para uso en handlers.

    - No interfiere con rutas públicas: si no hay token o es inválido, simplemente
      deja los valores en None.
    - Si el token es válido, intentamos obtener el rol actual desde la tabla
      participante (en caso de que el rol haya cambiado desde la emisión del token).
    """
    request.state.user = None
    request.state.role = None

    auth_header = request.headers.get("authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        token = auth_header.split(None, 1)[1].strip()
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            email = payload.get("sub")
            # Si el token incluye el email en 'sub', obtener rol actual desde DB
            if email:
                try:
                    q = """
                        SELECT id_participante, email, rol, activo
                        FROM participante
                        WHERE email = %s
                    """
                    res = fetch_all(q, (email,))
                    if res and res[0].get("activo"):
                        request.state.user = {
                            "id_participante": res[0]["id_participante"],
                            "email": res[0]["email"]
                        }
                        request.state.role = res[0]["rol"]
                    else:
                        # Si usuario no existe o está inactivo, no fijamos role
                        request.state.user = None
                        request.state.role = None
                except Exception:
                    # Si falla la consulta, como fallback usar rol (si existe) del token
                    request.state.role = payload.get("rol")
        except JWTError:
            # Token inválido/expirado: dejar valores en None
            pass

    # Map application role to DB connection role
    token_ctx = None
    try:
        if request.state.role == 'admin':
            token_ctx = userRol.set('admin')
        elif request.state.role in ['alumno_grado', 'alumno_posgrado', 'docente']:
            token_ctx = userRol.set('user')
        else:
            # No token / public access -> use 'login' DB user for read-only operations
            token_ctx = userRol.set('login')

        response = await call_next(request)
        return response
    finally:
        # Reset contextvar to previous value
        if token_ctx is not None:
            try:
                userRol.reset(token_ctx)
            except Exception:
                pass

# CORS 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")

api_router.include_router(auth.router)
api_router.include_router(participante.router)
api_router.include_router(sala.router)
api_router.include_router(edificio.router)
api_router.include_router(programa.router)
api_router.include_router(reserva.router)
api_router.include_router(sancion.router)
api_router.include_router(facultad.router)
api_router.include_router(turno.router)
api_router.include_router(consultas.router)
api_router.include_router(admin.router)

app.include_router(api_router)

@app.get("/")
def root():
    return {
        "mensaje": "API Sistema Reserva Salas - UCU",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
def health_check():
    """Endpoint de salud para monitoreo"""
    return {"status": "healthy"}