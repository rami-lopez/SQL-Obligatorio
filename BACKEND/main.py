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

from starlette.concurrency import run_in_threadpool
from jose import JWTError, jwt
from services.auth_services import SECRET_KEY, ALGORITHM
from db import fetch_all
from context import userRol

@app.middleware("http")
async def attach_user_role_middleware(request: Request, call_next):
    """Middleware que extrae token y carga request.state.user / request.state.role.
       - Ejecuta el fetch en threadpool.
       - Forza userRol('login') antes de la consulta para garantizar credenciales read-only.
       - Luego mapea userRol según rol real del participante antes de ejecutar el request.
    """
    request.state.user = None
    request.state.role = None

    token_ctx_before = None
    token_ctx_after = None

    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        token = auth_header.split(None, 1)[1].strip()
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            email = payload.get("sub")

            if email:
                # 1) Seteamos userRol a 'login' temporalmente para que fetch_all
                #    use el usuario read-only correcto en la consulta.
                token_ctx_before = userRol.set("login")
                try:
                    q = """
                        SELECT id_participante, email, rol, activo
                        FROM participante
                        WHERE email = %s
                    """
                    # Ejecutar la consulta en threadpool (no bloquear event loop)
                    res = await run_in_threadpool(fetch_all, q, (email,))

                    if res and res[0].get("activo"):
                        request.state.user = {
                            "id_participante": res[0]["id_participante"],
                            "email": res[0]["email"]
                        }
                        request.state.role = res[0]["rol"]
                    else:
                        # usuario inexistente o inactivo -> no autenticado
                        request.state.user = None
                        request.state.role = None
                except Exception as ex_fetch:
                    # Si la consulta falla por cualquier motivo, fallback al rol en token
                    request.state.role = payload.get("rol")
                finally:
                    # revertimos el contexto temporal dejado por token_ctx_before
                    if token_ctx_before is not None:
                        try:
                            userRol.reset(token_ctx_before)
                        except Exception:
                            pass

        except JWTError:
            # Token inválido/expirado -> dejamos user/role en None
            print("JWTError: token inválido o expirado")

    # Map application role to DB connection role para la ejecución del request
    # Elegimos userRol según request.state.role (si no está, uso 'login' por defecto)
    try:
        if request.state.role == 'admin':
            token_ctx_after = userRol.set('admin')
        elif request.state.role in ['alumno_grado', 'alumno_posgrado', 'docente']:
            token_ctx_after = userRol.set('user')
        else:
            token_ctx_after = userRol.set('login')

        # Continuar con el request (ahora con userRol correcto)
        response = await call_next(request)
        return response

    finally:
        # Restaurar userRol previo (si se seteó)
        if token_ctx_after is not None:
            try:
                userRol.reset(token_ctx_after)
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