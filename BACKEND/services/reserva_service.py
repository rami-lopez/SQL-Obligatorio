from fastapi import HTTPException
from db import execute_query, fetch_all
from models.reserva import ReservaCreate
from services.validaciones import (
    validar_participante_sin_sancion,
    validar_limite_horas_diarias,
    validar_limite_reservas_semanales
)

def crear_reserva(r: ReservaCreate, creado_por: int):
    try:

        validar_participante_sin_sancion(creado_por)
        
        horas = r.end_turn_id - r.start_turn_id + 1
        validar_limite_horas_diarias(creado_por, r.fecha, horas)
        validar_limite_reservas_semanales(creado_por, r.fecha)
        
        sala = fetch_all("SELECT capacidad FROM sala WHERE id_sala = %s", (r.id_sala,))
        if len(r.participantes) > sala[0]['capacidad']:
            raise HTTPException(status_code=400, detail="Excede capacidad de sala")
    
        query = """
            INSERT INTO reserva (id_sala, fecha, start_turn_id, end_turn_id, creado_por)
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(query, (r.id_sala, r.fecha, r.start_turn_id, r.end_turn_id, creado_por))
    
        id_reserva = fetch_all("SELECT LAST_INSERT_ID() as id")[0]['id']
        
        for id_part in r.participantes:
            estado = 'confirmada' if id_part == creado_por else 'pendiente'
            query = """
                INSERT INTO reserva_participante (id_reserva, id_participante, estado_participacion)
                VALUES (%s, %s, %s)
            """
            execute_query(query, (id_reserva, id_part, estado))
        
        return {"message": "Reserva creada", "id_reserva": id_reserva}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")