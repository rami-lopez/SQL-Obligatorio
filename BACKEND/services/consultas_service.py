from http.client import HTTPException
from db import fetch_all

def salas_mas_reservadas(limit=int):
    salas = fetch_all("""
        SELECT s.id_sala, s.nombre, COUNT(r.id_reserva) AS cantidad
        FROM reserva r
        JOIN sala s ON s.id_sala = r.id_sala
        GROUP BY s.id_sala
        ORDER BY cantidad DESC
        LIMIT %s;
    """, (limit,))

    if not salas:
        raise HTTPException(
            status_code=409,
            detail="Todavia no hay salas reservadas"
        )

    return salas

def turnos_mas_demandados():
    turnos = fetch_all("""
        SELECT t.id_turno, t.descripcion, COUNT(r.id_reserva) AS cantidad
        FROM reserva r
        JOIN turno t ON t.id_turno = r.start_turn_id
        GROUP BY t.id_turno
        ORDER BY cantidad DESC;
    """)
    if not turnos:
        raise HTTPException(
            status_code=409,
            detail="Todavia no hay turnos reservados"
        )
    return turnos

def promedio_participantes_por_sala():
    promedio = fetch_all("""
        SELECT s.id_sala,
               s.nombre,
               ROUND(AVG(COALESCE(rp.participantes, 0)), 2) AS promedio
        FROM sala s
        LEFT JOIN reserva r ON r.id_sala = s.id_sala
        LEFT JOIN (
            SELECT id_reserva, COUNT(*) AS participantes
            FROM reserva_participante
            GROUP BY id_reserva
        ) rp ON rp.id_reserva = r.id_reserva
        GROUP BY s.id_sala, s.nombre
        ORDER BY promedio DESC;
    """)
    if not promedio:
        raise HTTPException(
            status_code=409,
            detail="Error en los promedios"
        )
    return promedio

def reservas_por_carrera_facultad():
    reservasPorCarrera = fetch_all("""
        SELECT f.nombre AS facultad, c.nombre AS carrera, COUNT(r.id_reserva) AS reservas
        FROM reserva r
        JOIN participante_programa p ON p.id_participante = r.creado_por
        JOIN programa_academico c ON c.id_programa = p.id_programa
        JOIN facultad f ON f.id_facultad = c.id_facultad
        GROUP BY f.id_facultad, c.id_programa;
    """)
    if not reservasPorCarrera:
        raise HTTPException(
            status_code=409,
            detail="Error en las reservas por carrera"
        )
    return reservasPorCarrera

def ocupacion_salas_por_edificio():
    ocupacion = fetch_all("""
        SELECT e.id_edificio, e.nombre,
               COUNT(r.id_reserva) AS reservas
        FROM sala s
        JOIN edificio e ON e.id_edificio = s.id_edificio
        LEFT JOIN reserva r ON r.id_sala = s.id_sala
        GROUP BY e.id_edificio;
    """)
    if not ocupacion:
        raise HTTPException(
            status_code=409,
            detail="Error verificando la ocupacion de salas por edificio"
        )
    return ocupacion

def reservas_asistencias_por_rol():
    reservaAsistencia = fetch_all("""
        SELECT p.rol, 
               SUM(CASE WHEN r.estado_participacion = 'confirmada' THEN 1 ELSE 0 END) AS reservas_confirmadas,
               SUM(CASE WHEN r.asistencia = 'presente' THEN 1 ELSE 0 END) AS asistencias
        FROM reserva_participante r
        JOIN participante p ON p.id_participante = r.id_participante
        GROUP BY p.rol;
    """)
    if not reservaAsistencia:
        raise HTTPException(
            status_code=409,
            detail="Error verificando las asistencias por rol en las reservas"
        )
    return reservaAsistencia

def sanciones_por_rol():
    sancionesRol = fetch_all("""
        SELECT
            SUM(CASE WHEN p.rol = 'docente' THEN 1 ELSE 0 END) AS docentes,
            SUM(CASE WHEN p.rol IN ('alumno_grado','alumno_posgrado') THEN 1 ELSE 0 END) AS alumnos
        FROM sancion_participante s
        JOIN participante p ON p.id_participante = s.id_participante
        WHERE p.rol IN ('docente','alumno_grado','alumno_posgrado');
    """)
    if not sancionesRol:
        raise HTTPException(
            status_code=409,
            detail="Error verificando las sanciones por rol"
        )
    return sancionesRol

def porcentaje_reservas_utilizadas():
    porcentaje = fetch_all("""
        SELECT
            
                100.0 * SUM(CASE WHEN estado NOT IN ('no_asistencia','cancelada') THEN 1 ELSE 0 END)
                / COUNT(*) 
             AS porcentaje
        FROM reserva;
    """)
    if not porcentaje:
        raise HTTPException(
            status_code=409,
            detail="Error verificando el porcentaje de las reservas utilizadas"
        )
    return porcentaje

def reservas_por_dia_semana():
    reservasDias = fetch_all("""
        SELECT DAYNAME(fecha) AS dia, COUNT(*) AS reservas
        FROM reserva
        GROUP BY dia;
    """)
    if not reservasDias:
        raise HTTPException(
            status_code=409,
            detail="Error verificando la cantidad de reservas por dia a la semana"
        )
    return reservasDias

def salas_menos_utilizadas(limit):
    salasMenos = fetch_all("""
        SELECT s.id_sala, s.nombre, COUNT(r.id_reserva) AS reservas
        FROM sala s
        LEFT JOIN reserva r ON r.id_sala = s.id_sala
        GROUP BY s.id_sala
        ORDER BY reservas ASC
        LIMIT %s;
    """, (limit,))
    if not salasMenos:
        raise HTTPException(
            status_code=409,
            detail="Error verificando las salas menos utilizadas"
        )
    return salasMenos

def participantes_mas_activos(limit):
    participantesMasActivos = fetch_all("""
        SELECT p.id_participante, p.nombre, COUNT(r.id_reserva) AS reservas
        FROM participante p
        JOIN reserva r ON r.creado_por = p.id_participante
        GROUP BY p.id_participante
        ORDER BY reservas DESC
        LIMIT %s;
    """, (limit,))
    if not participantesMasActivos:
        raise HTTPException(
            status_code=409,
            detail="Error verificando los participantes mas activos"
        )
    return participantesMasActivos
