import os
import mysql.connector
from context import userRol

def _get_env(name, required=True, default=None):
    val = os.getenv(name, default)
    if required and (val is None or val == ""):
        raise RuntimeError(f"Falta la variable de entorno: {name}")
    return val

def connection():
    rol = userRol.get()
    print(f"Conectando a la base de datos con rol: {rol}")
    host = os.getenv("DB_HOST", "localhost")
    port = int(os.getenv("DB_PORT", 3306))
    db = os.getenv("DB_NAME", "reserva_salas")

    if rol == 'admin':
        user = _get_env("DB_USER_ADMIN", required=True)
        pwd  = _get_env("DB_PASSWORD_ADMIN", required=True)
    elif rol == 'login':
        user = _get_env("DB_USER_LOGIN", required=True)
        pwd  = _get_env("DB_PASSWORD_LOGIN", required=True)
    elif rol == 'user':
        user = _get_env("DB_USER_USER", required=True)
        pwd  = _get_env("DB_PASSWORD_USER", required=True)
    else:
        raise Exception("No se seteó userRol antes de llamar a connection()")

    cnx = mysql.connector.connect(
        user=user,
        password=pwd,
        host=host,
        port=port,
        database=db,
        autocommit=False
    )
    return cnx

def fetch_all(query, params=None):
    conn = connection()
    print(f"Ejecutando consulta: {query} con params: {params}")
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(query, params or ())
        results = cur.fetchall()
        print(f"Resultado de consulta: {results}")
        return results
    finally:
        cur.close()
        conn.close()

def execute_query(query, params=None):
    conn = connection()
    try:
        cur = conn.cursor()
        cur.execute(query, params or ())
        conn.commit()
        return cur.lastrowid
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()

def execute_many_queries(query, params_list):
    conn = connection()
    try:
        cur = conn.cursor()
        cur.executemany(query, params_list)
        conn.commit()
        return cur.rowcount
    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()
