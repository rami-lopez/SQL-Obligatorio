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





