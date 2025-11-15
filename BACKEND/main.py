from fastapi import FastAPI
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

app.include_router(auth.router)
app.include_router(participante.router)
app.include_router(sala.router)
app.include_router(edificio.router)
app.include_router(programa.router)
app.include_router(reserva.router)
app.include_router(sancion.router)
app.include_router(facultad.router)
app.include_router(turno.router)
app.include_router(consultas.router)

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