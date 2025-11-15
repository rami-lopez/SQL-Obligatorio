from fastapi import APIRouter, HTTPException, status, Depends
from models.reserva_model import ReservaCreate, ReservaUpdate, ReservaResponse
from services.reserva_service import (
    crear_reserva,
    listar_reservas,
    obtener_reserva,
    actualizar_reserva,
    cancelar_reserva,
    confirmar_participacion,
    registrar_asistencia,
    listar_mis_reservas
)
from api.auth import get_current_user, UserInToken
from pydantic import BaseModel
from typing import List
from datetime import date

router = APIRouter(prefix="/reservas", tags=["reserva"])

class ReservaCreateConParticipantes(BaseModel):
    id_sala: int
    fecha: date
    start_turn_id: int
    end_turn_id: int
    participantes: List[int]  # Lista de id_participante

class ConfirmarParticipacionRequest(BaseModel):
    id_reserva: int

class RegistrarAsistenciaRequest(BaseModel):
    id_reserva: int
    id_participante: int
    presente: bool

@router.post("/", status_code=status.HTTP_201_CREATED)
def create(r: ReservaCreateConParticipantes, current_user: UserInToken = Depends(get_current_user)):
    """Crear una reserva (cualquier usuario autenticado)"""
    return crear_reserva(r, current_user.id_participante)

@router.get("/")
def list_all(current_user = Depends(get_current_user)):
    """Listar todas las reservas (filtrable por admin)"""
    return listar_reservas()

@router.get("/mis-reservas")
def mis_reservas(current_user: UserInToken = Depends(get_current_user)):
    """Listar mis reservas"""
    return listar_mis_reservas(current_user.id_participante)

@router.get("/{id_reserva}")
def get_one(id_reserva: int, current_user = Depends(get_current_user)):
    """Obtener una reserva por ID"""
    return obtener_reserva(id_reserva)

@router.put("/{id_reserva}")
def update(id_reserva: int, r: ReservaUpdate, current_user: UserInToken = Depends(get_current_user)):
    """Actualizar reserva (solo el creador)"""
    return actualizar_reserva(id_reserva, r, current_user.id_participante)

@router.post("/{id_reserva}/cancelar")
def cancelar(id_reserva: int, current_user: UserInToken = Depends(get_current_user)):
    """Cancelar reserva (solo el creador)"""
    return cancelar_reserva(id_reserva, current_user.id_participante)

@router.post("/confirmar-participacion")
def confirmar(r: ConfirmarParticipacionRequest, current_user: UserInToken = Depends(get_current_user)):
    """Confirmar participación en una reserva"""
    return confirmar_participacion(r.id_reserva, current_user.id_participante)

@router.post("/registrar-asistencia")
def registrar_asist(r: RegistrarAsistenciaRequest, current_user: UserInToken = Depends(get_current_user)):
    """Registrar asistencia (el participante marca su asistencia)"""
    return registrar_asistencia(r.id_reserva, r.id_participante, r.presente, current_user.id_participante)
