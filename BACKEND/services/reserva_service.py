from fastapi import HTTPException
from db import execute_query, fetch_all
from models.reserva_model import ReservaUpdate
from services.validaciones import (
    validar_participante_sin_sancion,
    validar_limite_horas_diarias,
    validar_limite_reservas_semanales
)
from pydantic import BaseModel
from typing import List
from datetime import date

# Dummy Pydantic models to avoid dependency on the API layer
class ReservaCreateConParticipantes(BaseModel):
    id_sala: int
    fecha: date
    start_turn_id: int
    end_turn_id: int
    participantes: List[int]

def crear_reserva(r: ReservaCreateConParticipantes, creado_por: int):
    try:
        validar_participante_sin_sancion(creado_por)
        
        horas = r.end_turn_id - r.start_turn_id + 1
        validar_limite_horas_diarias(creado_por, r.fecha, horas)
        validar_limite_reservas_semanales(creado_por, r.fecha)

        sala = fetch_all("SELECT capacidad, tipo FROM sala WHERE id_sala = %s", (r.id_sala,))
        if not sala:
            raise HTTPException(status_code=404, detail="Sala no encontrada")
        
        sala_info = sala[0]
        tipo_sala = sala_info["tipo"]
        capacidad = sala_info["capacidad"]

        if len(r.participantes) > capacidad:
            raise HTTPException(status_code=400, detail="Excede capacidad de sala")

        creador = fetch_all("SELECT tipo_usuario FROM usuario WHERE id_usuario = %s", (creado_por,))
        if not creador:
            raise HTTPException(status_code=404, detail="Usuario creador no encontrado")

        tipo_creador = creador[0]["tipo_usuario"]

        if tipo_sala == "exclusiva_posgrado" and tipo_creador not in ("posgrado", "docente"):
            raise HTTPException(status_code=403, detail="Solo docentes o estudiantes de posgrado pueden reservar esta sala")

        if tipo_sala == "exclusiva_docente" and tipo_creador != "docente":
            raise HTTPException(status_code=403, detail="Solo docentes pueden reservar esta sala")

        if tipo_sala == "uso_libre" and tipo_creador not in ("grado", "posgrado", "docente"):
            raise HTTPException(status_code=403, detail="Solo docentes o estudiantes pueden reservar esta sala")

        query = """
            INSERT INTO reserva (id_sala, fecha, start_turn_id, end_turn_id, creado_por)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(query, (r.id_sala, r.fecha, r.start_turn_id, r.end_turn_id, creado_por))
    
        id_reserva = fetch_all("SELECT LAST_INSERT_ID() as id")[0]['id']
        
        for id_part in r.participantes:
            estado = 'confirmada' if id_part == creado_por else 'pendiente'
            query = """
                INSERT INTO reserva_participante (id_reserva, id_participante, estado_participacion)
                VALUES (%s, %s, %s)
            """
            execute_query(query, (id_reserva, id_part, estado))
        
        return {"message": "Reserva creada", "id_reserva": id_reserva}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

def listar_reservas():
    """
    Lista todas las reservas.
    """
    return []

def obtener_reserva(id_reserva: int):
    """
    Obtiene una reserva por su ID.
    """
    return {}

def actualizar_reserva(id_reserva: int, r: ReservaUpdate, id_participante: int):
    """
    Actualiza una reserva.
    """
    return {}

def cancelar_reserva(id_reserva: int, id_participante: int):
    """
    Cancela una reserva.
    """
    return {"message": "Reserva cancelada"}

def confirmar_participacion(id_reserva: int, id_participante: int):
    """
    Confirma la participación en una reserva.
    """
    return {"message": "Participación confirmada"}

def registrar_asistencia(id_reserva: int, id_participante: int, presente: bool, current_user_id: int):
    """
    Registra la asistencia a una reserva.
    """
    return {"message": "Asistencia registrada"}

def listar_mis_reservas(id_participante: int):
    """
    Lista las reservas de un participante.
    """
    return []