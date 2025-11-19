from fastapi import FastAPI,APIRouter
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