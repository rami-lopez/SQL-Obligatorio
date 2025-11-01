from pydantic import BaseModel, EmailStr
from typing import Literal, Optional
from datetime import datetime

class ParticipanteCreate(BaseModel):
    ci: str
    nombre: str
    apellido: str
    email: EmailStr
    rol: Literal['alumno_grado','alumno_posgrado','docente','admin'] = 'alumno_grado'

class ParticipanteUpdate(BaseModel):
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    email: Optional[EmailStr] = None
    rol: Optional[Literal['alumno_grado','alumno_posgrado','docente','admin']] = None
    activo: Optional[bool] = None

class ParticipanteResponse(BaseModel):
    id_participante: int
    ci: str
    nombre: str
    apellido: str
    email: str
    rol: str
    activo: bool
    created_at: datetime
    updated_at: datetime
