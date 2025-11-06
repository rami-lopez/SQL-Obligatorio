from pydantic import BaseModel
from typing import Literal, Optional
from datetime import date, datetime


class SalaCreate(BaseModel):
	id_edificio: int
	nombre: str
	tipo: Literal['libre', 'posgrado', 'docente'] = 'libre'
	capacidad: int


class SalaUpdate(BaseModel):
	id_edificio: Optional[int] = None
	nombre: Optional[str] = None
	tipo: Optional[Literal['libre', 'posgrado', 'docente']] = None
	capacidad: Optional[int] = None


class SalaResponse(BaseModel):
	id_sala: int
	id_edificio: int
	nombre: str
	tipo: str
	capacidad: int

# sanciones
class SancionCreate(BaseModel):
    id_participante: int
    fecha_inicio: date
    fecha_fin: date
    motivo: Optional[str] = None


class SancionUpdate(BaseModel):
    id_participante: Optional[int] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    motivo: Optional[str] = None


class SancionResponse(BaseModel):
    id_sancion: int
    id_participante: int
    fecha_inicio: date
    fecha_fin: date
    motivo: Optional[str] = None
    created_at: datetime
