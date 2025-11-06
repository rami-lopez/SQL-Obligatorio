from pydantic import BaseModel, EmailStr

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserInToken(BaseModel):
    id_participante: int
    email: str
    rol: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    ci: str
    nombre: str
    apellido: str
    rol: str = 'alumno_grado'