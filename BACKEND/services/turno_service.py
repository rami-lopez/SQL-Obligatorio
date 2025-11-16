from http.client import HTTPException
from db import fetch_all


def listar_turnos():
    """
    Lista todos los turnos disponibles.
    """
    turnos = fetch_all("SELECT * FROM turno ORDER BY order_index")
    return turnos

def obtener_turno(id_turno: int):
    """
    Obtiene un turno por su ID.
    """
    result = fetch_all(
        "SELECT * FROM turno WHERE id_turno = %s",
        (id_turno,)
    )

    if not result:
        raise HTTPException(
            status_code=404,
            detail="No existe un turno con ese id"
        )
    
    return result[0]
