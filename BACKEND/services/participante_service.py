from fastapi import HTTPException
from services.auth_services import hash_password
from db import execute_query, fetch_all
from models.participante_model import ParticipanteCreate

def validar_email_unico(email: str):
    result = fetch_all("SELECT email FROM participante WHERE email = %s", (email,))
    if result:
        raise HTTPException(status_code=409, detail="Email ya existe")
    
def validar_email_registrado(email: str):
    result = fetch_all("SELECT email FROM login WHERE email = %s", (email,))
    # Si no existe, creo un login con contraseña por defecto, solo el admin puede crear usuarios
    if not result:
        query = """
            INSERT INTO login (email, password_hash) VALUES (%s, %s)"""
        execute_query(query, (email, hash_password("Password123")))  

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
        
        participante_actualizado = fetch_all("SELECT * FROM participante WHERE id_participante = %s", (id,))
        return participante_actualizado[0]
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
    
def obtener_reservas_por_participante(id_participante: int):
    try:
        result = fetch_all("SELECT * FROM participante WHERE id_participante = %s", (id_participante,))
        if not result:
            raise HTTPException(status_code=404, detail="Participante no encontrado")
        
        query = """
            SELECT r.*,rp.asistencia
            FROM reserva r
            JOIN reserva_participante rp ON r.id_reserva = rp.id_reserva
            WHERE rp.id_participante = %s
        """
        reservas = fetch_all(query, (id_participante,))
        
        return reservas
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")