from fastapi import APIRouter, HTTPException, status, Depends
from pydantic import BaseModel
from typing import Optional
from services.edificio_service import (
    crear_edificio,
    listar_edificios,
    obtener_edificio,
    actualizar_edificio,
    eliminar_edificio
)
from api.auth import get_current_active_admin, get_current_user

router = APIRouter(prefix="/edificios", tags=["edificio"])

class EdificioCreate(BaseModel):
    nombre: str
    direccion: Optional[str] = None
    departamento: Optional[str] = None

class EdificioUpdate(BaseModel):
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    departamento: Optional[str] = None

@router.post("/", status_code=status.HTTP_201_CREATED)
def create(e: EdificioCreate, current_user = Depends(get_current_active_admin)):
    """Solo admin puede crear edificios"""
    return crear_edificio(e)

@router.get("/")
def list_all(current_user = Depends(get_current_user)):
    """Listar todos los edificios"""
    return listar_edificios()

@router.get("/{id_edificio}")
def get_one(id_edificio: int, current_user = Depends(get_current_user)):
    """Obtener un edificio por ID"""
    return obtener_edificio(id_edificio)

@router.put("/{id_edificio}")
def update(id_edificio: int, e: EdificioUpdate, current_user = Depends(get_current_active_admin)):
    """Actualizar edificio"""
    return actualizar_edificio(id_edificio, e)

@router.delete("/{id_edificio}")
def delete(id_edificio: int, current_user = Depends(get_current_active_admin)):
    """Eliminar edificio"""
    return eliminar_edificio(id_edificio)