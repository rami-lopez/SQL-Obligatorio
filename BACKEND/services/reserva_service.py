from fastapi import HTTPException
from db import execute_query, fetch_all
from models.reserva_model import ReservaUpdate, ReservaResponse
from services.validaciones import (
    validar_participante_sin_sancion,
    validar_limite_horas_diarias,
    validar_limite_reservas_semanales
)
from pydantic import BaseModel
from typing import List
from datetime import date

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
    reservasListadas = fetch_all("SELECT * FROM reserva")
    return reservasListadas

def obtener_reserva(id_reserva: int):
    """
    Obtiene una reserva por su ID.
    """
    reserva = fetch_all(
        "SELECT * FROM reserva WHERE id_reserva = %s",
        (id_reserva,)
    )
    if not reserva:
        raise HTTPException(404, detail="Reserva no encontrada")

    # primer elemento del fetch_all
    reserva = reserva[0]

    return ReservaResponse(**reserva) # el ** desempaqueta

def actualizar_reserva(id_reserva: int, r: ReservaUpdate, id_participante: int):
    """
    Actualiza una reserva.
    """
    reserva = fetch_all(
        "SELECT * FROM reserva WHERE id_reserva = %s",
        (id_reserva,)
    )

    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")

    reserva_db = reserva[0]

    # verificar permisos (solo el creador puede actualizar)
    # que sea distinto ya alcanza, la verificacion de si es el creador se hace desde el endpoint
    if reserva_db["creado_por"] != id_participante:
        raise HTTPException(
            status_code=403,
            detail="Solo el creador puede modificar esta reserva"
        )
    

    campos = []
    valores = []

    if r.id_sala is not None:
        campos.append("id_sala = %s")
        valores.append(r.id_sala)

    if r.fecha is not None:
        campos.append("fecha = %s")
        valores.append(r.fecha)

    if r.start_turn_id is not None:
        campos.append("start_turn_id = %s")
        valores.append(r.start_turn_id)

    if r.end_turn_id is not None:
        campos.append("end_turn_id = %s")
        valores.append(r.end_turn_id)

    if r.estado is not None:
        campos.append("estado = %s")
        valores.append(r.estado)

    if r.creado_por is not None:
        campos.append("creado_por = %s")
        valores.append(r.creado_por)

    if not campos:
        raise HTTPException(status_code=400, detail="No se enviaron campos para actualizar")

    query = f"UPDATE reserva SET {', '.join(campos)} WHERE id_reserva = %s"
    valores.append(id_reserva)

    execute_query(query, tuple(valores))

    reservaAct = fetch_all(
        "SELECT * FROM reserva WHERE id_reserva = %s",
        (id_reserva,)
    )[0]

    return reservaAct


def cancelar_reserva(id_reserva: int, id_participante: int):
    """
    Cancela una reserva.
    """
    reserva = fetch_all(
        "SELECT * FROM reserva WHERE id_reserva = %s",
        (id_reserva,)
    )
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    reserva_db = reserva[0]

    # verificar permisos (solo el creador puede)
    # que sea distinto ya alcanza, la verificacion de si es el creador se hace desde el endpoint
    if reserva_db["creado_por"] != id_participante:
        raise HTTPException(
            status_code=403,
            detail="Solo el creador puede modificar esta reserva"
        )
    execute_query(
        "DELETE FROM reserva WHERE id_reserva = %s",
        (id_reserva,)
    )
    return {"message": "Reserva cancelada"}

def confirmar_participacion(id_reserva: int, id_participante: int):
    """
    Confirma la participación en una reserva.
    """
    # verifico si existe el participante
    participante = fetch_all(
        "SELECT * FROM participante WHERE id_participante = %s",
        (id_participante,)
    )
    if not participante:
        raise HTTPException(status_code=404, detail="Participante no existe")
    
    # verifico si existe la reserva
    reserva = fetch_all(
        "SELECT * FROM programas WHERE id_programa = %s",
        (id_reserva,)
    )
    if not reserva:
        raise HTTPException(status_code=404, detail="Reserva no existe")
    
    # ver si ya estan relacionados
    existe = fetch_all(
        #como verifico si una reserva incluye al participante si no es el creador??????????
        """
        SELECT * FROM reserva
        WHERE creado_por = %s AND id_reserva = %s
        """,
        (id_participante, id_reserva)
    )
    if not existe:
        raise HTTPException(status_code=409, detail="El participante no está asignado a esta reserva")
    
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