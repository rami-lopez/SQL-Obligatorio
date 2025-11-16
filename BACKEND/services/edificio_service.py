from db import connection
from pydantic import BaseModel
from typing import Optional

class EdificioCreate(BaseModel):
    nombre: str
    direccion: Optional[str] = None
    departamento: Optional[str] = None

class EdificioUpdate(BaseModel):
    nombre: Optional[str] = None
    direccion: Optional[str] = None
    departamento: Optional[str] = None

def crear_edificio(e):
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)

    query = """
        INSERT INTO edificio (nombre, direccion, departamento)
        VALUES (%s, %s, %s)
    """
    cursor.execute(query, (e.nombre, e.direccion, e.departamento))
    cnx.commit()

    cursor.close()
    cnx.close()
    return {"message": "Edificio creado"}

def listar_edificios():
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)

    cursor.execute("SELECT * FROM edificio")
    data = cursor.fetchall()

    cursor.close()
    cnx.close()
    return data

def obtener_edificio(id_edificio):
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)

    cursor.execute("SELECT * FROM edificio WHERE id = %s", (id_edificio,))
    data = cursor.fetchone()

    cursor.close()
    cnx.close()
    return data

def actualizar_edificio(id_edificio, e):
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)

    query = """
        UPDATE edificio SET nombre=%s, direccion=%s, departamento=%s
        WHERE id=%s
    """
    cursor.execute(query, (e.nombre, e.direccion, e.departamento, id_edificio))
    cnx.commit()

    cursor.close()
    cnx.close()
    return {"message": "Edificio actualizado"}

def eliminar_edificio(id_edificio):
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)

    cursor.execute("DELETE FROM edificio WHERE id=%s", (id_edificio,))
    cnx.commit()

    cursor.close()
    cnx.close()
    return {"message": "Edificio eliminado"}
