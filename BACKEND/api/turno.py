from fastapi import APIRouter, Depends
from services.turno_service import listar_turnos, obtener_turno
from api.auth import get_current_user

router = APIRouter(prefix="/turnos", tags=["turno"])

@router.get("/")
def list_all(current_user = Depends(get_current_user)):
    """Listar todos los turnos disponibles"""
    return listar_turnos()

@router.get("/{id_turno}")
def get_one(id_turno: int, current_user = Depends(get_current_user)):
    """Obtener un turno por ID"""
    return obtener_turno(id_turno)