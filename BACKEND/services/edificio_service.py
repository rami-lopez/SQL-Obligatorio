from http.client import HTTPException
from db import fetch_all, execute_query
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

def crear_edificio(e: EdificioCreate):
    existente = fetch_all("SELECT * FROM edificio WHERE nombre = %s", (e.nombre,))
    if existente:
        raise HTTPException(status_code=409, detail="Ya existe un edificio con ese nombre")

    query = """
        INSERT INTO edificio (nombre, direccion, departamento)
        VALUES (%s, %s, %s)
    """
    execute_query(query, (e.nombre, e.direccion, e.departamento))

    return {"message": "Edificio creado"}


def listar_edificios():
    return fetch_all("SELECT * FROM edificio")

def obtener_edificio(id_edificio: int):
    data = fetch_all("SELECT * FROM edificio WHERE id = %s", (id_edificio,))
    if not data:
        raise HTTPException(status_code=404, detail="Edificio no encontrado")

    return data[0]

def actualizar_edificio(id_edificio: int, e: EdificioUpdate):
    edificio = fetch_all("SELECT * FROM edificio WHERE id = %s", (id_edificio,))
    if not edificio:
        raise HTTPException(status_code=404, detail="Edificio no encontrado")

    campos = []
    valores = []

    if e.nombre is not None:
        campos.append("nombre = %s")
        valores.append(e.nombre)

    if e.direccion is not None:
        campos.append("direccion = %s")
        valores.append(e.direccion)

    if e.departamento is not None:
        campos.append("departamento = %s")
        valores.append(e.departamento)

    if not campos:
        raise HTTPException(status_code=400, detail="No se enviaron datos para actualizar")

    query = f"UPDATE edificio SET {', '.join(campos)} WHERE id = %s"
    valores.append(id_edificio)

    execute_query(query, tuple(valores))

    return {"message": "Edificio actualizado"}


def eliminar_edificio(id_edificio: int):
    edificio = fetch_all("SELECT * FROM edificio WHERE id = %s", (id_edificio,))
    if not edificio:
        raise HTTPException(status_code=404, detail="Edificio no encontrado")

    execute_query("DELETE FROM edificio WHERE id = %s", (id_edificio,))
    return {"message": "Edificio eliminado"}

