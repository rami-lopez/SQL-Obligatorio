import mysql.connector
import os

def connection():
    cnx = mysql.connector.connect(
        user=os.getenv("DB_USER","root"),  
        password=os.getenv("DB_PASSWORD","root"),
        host=os.getenv("DB_HOST","localhost"),
        database=os.getenv("DB_NAME","reserva_salas")

        # o similar
    )
    return cnx

def fetch_all(query, params=None):
    conn = connection()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(query, params or ())
        return cur.fetchall()
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

