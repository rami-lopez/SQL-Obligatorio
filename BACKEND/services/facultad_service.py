from http.client import HTTPException
from db import fetch_all, execute_query
from pydantic import BaseModel
from typing import Optional

class FacultadCreate(BaseModel):
    nombre: str

class FacultadUpdate(BaseModel):
    nombre: Optional[str] = None

def crear_facultad(f: FacultadCreate):
    facultad = fetch_all(
        "SELECT * FROM facultad WHERE nombre = %s",
        (f.nombre)
    )

    if facultad:
        raise HTTPException(
            status_code=409,
            detail="Ya existe una facultad con ese nombre"
        )
    execute_query(
        "INSERT INTO facultad (nombre) VALUES (%s)",
        (f.nombre,)
    )
    return {"message": "Facultad creada"}



def listar_facultades():
    return fetch_all("SELECT * FROM facultad")

def obtener_facultad(id_facultad: int):
    result = fetch_all(
        "SELECT * FROM facultad WHERE id = %s",
        (id_facultad,)
    )

    if not result:
        raise HTTPException(status_code=404, detail="Facultad no encontrada")

    return result[0]

def actualizar_facultad(id_facultad: int, f: FacultadUpdate):

    # validar existencia
    facultad = fetch_all(
        "SELECT * FROM facultad WHERE id = %s",
        (id_facultad,)
    )
    if not facultad:
        raise HTTPException(status_code=404, detail="Facultad no encontrada")

    campos = []
    valores = []

    if f.nombre is not None:
        campos.append("nombre = %s")
        valores.append(f.nombre)

    if not campos:
        raise HTTPException(status_code=400, detail="No hay campos para actualizar")

    query = f"UPDATE facultad SET {', '.join(campos)} WHERE id = %s"
    valores.append(id_facultad)

    execute_query(query, tuple(valores))

    return {"message": "Facultad actualizada"}


def eliminar_facultad(id_facultad: int):
    # verificar si existe
    facultad = fetch_all(
        "SELECT * FROM facultad WHERE id = %s",
        (id_facultad,)
    )
    if not facultad:
        raise HTTPException(status_code=404, detail="Facultad no encontrada")

    execute_query("DELETE FROM facultad WHERE id = %s", (id_facultad,))
    return {"message": "Facultad eliminada"}

