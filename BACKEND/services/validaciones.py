from datetime import date, timedelta
from fastapi import HTTPException
from db import fetch_all

def validar_participante_sin_sancion(ci_participante: int):
    query = """
        SELECT COUNT(*) AS total
        FROM sancion_participante
        WHERE ci_participante = %s
          AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
    """
    resultado = fetch_all(query, (ci_participante,))
    if resultado[0]["total"] > 0:
        raise HTTPException(status_code=400, detail="El participante tiene una sanción vigente")

def validar_limite_horas_diarias(ci_participante: int, fecha: date, horas_a_reservar: int):
    query = """
        SELECT COALESCE(SUM(r.end_turn_id - r.start_turn_id + 1), 0) AS horas_reservadas
        FROM reserva r
        JOIN reserva_participante rp ON rp.id_reserva = r.id_reserva
        WHERE rp.id_participante = %s
          AND r.fecha = %s
          AND r.estado IN ('activa', 'confirmada')
    """
    resultado = fetch_all(query, (ci_participante, fecha))
    horas_existentes = resultado[0]["horas_reservadas"]

    if horas_existentes + horas_a_reservar > 2:
        raise HTTPException(status_code=400, detail="Excede el límite diario de 2 horas en salas libres")


def validar_limite_reservas_semanales(ci_participante: int, fecha_reserva: date):
    dia_semana = fecha_reserva.weekday()  # lunes=0
    inicio_semana = fecha_reserva - timedelta(days=dia_semana)
    fin_semana = inicio_semana + timedelta(days=6)

    query = """
        SELECT COUNT(*) AS total
        FROM reserva r
        JOIN reserva_participante rp ON rp.id_reserva = r.id_reserva
        WHERE rp.id_participante = %s
          AND r.fecha BETWEEN %s AND %s
          AND r.estado IN ('activa', 'confirmada')
    """
    resultado = fetch_all(query, (ci_participante, inicio_semana, fin_semana))
    reservas_activas = resultado[0]["total"]

    if reservas_activas >= 3:
        raise HTTPException(status_code=400, detail="Ya tiene 3 reservas activas en esta semana")


def validar_disponibilidad_sala(id_sala: int, fecha: date, start_turn_id: int, end_turn_id: int):
    query = """
        SELECT COUNT(*) AS total
        FROM reserva
        WHERE id_sala = %s
          AND fecha = %s
          AND NOT (end_turn_id < %s OR start_turn_id > %s)
          AND estado IN ('activa', 'confirmada')
    """
    resultado = fetch_all(query, (id_sala, fecha, start_turn_id, end_turn_id))
    if resultado[0]["total"] > 0:
        raise HTTPException(status_code=400, detail="La sala ya está reservada en ese horario")


def validar_tipo_sala_y_participante(id_sala: int, ci_participante: int):
    query_sala = "SELECT tipo_sala FROM sala WHERE id_sala = %s"
    sala = fetch_all(query_sala, (id_sala,))
    if not sala:
        raise HTTPException(status_code=404, detail="Sala no encontrada")
    tipo_sala = sala[0]["tipo_sala"]

    query_prog = """
        SELECT pa.tipo
        FROM participante_programa_academico ppa
        JOIN programa_academico pa ON ppa.id_programa = pa.id_programa
        WHERE ppa.ci_participante = %s
        LIMIT 1
    """
    prog = fetch_all(query_prog, (ci_participante,))
    if not prog:
        raise HTTPException(status_code=400, detail="El participante no tiene programa académico asociado")
    tipo_prog = prog[0]["tipo"]

    if tipo_sala == "posgrado" and tipo_prog != "posgrado":
        raise HTTPException(status_code=400, detail="Solo participantes de posgrado pueden reservar esta sala")
    if tipo_sala == "docente":

        query_doc = """
            SELECT COUNT(*) as total
            FROM participante_programa_academico
            WHERE ci_participante = %s AND rol = 'docente'
        """
        doc = fetch_all(query_doc, (ci_participante,))
        if doc[0]["total"] == 0:
            raise HTTPException(status_code=400, detail="Solo docentes pueden reservar esta sala")
