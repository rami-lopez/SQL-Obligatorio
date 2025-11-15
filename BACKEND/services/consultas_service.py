from db import fetch_all


def salas_mas_reservadas(limit=int):
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.id_sala, s.nombre, COUNT(r.id_reserva) AS cantidad
        FROM reserva r
        JOIN sala s ON s.id_sala = r.id_sala
        GROUP BY s.id_sala
        ORDER BY cantidad DESC
        LIMIT %s;
    """, (limit,))
    datos = cursor.fetchall()
    cnx.close()
    return datos

def turnos_mas_demandados():
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT t.id_turno, t.nombre, COUNT(r.id_reserva) AS cantidad
        FROM reserva r
        JOIN turno t ON t.id_turno = r.start_turn_id
        GROUP BY t.id_turno
        ORDER BY cantidad DESC;
    """)
    datos = cursor.fetchall()
    cnx.close()
    return datos

def promedio_participantes_por_sala():
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.id_sala, s.nombre, AVG(r.cant_participantes) AS promedio
        FROM reserva r
        JOIN sala s ON s.id_sala = r.id_sala
        GROUP BY s.id_sala;
    """)
    datos = cursor.fetchall()
    cnx.close()
    return datos

def reservas_por_carrera_facultad():
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT f.nombre AS facultad, c.nombre AS carrera, COUNT(r.id_reserva) AS reservas
        FROM reserva r
        JOIN participante p ON p.id_participante = r.id_creador
        JOIN carrera c ON c.id_carrera = p.id_carrera
        JOIN facultad f ON f.id_facultad = c.id_facultad
        GROUP BY f.id_facultad, c.id_carrera;
    """)
    datos = cursor.fetchall()
    cnx.close()
    return datos

def ocupacion_salas_por_edificio():
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT e.id_edificio, e.nombre,
               COUNT(r.id_reserva) AS reservas
        FROM sala s
        JOIN edificio e ON e.id_edificio = s.id_edificio
        LEFT JOIN reserva r ON r.id_sala = s.id_sala
        GROUP BY e.id_edificio;
    """)
    datos = cursor.fetchall()
    cnx.close()
    return datos

def reservas_asistencias_por_rol():
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.rol, 
               COUNT(r.id_reserva) AS reservas,
               SUM(CASE WHEN r.asistencia_confirmada = 1 THEN 1 ELSE 0 END) AS asistencias
        FROM reserva r
        JOIN participante p ON p.id_participante = r.id_creador
        GROUP BY p.rol;
    """)
    datos = cursor.fetchall()
    cnx.close()
    return datos

def sanciones_por_rol():
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.rol, COUNT(s.id_sancion) AS sanciones
        FROM sancion s
        JOIN participante p ON p.id_participante = s.id_participante
        GROUP BY p.rol;
    """)
    datos = cursor.fetchall()
    cnx.close()
    return datos

def porcentaje_reservas_utilizadas():
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN asistencia_confirmada = 1 THEN 1 END) / COUNT(*) * 100 AS porcentaje
        FROM reserva;
    """)
    datos = cursor.fetchone()
    cnx.close()
    return datos

def reservas_por_dia_semana():
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT DAYNAME(fecha) AS dia, COUNT(*) AS reservas
        FROM reserva
        GROUP BY dia;
    """)
    datos = cursor.fetchall()
    cnx.close()
    return datos

def salas_menos_utilizadas(limit):
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT s.id_sala, s.nombre, COUNT(r.id_reserva) AS reservas
        FROM sala s
        LEFT JOIN reserva r ON r.id_sala = s.id_sala
        GROUP BY s.id_sala
        ORDER BY reservas ASC
        LIMIT %s;
    """, (limit,))
    datos = cursor.fetchall()
    cnx.close()
    return datos

def participantes_mas_activos(limit):
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)
    cursor.execute("""
        SELECT p.id_participante, p.nombre, COUNT(r.id_reserva) AS reservas
        FROM participante p
        JOIN reserva r ON r.id_creador = p.id_participante
        GROUP BY p.id_participante
        ORDER BY reservas DESC
        LIMIT %s;
    """, (limit,))
    datos = cursor.fetchall()
    cnx.close()
    return datos
