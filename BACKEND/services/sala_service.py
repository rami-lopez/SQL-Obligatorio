from db import execute_query, fetch_all
from models.sala_model import SalaCreate, SalaUpdate
from datetime import date

def crear_sala(s: SalaCreate):
    """
    Crea una nueva sala.
    """
    return {}

def listar_salas():
    """
    Lista todas las salas.
    """
    return []

def obtener_sala(id_sala: int):
    """
    Obtiene una sala por su ID.
    """
    return {}

def actualizar_sala(id_sala: int, s: SalaUpdate):
    """
    Actualiza una sala.
    """
    return {}

def eliminar_sala(id_sala: int):
    """
    Elimina una sala.
    """
    return {"message": "Sala eliminada"}

def listar_salas_disponibles(fecha: date, start_turn_id: int, end_turn_id: int):
    """
    Lista las salas disponibles para una fecha y horario específico.
    """
    return []
