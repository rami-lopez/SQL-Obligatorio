from db import execute_query, fetch_all
from models.programa_model import ProgramaCreate, ProgramaUpdate

def crear_programa(p: ProgramaCreate):
    """
    Crea un nuevo programa académico.
    """
    return {}

def listar_programas():
    """
    Lista todos los programas académicos.
    """
    return []

def obtener_programa(id_programa: int):
    """
    Obtiene un programa académico por su ID.
    """
    return {}

def actualizar_programa(id_programa: int, p: ProgramaUpdate):
    """
    Actualiza un programa académico.
    """
    return {}

def eliminar_programa(id_programa: int):
    """
    Elimina un programa académico.
    """
    return {"message": "Programa eliminado"}

def asignar_participante_programa(id_participante: int, id_programa: int):
    """
    Asigna un participante a un programa académico.
    """
    return {"message": "Participante asignado al programa"}

def remover_participante_programa(id_participante: int, id_programa: int):
    """
    Remueve un participante de un programa académico.
    """
    return {"message": "Participante removido del programa"}
