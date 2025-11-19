# Contexto de Modelos de Datos para LLM

Este documento describe la estructura de los datos de la aplicación, tanto a nivel de base de datos (SQL) como a nivel de la API (modelos Pydantic).

## Esquema de Base de Datos (SQL)

```sql
CREATE DATABASE IF NOT EXISTS reserva_salas DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE reserva_salas;

CREATE TABLE IF NOT EXISTS login (
    email VARCHAR(200) PRIMARY KEY,
    password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS facultad (
  id_facultad INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS programa_academico (
  id_programa INT AUTO_INCREMENT PRIMARY KEY,
  id_facultad INT NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  tipo ENUM('grado','posgrado') NOT NULL,
  FOREIGN KEY (id_facultad) REFERENCES facultad(id_facultad) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS participante (
  id_participante INT AUTO_INCREMENT PRIMARY KEY,
  ci VARCHAR(20) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  apellido VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  rol ENUM('alumno_grado','alumno_posgrado','docente','admin') NOT NULL DEFAULT 'alumno_grado',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (email) REFERENCES login(email)
);

-- Relación participante-programa (un participante puede estar en varios programas)
CREATE TABLE IF NOT EXISTS participante_programa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_participante INT NOT NULL,
  id_programa INT NOT NULL,
  FOREIGN KEY (id_participante) REFERENCES participante(id_participante) ON DELETE CASCADE,
  FOREIGN KEY (id_programa) REFERENCES programa_academico(id_programa) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS edificio (
  id_edificio INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  direccion VARCHAR(300),
  departamento VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS sala (
  id_sala INT AUTO_INCREMENT PRIMARY KEY,
  id_edificio INT NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  tipo ENUM('libre','posgrado','docente') DEFAULT 'libre',
  capacidad INT NOT NULL,
  FOREIGN KEY (id_edificio) REFERENCES edificio(id_edificio) ON DELETE RESTRICT
);

-- Turnos horarios (bloques de 1 hora de 8:00 a 23:00)
CREATE TABLE IF NOT EXISTS turno (
  id_turno INT AUTO_INCREMENT PRIMARY KEY,
  order_index INT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  descripcion VARCHAR(100)
);

-- Reservas: permite reservar múltiples turnos contiguos
CREATE TABLE IF NOT EXISTS reserva (
  id_reserva INT AUTO_INCREMENT PRIMARY KEY,
  id_sala INT NOT NULL,
  fecha DATE NOT NULL,
  start_turn_id INT NOT NULL,
  end_turn_id INT NOT NULL,
  estado ENUM('activa','confirmada','cancelada','finalizada','no_asistencia') DEFAULT 'activa',
  creado_por INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_sala) REFERENCES sala(id_sala) ON DELETE RESTRICT,
  FOREIGN KEY (start_turn_id) REFERENCES turno(id_turno),
  FOREIGN KEY (end_turn_id) REFERENCES turno(id_turno),
  FOREIGN KEY (creado_por) REFERENCES participante(id_participante),
  CHECK (start_turn_id <= end_turn_id)
);

-- Participantes de cada reserva con confirmación y registro de asistencia
CREATE TABLE IF NOT EXISTS reserva_participante (
  id INT AUTO_INCREMENT PRIMARY KEY,
  id_reserva INT NOT NULL,
  id_participante INT NOT NULL,
  fecha_solicitud_reserva TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado_participacion ENUM('pendiente','confirmada','rechazada') NOT NULL DEFAULT 'pendiente',
  asistencia ENUM('presente','ausente','no_registrado') NOT NULL DEFAULT 'no_registrado',
  marcado_en TIMESTAMP NULL,
  FOREIGN KEY (id_reserva) REFERENCES reserva(id_reserva) ON DELETE CASCADE,
  FOREIGN KEY (id_participante) REFERENCES participante(id_participante) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sancion_participante (
  id_sancion INT AUTO_INCREMENT PRIMARY KEY,
  id_participante INT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  motivo VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_participante) REFERENCES participante(id_participante) ON DELETE CASCADE
);

-- Vista para validar sanciones vigentes
CREATE OR REPLACE VIEW sanciones_vigentes AS
SELECT id_participante, fecha_inicio, fecha_fin
FROM sancion_participante
WHERE CURDATE() BETWEEN fecha_inicio AND fecha_fin;

-- Trigger para prevenir solapamiento de reservas
DELIMITER $$

CREATE TRIGGER trg_reserva_before_insert
BEFORE INSERT ON reserva
FOR EACH ROW
BEGIN
  DECLARE v_conflictos INT DEFAULT 0;

  -- Verificar que start <= end
  IF NEW.start_turn_id > NEW.end_turn_id THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: start_turn_id debe ser <= end_turn_id';
  END IF;

  -- Contar solapamientos para la misma sala y fecha
  SELECT COUNT(*) INTO v_conflictos
  FROM reserva
  WHERE id_sala = NEW.id_sala
    AND fecha = NEW.fecha
    AND estado IN ('activa','confirmada')
    AND NOT (end_turn_id < NEW.start_turn_id OR start_turn_id > NEW.end_turn_id);

  IF v_conflictos > 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Conflicto: ya existe reserva solapada';
  END IF;
END$$

DELIMITER ;


-- Turnos horarios
INSERT INTO turno (order_index, hora_inicio, hora_fin, descripcion)
VALUES
(1,'08:00:00','09:00:00','08-09'),
(2,'09:00:00','10:00:00','09-10'),
(3,'10:00:00','11:00:00','10-11'),
(4,'11:00:00','12:00:00','11-12'),
(5,'12:00:00','13:00:00','12-13'),
(6,'13:00:00','14:00:00','13-14'),
(7,'14:00:00','15:00:00','14-15'),
(8,'15:00:00','16:00:00','15-16'),
(9,'16:00:00','17:00:00','16-17'),
(10,'17:00:00','18:00:00','17-18'),
(11,'18:00:00','19:00:00','18-19'),
(12,'19:00:00','20:00:00','19-20'),
(13,'20:00:00','21:00:00','20-21'),
(14,'21:00:00','22:00:00','21-22'),
(15,'22:00:00','23:00:00','22-23');
```

## Modelos de Datos de la API (Pydantic)

### `BACKEND/models/auth_model.py`

```python
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
```

### `BACKEND/models/participante_model.py`

```python
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
```

### `BACKEND/models/programa_model.py`

```python
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
```

### `BACKEND/models/reserva_model.py`

```python
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
```

### `BACKEND/models/sala_model.py`

```python
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
```

### `BACKEND/models/sancion_model.py`

```python
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
```
