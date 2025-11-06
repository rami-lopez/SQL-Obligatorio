from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status
from db import fetch_all
import os

SECRET_KEY = os.getenv("SECRET_KEY", "clave_por_defecto")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password) :
    return pwd_context.hash(password)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data, expires_delta) :
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def authenticate_user(email, password):
    try:
        query = "SELECT email, password_hash FROM login WHERE email = %s"
        result = fetch_all(query, (email,))
        
        if not result:
            return None
        
        user_login = result[0]
        
        if not verify_password(password, user_login['password_hash']):
            return None
        
        query = """
            SELECT id_participante, ci, nombre, apellido, email, rol, activo
            FROM participante
            WHERE email = %s
        """
        participante = fetch_all(query, (email,))
        
        if not participante or not participante[0]['activo']:
            return None
        
        return participante[0]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en autenticación: {str(e)}")

