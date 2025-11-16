from db import connection
from pydantic import BaseModel
from typing import Optional

class FacultadCreate(BaseModel):
    nombre: str

class FacultadUpdate(BaseModel):
    nombre: Optional[str] = None

def crear_facultad(f):
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)

    cursor.execute("INSERT INTO facultad (nombre) VALUES (%s)", (f.nombre,))
    cnx.commit()

    cursor.close()
    cnx.close()
    return {"message": "Facultad creada"}

def listar_facultades():
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)

    cursor.execute("SELECT * FROM facultad")
    data = cursor.fetchall()

    cursor.close()
    cnx.close()
    return data

def obtener_facultad(id_facultad):
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)

    cursor.execute("SELECT * FROM facultad WHERE id=%s", (id_facultad,))
    data = cursor.fetchone()

    cursor.close()
    cnx.close()
    return data

def actualizar_facultad(id_facultad, f):
    cnx = connection()
    cursor = cnx.cursor(dictionary=True)

    cursor.execute("UPDATE facultad SET nombre=%s WHERE id=%s", (f.nombre, id_facultad))
    cnx.commit()

    cursor.close()
    cnx.close()
    return {"message": "Facultad actualizada"}

def eliminar_facultad(id_facultad):
    cnx = connection()
    cursor = cnx.cursor()

    cursor.execute("DELETE FROM facultad WHERE id=%s", (id_facultad,))
    cnx.commit()

    cursor.close()
    cnx.close()
    return {"message": "Facultad eliminada"}