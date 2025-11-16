from pydantic import BaseModel
from typing import Literal, Optional
from datetime import date, datetime


class ReservaCreate(BaseModel):
	id_sala: int
	fecha: date
	start_turn_id: int
	end_turn_id: int
	estado: Literal['activa','confirmada','cancelada','finalizada','no_asistencia'] = 'activa'
	creado_por: Optional[int] = None

class ReservaUpdate(BaseModel):
	id_sala: Optional[int] = None
	fecha: Optional[date] = None
	start_turn_id: Optional[int] = None
	end_turn_id: Optional[int] = None
	estado: Optional[Literal['activa','confirmada','cancelada','finalizada','no_asistencia']] = None
	creado_por: Optional[int] = None

class ReservaResponse(BaseModel):
	id_reserva: int
	id_sala: int
	fecha: date
	start_turn_id: int
	end_turn_id: int
	estado: str
	creado_por: int
	created_at: datetime
	updated_at: datetime

