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
    consultas
)

app = FastAPI(
    title="Sistema Reserva Salas - UCU",
    description="Sistema de gestión de reservas de salas de estudio",
    version="1.0.0"
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