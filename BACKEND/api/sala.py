from fastapi import APIRouter, HTTPException, status, Depends
from models.sala_model import SalaCreate, SalaUpdate, SalaResponse
from services.sala_service import (
    crear_sala,
    listar_salas,
    obtener_sala,
    actualizar_sala,
    eliminar_sala,
    listar_salas_disponibles
)
from api.auth import get_current_active_admin, get_current_user
from datetime import date

router = APIRouter(prefix="/salas", tags=["sala"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def create(s: SalaCreate, current_user = Depends(get_current_active_admin)):
    """Solo admin puede crear salas"""
    return crear_sala(s)

@router.get("/")
def list_all(current_user = Depends(get_current_user)):
    """Listar todas las salas"""
    return listar_salas()

@router.get("/disponibles")
def list_disponibles(
    fecha: date,
    start_turn_id: int,
    end_turn_id: int,
    current_user = Depends(get_current_user)
):
    """Listar salas disponibles para una fecha y horario específico"""
    return listar_salas_disponibles(fecha, start_turn_id, end_turn_id)

@router.get("/{id_sala}")
def get_one(id_sala: int, current_user = Depends(get_current_user)):
    """Obtener una sala por ID"""
    return obtener_sala(id_sala)

@router.put("/{id_sala}")
def update(id_sala: int, s: SalaUpdate, current_user = Depends(get_current_active_admin)):
    """Actualizar sala"""
    return actualizar_sala(id_sala, s)

@router.delete("/{id_sala}")
def delete(id_sala: int, current_user = Depends(get_current_active_admin)):
    """Eliminar sala"""
    return eliminar_sala(id_sala)
