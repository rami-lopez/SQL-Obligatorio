from fastapi import APIRouter, HTTPException, status, Depends
from models.sancion_model import SancionCreate, SancionUpdate, SancionResponse
from services.sancion_service import (
    crear_sancion,
    listar_sanciones,
    obtener_sancion,
    actualizar_sancion,
    eliminar_sancion,
    tiene_sancion_vigente
)
from api.auth import get_current_active_admin, get_current_user

router = APIRouter(prefix="/sanciones", tags=["sancion"])

@router.post("/", status_code=status.HTTP_201_CREATED)
def create(s: SancionCreate, current_user = Depends(get_current_active_admin)):
    """Solo admin puede crear sanciones"""
    return crear_sancion(s)

@router.get("/")
def list_all(
    id_participante: int = None,
    vigentes_solo: bool = False,
    current_user = Depends(get_current_active_admin)
):
    """Listar sanciones (filtrable por participante y vigencia)"""
    return listar_sanciones(id_participante, vigentes_solo)

@router.get("/{id_sancion}")
def get_one(id_sancion: int, current_user = Depends(get_current_active_admin)):
    """Obtener una sanción por ID"""
    return obtener_sancion(id_sancion)

@router.put("/{id_sancion}")
def update(id_sancion: int, s: SancionUpdate, current_user = Depends(get_current_active_admin)):
    """Actualizar sanción"""
    return actualizar_sancion(id_sancion, s)

@router.delete("/{id_sancion}")
def delete(id_sancion: int, current_user = Depends(get_current_active_admin)):
    """Eliminar sanción"""
    return eliminar_sancion(id_sancion)

@router.get("/participantes/{id_participante}")
def verificar_sancion_vigente(id_participante: int, current_user = Depends(get_current_user)):
    """Verificar si un participante tiene sanciones vigentes"""
    return tiene_sancion_vigente(id_participante)

