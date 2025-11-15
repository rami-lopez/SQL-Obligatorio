from db import execute_query, fetch_all
from pydantic import BaseModel
from typing import Optional

# Dummy Pydantic models to avoid dependency on the API layer
class FacultadCreate(BaseModel):
    nombre: str

class FacultadUpdate(BaseModel):
    nombre: Optional[str] = None

def crear_facultad(f: FacultadCreate):
    """
    Crea una nueva facultad.
    """
    return {}

def listar_facultades():
    """
    Lista todas las facultades.
    """
    return []

def obtener_facultad(id_facultad: int):
    """
    Obtiene una facultad por su ID.
    """
    return {}

def actualizar_facultad(id_facultad: int, f: FacultadUpdate):
    """
    Actualiza una facultad.
    """
    return {}

def eliminar_facultad(id_facultad: int):
    """
    Elimina una facultad.
    """
    return {"message": "Facultad eliminada"}
