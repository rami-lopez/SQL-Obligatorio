from fastapi import HTTPException
from db import execute_query, fetch_all
from models.participante_model import ParticipanteCreate

def validar_ci_unico(ci: str):
    result = fetch_all("SELECT ci FROM participante WHERE ci = %s", (ci,))
    if result:
        raise HTTPException(status_code=409, detail="CI ya existe")

def validar_email_unico(email: str):
    result = fetch_all("SELECT email FROM participante WHERE email = %s", (email,))
    if result:
        raise HTTPException(status_code=409, detail="Email ya existe")

def crear_participante(p: ParticipanteCreate):
    try:
        validar_ci_unico(p.ci)
        validar_email_unico(p.email)
        
        # TODO: Validar que el email exista en tabla login
        
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
        return fetch_all("SELECT * FROM participante WHERE activo = TRUE")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")