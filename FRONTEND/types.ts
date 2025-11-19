// Enums alineados con los valores de los models Pydantic (valores en español)
export enum Role {
  ALUMNO_GRADO = 'alumno_grado',
  ALUMNO_POSGRADO = 'alumno_posgrado',
  DOCENTE = 'docente',
  ADMIN = 'admin',
}

export enum RoomType {
  LIBRE = 'libre',
  POSGRADO = 'posgrado',
  DOCENTE = 'docente',
  
}

export enum ReservationStatus {
  ACTIVA = 'activa',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  FINALIZADA = 'finalizada',
  NO_ASISTENCIA = 'no_asistencia',
  
}

export enum ParticipantStatus {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  RECHAZADA = 'rechazada',
  
}

export enum AttendanceStatus {
  PRESENTE = 'presente',
  AUSENTE = 'ausente',
  NO_REGISTRADO = 'no_registrado',
}

export enum ProgramType {
  GRADO = 'grado',
  POSGRADO = 'posgrado',
  
}

// Interfaces coherentes con los modelos del backend (Pydantic / SQL)
// Para minimizar rompimientos en frontend, incluyo algunos alias camelCase opcionales

export interface User { // participante / ParticipanteResponse
  // Backend fields
  id_participante?: number;
  ci: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: Role;
  activo: boolean;
  created_at?: string; // ISO datetime
  updated_at?: string; // ISO datetime | null
  // Relaciones opcionales
  program_ids?: number[]; // si el backend las incluye

  // Optional frontend-friendly aliases (no confiar en ellos en la API)
  id?: number;
  name?: string;
  lastName?: string;
  role?: Role;
  active?: boolean;
  programIds?: number[];
  // Additional camelCase shapes seen in some responses
  idParticipante?: number;
  createdAt?: string;
  updatedAt?: string;
  activo_num?: number;
}

export interface Faculty { // facultad / Facultad
  id_facultad?: number;
  nombre: string;

  // aliases
  id?: number;
  name?: string;
  // camelCase alias
  idFacultad?: number;
}

export interface Program { // programa_academico / ProgramaResponse
  id_programa?: number;
  id_facultad: number;
  nombre: string;
  tipo: ProgramType;
  created_at?: string;
  updated_at?: string | null;

  // aliases
  id?: number;
  facultyId?: number;
  name?: string;
  type?: ProgramType;
  // camelCase aliases
  idPrograma?: number;
  idFacultad?: number;
}

export interface Building { // edificio
  id_edificio?: number;
  nombre: string;
  direccion?: string;
  departamento?: string;

  // Frontend specific property (opcional)
  map_position?: {
    top: string;
    left: string;
    width: string;
    height: string;
  } | null;

  // aliases
  idEdificio?: number;
  id?: number;
  name?: string;
  address?: string;
  department?: string;
  mapPosition?: { top: string; left: string; width: string; height: string } | null;
}

export interface Room { // sala / SalaResponse
  id_sala?: number;
  id_edificio: number;
  nombre: string;
  tipo: RoomType;
  capacidad: number;

  // aliases
  id?: number;
  buildingId?: number;
  name?: string;
  type?: RoomType;
  capacity?: number;
  idSala?: number;
  // camelCase aliases seen in some responses
  idEdificio?: number;
}

export interface TimeSlot { // turno
  id_turno?: number;
  order_index: number;
  hora_inicio: string; // "HH:MM:SS"
  hora_fin: string; // "HH:MM:SS"
  descripcion?: string;

  // aliases
  id?: number;
  idTurno?: number;
  orderIndex?: number;
  startTime?: string;
  endTime?: string;
  description?: string;
  // camelCase/time-as-seconds forms
  horaInicio?: number | string;
  horaFin?: number | string;
}

export interface ReservationParticipant { // reserva_participante
  id?: number;
  id_participante: number;
  fecha_solicitud_reserva?: string; // ISO datetime
  estado_participacion: ParticipantStatus;
  asistencia: AttendanceStatus;
  marcado_en?: string | null; // ISO datetime

  // aliases
  participantId?: number;
  participationStatus?: ParticipantStatus;
  attendance?: AttendanceStatus;
  // camelCase aliases
  idParticipante?: number;
  fechaSolicitudReserva?: string;
  estadoParticipacion?: ParticipantStatus;
  marcadoEn?: string | null;
}

export interface Reservation { // reserva / ReservaResponse
  id_reserva?: number;
  id_sala: number;
  fecha: string; // YYYY-MM-DD
  start_turn_id: number;
  end_turn_id: number;
  estado: ReservationStatus;
  creado_por?: number | null;
  created_at?: string;
  updated_at?: string;

  participantes?: ReservationParticipant[];

  // aliases
  id?: number;
  roomId?: number;
  organizerId?: number;
  date?: string;
  startTurnId?: number;
  endTurnId?: number;
  status?: ReservationStatus;
  participants?: ReservationParticipant[];
  // camelCase aliases observed in responses
  idReserva?: number;
  idSala?: number;
  creadoPor?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Sanction { // sancion_participante / SancionResponse
  id_sancion?: number;
  id_participante: number;
  fecha_inicio: string; // YYYY-MM-DD
  fecha_fin: string; // YYYY-MM-DD
  motivo?: string;
  created_at?: string;

  // aliases
  id?: number;
  participantId?: number;
  startDate?: string;
  endDate?: string;
  reason?: string;
}
