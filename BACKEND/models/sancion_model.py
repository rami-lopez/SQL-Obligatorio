from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


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

