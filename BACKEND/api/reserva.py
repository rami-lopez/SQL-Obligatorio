from fastapi import APIRouter, HTTPException, status, Depends
from models.reserva_model import ReservaCreate, ReservaUpdate, ReservaResponse
from services.reserva_service import (
    crear_reserva,
    listar_reservas,
    obtener_reserva,
    actualizar_reserva,
    rechazar_participacion,
    confirmar_participacion,
    registrar_asistencia,
    listar_mis_reservas,
    eliminar_reserva,obtener_participantes_reserva
)
from api.auth import get_current_user, UserInToken, get_current_active_admin
from pydantic import BaseModel
from typing import List
from datetime import date

router = APIRouter(prefix="/reservas", tags=["reserva"])

eliminar_reserva_service = eliminar_reserva

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
    """Actualizar reserva (solo el creador o admin)"""
    return actualizar_reserva(id_reserva, r, current_user.id_participante, current_user.rol == "admin" )



@router.put("/{id_reserva}/participacion/{participacion}")
def confirmar(id_reserva: int, participacion: bool, current_user: UserInToken = Depends(get_current_user)):
    """Confirmar participación en una reserva"""
    if participacion == True:
        return confirmar_participacion(id_reserva, current_user.id_participante)
    else:
        return rechazar_participacion(id_reserva, current_user.id_participante)

@router.put("/{id_reserva}/registrar-asistencia/{presente}")
def registrar_asist(id_reserva: int, presente: bool, current_user: UserInToken = Depends(get_current_user)):
    """Registrar asistencia (el participante marca su asistencia)"""
    return registrar_asistencia(id_reserva, current_user.id_participante, presente)

@router.delete("/{id_reserva}")
def eliminar_reserva_endpoint(id_reserva: int, current_user = Depends(get_current_user)):
    """Elimina una reserva especifica"""
    return eliminar_reserva_service(id_reserva, current_user.id_participante, current_user.rol)

@router.get("/{id_reserva}/participantes")
def listar_participantes_reserva(id_reserva: int, current_user = Depends(get_current_user)):
    """Lista los participantes de una reserva especifica"""
    reserva = obtener_reserva(id_reserva)
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return obtener_participantes_reserva(id_reserva)