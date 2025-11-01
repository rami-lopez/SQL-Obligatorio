from pydantic import BaseModel
from typing import Literal, Optional
from datetime import datetime


class ProgramaCreate(BaseModel):
	id_facultad: int
	nombre: str
	tipo: Literal['grado', 'posgrado']


class ProgramaUpdate(BaseModel):
	id_facultad: Optional[int] = None
	nombre: Optional[str] = None
	tipo: Optional[Literal['grado', 'posgrado']] = None


class ProgramaResponse(BaseModel):
	id_programa: int
	id_facultad: int
	nombre: str
	tipo: str
	created_at: datetime
	updated_at: Optional[datetime] = None

