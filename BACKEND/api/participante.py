from fastapi import APIRouter, HTTPException, status, Depends
from models.participante_model import ParticipanteCreate, ParticipanteUpdate, ParticipanteResponse
from services.participante_service import (
    crear_participante, 
    listar_participantes,
    obtener_participante,
    actualizar_participante,
    eliminar_participante
)
from api.auth import get_current_active_admin

router = APIRouter(prefix="/participantes", tags=["participante"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def create(p: ParticipanteCreate, current_user = Depends(get_current_active_admin)):
    """Solo admin puede crear participantes"""
    return crear_participante(p)

@router.get("/")
def list_all(current_user = Depends(get_current_active_admin)):
    """Solo admin puede listar todos los participantes"""
    return listar_participantes()

@router.get("/{id_participante}")
def get_one(id_participante: int, current_user = Depends(get_current_active_admin)):
    """Obtener un participante por ID"""
    return obtener_participante(id_participante)

@router.put("/{id_participante}")
def update(id_participante: int, p: ParticipanteUpdate, current_user = Depends(get_current_active_admin)):
    """Actualizar participante"""
    return actualizar_participante(id_participante, p)

@router.delete("/{id_participante}")
def delete(id_participante: int, current_user = Depends(get_current_active_admin)):
    """Eliminar (desactivar) participante"""
    return eliminar_participante(id_participante)