from fastapi import APIRouter, HTTPException, status, Depends
from models.programa_model import ProgramaCreate, ProgramaUpdate, ProgramaResponse
from services.programa_service import (
    crear_programa,
    listar_programas,
    obtener_programa,
    actualizar_programa,
    eliminar_programa,
    asignar_participante_programa,
    remover_participante_programa
)
from api.auth import get_current_active_admin, get_current_user
from pydantic import BaseModel

router = APIRouter(prefix="/programas", tags=["programa"])

class ParticipanteProgramaCreate(BaseModel):
    id_participante: int
    id_programa: int

@router.post("/", status_code=status.HTTP_201_CREATED)
def create(p: ProgramaCreate, current_user = Depends(get_current_active_admin)):
    """Solo admin puede crear programas"""
    return crear_programa(p)

@router.get("/")
def list_all(current_user = Depends(get_current_user)):
    """Listar todos los programas"""
    return listar_programas()

@router.get("/{id_programa}")
def get_one(id_programa: int, current_user = Depends(get_current_user)):
    """Obtener un programa por ID"""
    return obtener_programa(id_programa)

@router.put("/{id_programa}")
def update(id_programa: int, p: ProgramaUpdate, current_user = Depends(get_current_active_admin)):
    """Actualizar programa"""
    return actualizar_programa(id_programa, p)

@router.delete("/{id_programa}")
def delete(id_programa: int, current_user = Depends(get_current_active_admin)):
    """Eliminar programa"""
    return eliminar_programa(id_programa)

@router.post("/asignar-participante")
def asignar_participante(pp: ParticipanteProgramaCreate, current_user = Depends(get_current_active_admin)):
    """Asignar un participante a un programa"""
    return asignar_participante_programa(pp.id_participante, pp.id_programa)

@router.delete("/remover-participante")
def remover_participante(pp: ParticipanteProgramaCreate, current_user = Depends(get_current_active_admin)):
    """Remover un participante de un programa"""
    return remover_participante_programa(pp.id_participante, pp.id_programa)