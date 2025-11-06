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

