from fastapi import HTTPException
from db import execute_query, fetch_all
from models.participante_model import ParticipanteCreate



def validar_email_unico(email: str):
    result = fetch_all("SELECT email FROM participante WHERE email = %s", (email,))
    if result:
        raise HTTPException(status_code=409, detail="Email ya existe")
    
def validar_email_registrado(email: str):
    result = fetch_all("SELECT email FROM login WHERE email = %s", (email,))
    if not result:
        raise HTTPException(status_code=409, detail="Email sin registrar")

def crear_participante(p: ParticipanteCreate):
    try:
        validar_email_registrado(p.email)
        validar_email_unico(p.email)
        
        
        query = """
            INSERT INTO participante (ci, nombre, apellido, email, rol) 
            VALUES (%s, %s, %s, %s, %s)
        """
        execute_query(query, (p.ci, p.nombre, p.apellido, p.email, p.rol))
        
        return {"message": "Participante creado exitosamente"}
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

def listar_participantes():
    try:
        return fetch_all("SELECT * FROM participante")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

def obtener_participante(id: int):
    try:
        result = fetch_all("SELECT * FROM participante WHERE id_participante = %s", (id,))
        if not result:
            raise HTTPException(status_code=404, detail="Participante no encontrado")
        return result[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

def actualizar_participante(id: int, p: ParticipanteCreate):
    try:
        result = fetch_all("SELECT * FROM participante WHERE id_participante = %s", (id,))
        if not result:
            raise HTTPException(status_code=404, detail="Participante no encontrado")
        
        query = """
            UPDATE participante 
            SET nombre = %s, apellido = %s, email = %s, rol = %s
            WHERE id_participante = %s
        """
        execute_query(query, (p.nombre, p.apellido, p.email, p.rol, id))
        
        return {"message": "Participante actualizado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
    
def eliminar_participante(id: int):
    try:
        result = fetch_all("SELECT * FROM participante WHERE id_participante = %s", (id,))
        if not result:
            raise HTTPException(status_code=404, detail="Participante no encontrado")
        
        query = "UPDATE participante SET activo = FALSE WHERE id_participante = %s"
        execute_query(query, (id,))
        
        return {"message": "Participante desactivado exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")