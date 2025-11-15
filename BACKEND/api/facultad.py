from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
from services.facultad_service import (
    crear_facultad,
    listar_facultades,
    obtener_facultad,
    actualizar_facultad,
    eliminar_facultad
)
from api.auth import get_current_active_admin, get_current_user

router = APIRouter(prefix="/facultades", tags=["facultad"])

class FacultadCreate(BaseModel):
    nombre: str

class FacultadUpdate(BaseModel):
    nombre: Optional[str] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create(f: FacultadCreate, current_user = Depends(get_current_active_admin)):
    """Solo admin puede crear facultades"""
    return crear_facultad(f)

@router.get("/")
def list_all(current_user = Depends(get_current_user)):
    """Listar todas las facultades"""
    return listar_facultades()

@router.get("/{id_facultad}")
def get_one(id_facultad: int, current_user = Depends(get_current_user)):
    """Obtener una facultad por ID"""
    return obtener_facultad(id_facultad)

@router.put("/{id_facultad}")
def update(id_facultad: int, f: FacultadUpdate, current_user = Depends(get_current_active_admin)):
    """Actualizar facultad"""
    return actualizar_facultad(id_facultad, f)

@router.delete("/{id_facultad}")
def delete(id_facultad: int, current_user = Depends(get_current_active_admin)):
    """Eliminar facultad"""
    return eliminar_facultad(id_facultad)