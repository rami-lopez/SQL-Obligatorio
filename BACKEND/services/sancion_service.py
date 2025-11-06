from fastapi import HTTPException
from db import execute_query, fetch_all
from models.sancion_model import SancionCreate, SancionUpdate
from datetime import date

from services.validaciones import (
    validar_participante_existe,
    validar_fechas_sancion,
    validar_sancion_superpuesta,
)

def crear_sancion(s: SancionCreate):
    try:
        validar_participante_existe(s.id_participante)
        validar_fechas_sancion(s.fecha_inicio, s.fecha_fin)
        validar_sancion_superpuesta(s.id_participante, s.fecha_inicio, s.fecha_fin)
        
        query = """
            INSERT INTO sancion (id_participante, fecha_inicio, fecha_fin, motivo) 
            VALUES (%s, %s, %s, %s)
        """
        id_sancion = execute_query(
            query, 
            (s.id_participante, s.fecha_inicio, s.fecha_fin, s.motivo)
        )
        
        return {
            "message": "Sanción creada exitosamente",
            "id_sancion": id_sancion
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear sanción: {str(e)}")
    
def listar_sanciones(id_participante: int = None, vigentes_solo: bool = False):
    try:
        query = "SELECT * FROM sancion WHERE 1=1"
        params = []
        
        if id_participante:
            query += " AND id_participante = %s"
            params.append(id_participante)
        
        if vigentes_solo:
            query += " AND CURDATE() BETWEEN fecha_inicio AND fecha_fin"
        
        query += " ORDER BY fecha_inicio DESC"
        
        return fetch_all(query, tuple(params) if params else None)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al listar sanciones: {str(e)}")

def obtener_sancion(id_sancion: int):
    try:
        result = fetch_all(
            "SELECT * FROM sancion WHERE id_sancion = %s", 
            (id_sancion,)
        )
        if not result:
            raise HTTPException(status_code=404, detail="Sanción no encontrada")
        return result[0]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener sanción: {str(e)}")

def actualizar_sancion(id_sancion: int, s: SancionUpdate):
    try:
        # verificar que la sanción existe
        sancion_actual = obtener_sancion(id_sancion)
        
        # campos a actualizar
        campos = []
        valores = []
        
        if s.id_participante is not None:
            validar_participante_existe(s.id_participante)
            campos.append("id_participante = %s")
            valores.append(s.id_participante)
        
        if s.fecha_inicio is not None:
            campos.append("fecha_inicio = %s")
            valores.append(s.fecha_inicio)
        
        if s.fecha_fin is not None:
            campos.append("fecha_fin = %s")
            valores.append(s.fecha_fin)
        
        if s.motivo is not None:
            campos.append("motivo = %s")
            valores.append(s.motivo)
        
        if not campos:
            raise HTTPException(status_code=400, detail="No hay campos para actualizar")
        
        # validar fechas si se actualizan
        fecha_inicio = s.fecha_inicio if s.fecha_inicio else sancion_actual['fecha_inicio']
        fecha_fin = s.fecha_fin if s.fecha_fin else sancion_actual['fecha_fin']
        id_participante = s.id_participante if s.id_participante else sancion_actual['id_participante']
        
        validar_fechas_sancion(fecha_inicio, fecha_fin)
        validar_sancion_superpuesta(id_participante, fecha_inicio, fecha_fin, id_sancion)
        
        # ejecutar actualización
        valores.append(id_sancion)
        query = f"UPDATE sancion SET {', '.join(campos)} WHERE id_sancion = %s"
        execute_query(query, tuple(valores))
        
        return {"message": "Sanción actualizada exitosamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar sanción: {str(e)}")

def eliminar_sancion(id_sancion: int):
    # elimina una sancion (soft delete si es necesario, o hard delete)
    try:
        obtener_sancion(id_sancion)
        
        query = "DELETE FROM sancion WHERE id_sancion = %s"
        execute_query(query, (id_sancion,))
        
        return {"message": "Sanción eliminada exitosamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar sanción: {str(e)}")
    
def tiene_sancion_vigente(id_participante: int) -> bool:
    # eerifica si un participante tiene una sanción vigente en la fecha actual
    try:
        query = """
            SELECT COUNT(*) AS total
            FROM sancion
            WHERE id_participante = %s
              AND CURDATE() BETWEEN fecha_inicio AND fecha_fin
        """
        resultado = fetch_all(query, (id_participante,))
        return resultado[0]["total"] > 0
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al verificar sanciones: {str(e)}")
