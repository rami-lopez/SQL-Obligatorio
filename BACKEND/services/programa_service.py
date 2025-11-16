from http.client import HTTPException
from db import execute_query, fetch_all
from models.programa_model import ProgramaCreate, ProgramaUpdate, ProgramaResponse

def crear_programa(p: ProgramaCreate):
    """
    Crea un nuevo programa académico.
    """
    # verifico si ya existe sala
    programa = fetch_all(
        "SELECT * FROM programas WHERE id_facultad = %s AND nombre = %s",
        (p.id_facultad, p.nombre)
    )
    if programa:
        raise HTTPException(
            status_code=409,
            detail="Ya existe un programa con ese nombre"
        )
    # no existe, insertoo
    execute_query(
        "INSERT INTO programas (id_facultad, nombre, tipo) VALUES (%s, %s, %s)",
        (p.id_facultad, p.nombre, p.tipo)
    )

    return {"message": "Programa creado correctamente"}

def listar_programas():
    """
    Lista todos los programas académicos.
    """
    programasListados = fetch_all("SELECT * FROM programas")
    return programasListados

def obtener_programa(id_programa: int):
    """
    Obtiene un programa académico por su ID.
    """
    programa = fetch_all(
        "SELECT * FROM programas WHERE id_programa = %s",
        (id_programa,)
    )
    if not programa:
        raise HTTPException(404, detail="Programa no encontrado")

    # primer elemento del fetch_all
    programa = programa[0]

    return ProgramaResponse(**programa) # el ** desempaqueta

def actualizar_programa(id_programa: int, p: ProgramaUpdate):
    """
    Actualiza un programa académico.
    """
    programa = fetch_all(
        "SELECT * FROM programas WHERE id_programa = %s",
        (id_programa,)
    )
    if not programa:
        raise HTTPException(
            status_code=404,
            detail="Programa no encontrado"
        )
    # ver que se quiere cambiar
    campos = []
    valores = []
    if p.id_facultad is not None:
        campos.append("id_facultad = %s")
        valores.append(p.id_facultad)

    if p.nombre is not None:
        campos.append("nombre = %s")
        valores.append(p.nombre)

    if p.tipo is not None:
        campos.append("tipo = %s")
        valores.append(p.tipo)

    if not campos:
        raise HTTPException(status_code=400, detail="No se enviaron campos para actualizar")
    
    query = f"UPDATE programas SET {', '.join(campos)} WHERE id_sala = %s"
    valores.append(id_programa)

    execute_query(query, tuple(valores))

    # 5. Retornar la sala actualizada
    programa_actualizado = fetch_all(
        "SELECT * FROM programas WHERE id_programa = %s",
        (id_programa,)
    )[0]

    return programa_actualizado

def eliminar_programa(id_programa: int):
    """
    Elimina un programa académico.
    """
    programa = fetch_all(
        "SELECT * FROM programas WHERE id_programa = %s",
        (id_programa,)
    )
    if not programa:
        raise HTTPException(
            status_code=404,
            detail="Programa no encontrado"
        )
    
    execute_query(
        "DELETE FROM programas WHERE id_programa = %s",
        (id_programa,)
    )
    return {"message": "Programa eliminado"}

def asignar_participante_programa(id_participante: int, id_programa: int):
    """
    Asigna un participante a un programa académico.
    """
    # verifico si existe el participante
    participante = fetch_all(
        "SELECT * FROM participante WHERE id_participante = %s",
        (id_participante,)
    )
    if not participante:
        raise HTTPException(status_code=404, detail="Participante no existe")
    
    # verifico si existe el programa
    programa = fetch_all(
        "SELECT * FROM programas WHERE id_programa = %s",
        (id_programa,)
    )
    if not programa:
        raise HTTPException(status_code=404, detail="Programa no existe")
    
    # ver si ya estan relacionados
    existe = fetch_all(
        """
        SELECT * FROM participante_programa
        WHERE id_participante = %s AND id_programa = %s
        """,
        (id_participante, id_programa)
    )
    if existe:
        raise HTTPException(status_code=409, detail="El participante ya está asignado a este programa")
    
    execute_query(
        """
        INSERT INTO participante_programa (id_participante, id_programa)
        VALUES (%s, %s)
        """,
        (id_participante, id_programa)
    )
    return {"message": "Participante asignado al programa"}

def remover_participante_programa(id_participante: int, id_programa: int):
    """
    Remueve un participante de un programa académico.
    """
    # verifico si existe el participante
    participante = fetch_all(
        "SELECT * FROM participante WHERE id_participante = %s",
        (id_participante,)
    )
    if not participante:
        raise HTTPException(status_code=404, detail="Participante no existe")
    
    # verifico si existe el programa
    programa = fetch_all(
        "SELECT * FROM programas WHERE id_programa = %s",
        (id_programa,)
    )
    if not programa:
        raise HTTPException(status_code=404, detail="Programa no existe")
    
    # ver si ya estan relacionados
    existe = fetch_all(
        """
        SELECT * FROM participante_programa
        WHERE id_participante = %s AND id_programa = %s
        """,
        (id_participante, id_programa)
    )
    if not existe:
        raise HTTPException(status_code=409, detail="El participante no está asignado a este programa")
    
    execute_query(
        "DELETE FROM participante_programa WHERE id_participante = %s AND id_programa = %s",
        (id_participante, id_programa)
    )
    return {"message": "Participante removido del programa"}
