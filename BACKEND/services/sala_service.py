from http.client import HTTPException
from db import execute_query, fetch_all
from models.sala_model import SalaCreate, SalaResponse, SalaUpdate
from datetime import date

def crear_sala(s: SalaCreate):
    """
    Crea una nueva sala.
    """
    # verifico si ya existe sala
    sala = fetch_all(
        "SELECT * FROM sala WHERE id_edificio = %s AND nombre = %s",
        (s.id_edificio, s.nombre)
    )

    if sala:
        raise HTTPException(
            status_code=409,
            detail="Ya existe una sala con ese nombre en ese edificio"
        )
    
    # no existe, insertoo
    execute_query(
        "INSERT INTO sala (id_edificio, nombre, tipo, capacidad) VALUES (%s, %s, %s, %s)",
        (s.id_edificio, s.nombre, s.tipo, s.capacidad)
    )

    return {"message": "Sala creada correctamente"}

def listar_salas():
    """
    Lista todas las salas.
    """
    salasListadas = fetch_all(" SELECT * FROM sala")
    return salasListadas

def obtener_sala(id_sala: int):
    """
    Obtiene una sala por su ID.
    """
    sala = fetch_all(
        "SELECT * FROM sala WHERE id_sala = %s",
        (id_sala,)
    )
    if not sala:
        raise HTTPException(404, detail="Sala no encontrada")

    # primer elemento del fetch_all
    sala = sala[0]

    return SalaResponse(**sala) # el ** desempaqueta


def actualizar_sala(id_sala: int, s: SalaUpdate):
    """
    Actualiza una sala.
    """
    sala_existente = fetch_all(
        "SELECT * FROM sala WHERE id_sala = %s",
        (id_sala,)
    )
    if not sala_existente:
        raise HTTPException(status_code=404, detail="Sala no encontrada")
    
    # ver que se quiere cambiar
    campos = []
    valores = []
    if s.id_edificio is not None:
        campos.append("id_edificio = %s")
        valores.append(s.id_edificio)

    if s.nombre is not None:
        campos.append("nombre = %s")
        valores.append(s.nombre)

    if s.tipo is not None:
        campos.append("tipo = %s")
        valores.append(s.tipo)

    if s.capacidad is not None:
        campos.append("capacidad = %s")
        valores.append(s.capacidad)

    if not campos:
        raise HTTPException(status_code=400, detail="No se enviaron campos para actualizar")
    
    query = f"UPDATE sala SET {', '.join(campos)} WHERE id_sala = %s"
    valores.append(id_sala)

    execute_query(query, tuple(valores))

    sala_actualizada = fetch_all(
        "SELECT * FROM sala WHERE id_sala = %s",
        (id_sala,)
    )[0]

    return sala_actualizada

def eliminar_sala(id_sala: int):
    """
    Elimina una sala.
    """
    sala = fetch_all(
        "SELECT * FROM sala WHERE id_sala = %s",
        (id_sala,)
    )
    if not sala:
        raise HTTPException(404, detail="Sala no encontrada")
    
    execute_query(
        "DELETE FROM sala WHERE id_sala = %s",
        (id_sala,)
    )

    return {"message": "Sala borrada correctamente"}

def listar_salas_disponibles(fecha: date, start_turn_id: int, end_turn_id: int):
    """
    Lista las salas disponibles para una fecha y horario específico.
    """
    query = """
        SELECT *
        FROM sala s
        WHERE s.id_sala NOT IN (
            SELECT r.id_sala
            FROM reserva r
            WHERE r.fecha = %s
              AND r.turno_inicio <= %s
              AND r.turno_fin >= %s
        )
    """
    params = (fecha, end_turn_id, start_turn_id)
    salas_libres = fetch_all(query, params)

    return salas_libres
