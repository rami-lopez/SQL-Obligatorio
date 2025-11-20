import { User, Reservation, Room, Building, Program, Faculty, TimeSlot, Role, RoomType, ReservationStatus, ParticipantStatus, ProgramType, AttendanceStatus } from '../types';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

let authToken: string | null = null;
export function setAuthToken(token: string | null, persist: boolean = true) {
    authToken = token;
    if (typeof localStorage !== 'undefined') {
        try {
            if (persist && token) localStorage.setItem('authToken', token);
            else localStorage.removeItem('authToken');
        } catch (e) {
        
        }
    }
}

export function loadAuthTokenFromStorage(): string | null {
    if (typeof localStorage === 'undefined') return null;
    try {
        const t = localStorage.getItem('authToken');
        if (t) {
            authToken = t;
            return t;
        }
    } catch (e) {
        return null;
    }
    return null;
}

export function clearAuthToken() {
    authToken = null;
    if (typeof localStorage !== 'undefined') {
        try { localStorage.removeItem('authToken'); } catch (e) { }
    }
}


const toSnake = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(toSnake);
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    const res: any = {};
    Object.keys(obj).forEach(key => {
        const val = (obj as any)[key];
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        res[snakeKey] = toSnake(val);
    });
    return res;
};


const toCamel = (obj: any): any => {
    if (Array.isArray(obj)) return obj.map(toCamel);
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;
    const res: any = {};
    Object.keys(obj).forEach(key => {
        const val = (obj as any)[key];
        const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
        res[camelKey] = toCamel(val);
    });
    return res;
};

async function apiRequest<T>(method: string, endpoint: string, body?: any): Promise<T> {
    const token = authToken;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const options: RequestInit = {
        method,
        headers,
    };

    if (body) {
    
        try {
            options.body = JSON.stringify(toSnake(body));
        } catch (e) {
            options.body = JSON.stringify(body);
        }
    }

    try {
        const resp = await fetch(`${API_BASE_URL}/${endpoint}/`, options);

        const text = await resp.text();
        let parsed: any = null;
        try { parsed = text ? JSON.parse(text) : null; } catch (e) { parsed = text; }

        if (!resp.ok) {
            const message = (parsed && parsed.message) ? parsed.message : `HTTP error: ${resp.statusText}`;
            const err: any = new Error(message);
            err.status = resp.status;
            err.response = parsed;
            throw err;
        }

        const camel = toCamel(parsed);
       
        const normalized = normalizeResponse(camel);
        return normalized as T;
    } catch (error) {
    
        console.warn(`API request failed: ${method} ${endpoint}`, error);
        throw error;
    }
}


export async function login(email: string, password: string): Promise<string> {
    const body = `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`;
    const resp = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
    });

    if (!resp.ok) {
        const txt = await resp.text();
        let parsed = null;
        try { parsed = JSON.parse(txt); } catch { parsed = txt; }
        const message = parsed && parsed.detail ? parsed.detail : resp.statusText;
        const err: any = new Error(message);
        err.status = resp.status;
        throw err;
    }

    const data = await resp.json();
    const token = data?.access_token ?? data?.token ?? null;
    if (!token) throw new Error('No token received from login');

    setAuthToken(token);
    return token;
}

export function logout() {
    setAuthToken(null);
}

function normalizeResponse(obj: any): any {
    if (Array.isArray(obj)) return obj.map(normalizeResponse);
    if (obj === null || obj === undefined) return obj;
    if (typeof obj !== 'object') return obj;

    const res: any = { ...obj };

    if ('idEdificio' in res || 'id' in res) {
        res.idEdificio = res.idEdificio ?? res.id ?? res.id_edificio;
    
        if (res.mapPosition == null && res.map_position != null) res.mapPosition = res.map_position;
    }


    if ('idFacultad' in res || 'id' in res) {
        res.idFacultad = res.idFacultad ?? res.id ?? res.id_facultad;
    }


    if ('idPrograma' in res || 'id_programa' in res || 'id' in res) {
        res.idPrograma = res.idPrograma ?? res.id ?? res.id_programa;
        res.idFacultad = res.idFacultad ?? res.idFacultad ?? res.id_facultad ?? res.idFacultad;
    }


    if ('idSala' in res || 'id' in res || 'id_sala' in res) {
        res.idSala = res.idSala ?? res.id ?? res.id_sala;
        res.idEdificio = res.idEdificio ?? res.idEdificio ?? res.id_edificio ?? res.id_edificio;
    }

    if ('idTurno' in res || 'id' in res || 'orderIndex' in res) {
       
        if (res.horaInicio == null && res.horaInicio !== 0) {
         
            if (res.hora_inicio != null) res.horaInicio = res.hora_inicio;
            else if (res.startTime != null && typeof res.startTime === 'string') {
                res.horaInicio = timeStringToSeconds(res.startTime);
            }
        }
        if (res.horaFin == null && res.horaFin !== 0) {
            if (res.hora_fin != null) res.horaFin = res.hora_fin;
            else if (res.endTime != null && typeof res.endTime === 'string') {
                res.horaFin = timeStringToSeconds(res.endTime);
            }
        }

        if (!res.startTime && res.horaInicio != null) res.startTime = secondsToTimeString(res.horaInicio);
        if (!res.endTime && res.horaFin != null) res.endTime = secondsToTimeString(res.horaFin);
    }

    if ('idReserva' in res || 'idSala' in res || 'startTurnId' in res || 'id_reserva' in res) {
        res.idReserva = res.idReserva ?? res.id ?? res.id_reserva;
        res.idSala = res.idSala ?? res.idSala ?? res.id_sala ?? res.id_sala;
        res.startTurnId = res.startTurnId ?? res.startTurnId ?? res.start_turn_id ?? res.start_turn_id;
        res.endTurnId = res.endTurnId ?? res.endTurnId ?? res.end_turn_id ?? res.end_turn_id;
        res.creadoPor = res.creadoPor ?? res.creado_por ?? res.creadoPor;
        res.createdAt = res.createdAt ?? res.created_at ?? res.createdAt;
        res.updatedAt = res.updatedAt ?? res.updated_at ?? res.updatedAt;
        res.estado = res.estado ?? res.status ?? res.estado;
        if (Array.isArray(res.participantes)) {
            res.participantes = res.participantes.map((p: any) => normalizeReservationParticipant(p));
        } else if (Array.isArray(res.participants)) {
            res.participantes = res.participants.map((p: any) => normalizeReservationParticipant(p));
        }
    }

    if ('idParticipante' in res || 'id_participante' in res || 'email' in res) {
        res.idParticipante = res.idParticipante ?? res.id ?? res.id_participante;
        res.createdAt = res.createdAt ?? res.created_at ?? res.createdAt;
        res.updatedAt = res.updatedAt ?? res.updated_at ?? res.updatedAt;
        if (res.activo !== undefined && typeof res.activo !== 'number') {
            res.activo = res.activo ? 1 : 0;
        }
    }
    Object.keys(res).forEach(k => {
        if (typeof res[k] === 'object' && res[k] !== null) {
            res[k] = normalizeResponse(res[k]);
        }
    });

    return res;
}

function normalizeReservationParticipant(p: any) {
    const np: any = { ...p };
    np.idParticipante = np.idParticipante ?? np.id ?? np.id_participante;
    np.fechaSolicitudReserva = np.fechaSolicitudReserva ?? np.fecha_solicitud_reserva ?? np.fechaSolicitudReserva;
    np.estadoParticipacion = np.estadoParticipacion ?? np.estado_participacion ?? np.estadoParticipacion;
    np.marcadoEn = np.marcadoEn ?? np.marcado_en ?? np.marcadoEn;
    return np;
}

function timeStringToSeconds(t: string): number {
    const parts = t.split(':').map(s => parseInt(s, 10));
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 3600 + parts[1] * 60;
    // numeric string
    if (/^\d+$/.test(t)) return parseInt(t, 10);
    return 0;
}

function secondsToTimeString(s: number): string {
    if (typeof s !== 'number' || isNaN(s)) return '00:00:00';
    const hh = Math.floor(s / 3600).toString().padStart(2, '0');
    const mm = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const ss = (s % 60).toString().padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}

export const getBuildings = () => apiRequest<Building[]>('GET', 'edificios');
export const createBuilding = (buildingData: Omit<Building, 'id'>) => apiRequest<Building>('POST', 'edificios', buildingData);
export const updateBuilding = (id: number, buildingData: Partial<Building>) => apiRequest<Building>('PUT', `edificios/${id}`, buildingData);
export const deleteBuilding = (id: number) => apiRequest<void>('DELETE', `edificios/${id}`);

export const getRooms = () => apiRequest<Room[]>('GET', 'salas');
export const getIsRoomOcuppied = (id_sala, fecha) => apiRequest<boolean>('GET', `salas/${id_sala}/${fecha}`);
export const createRoom = (roomData: Omit<Room, 'id'>) => apiRequest<Room>('POST', 'salas', roomData);
export const updateRoom = (id: number, roomData: Partial<Room>) => apiRequest<Room>('PUT', `salas/${id}`, roomData);
export const deleteRoom = (id: number) => apiRequest<void>('DELETE', `salas/${id}`);

export const getUsers = () => apiRequest<User[]>('GET', 'participantes');
export const createUser = (userData: Omit<User, 'id'>) => apiRequest<User>('POST', 'participantes', userData);
export const updateUser = (id: number, userData: Partial<User>) => apiRequest<User>('PUT', `participantes/${id}`, userData);
export const deleteUser = (id: number) => apiRequest<void>('DELETE', `participantes/${id}`);


export const getAuthMe = () => apiRequest<User>('GET', 'auth/me');

export const getMyReservations = () => apiRequest<Reservation[]>('GET', 'reservas/mis-reservas');

export const getAllReservations = () => apiRequest<Reservation[]>('GET', 'reservas');

export const getParticipantReservations = (idParticipante: number) => apiRequest<Reservation[]>('GET', `participantes/${idParticipante}/reservas`);
export const getReservations = () => getMyReservations();
export const createReservation = (reservationData: Omit<Reservation, 'id'>) => apiRequest<Reservation>('POST', 'reservas', reservationData);
export const updateReservation = (id: number, reservationData: Partial<Reservation>) => apiRequest<Reservation>('PUT', `reservas/${id}`, reservationData);
export const updateReservationAttendance = (idReserva: number, attendance: boolean) => apiRequest<Reservation>('PUT', `reservas/${idReserva}/registrar-asistencia/${attendance}`, { id_reserva: idReserva, asistencia: attendance });
export const updateReservationParticipation = (idReserva: number, participation: boolean) => apiRequest<Reservation>('PUT', `reservas/${idReserva}/participacion/${participation}`, { id_reserva: idReserva, participacion: participation });
export const deleteReservation = (id: number) => apiRequest<void>('DELETE', `reservas/${id}`);

export const getReservationParticipants = (reservationId: number) => apiRequest<number[]>('GET', `reservas/${reservationId}/participantes`);

export const getSanctions = () => apiRequest<any[]>('GET', 'sanciones');
export const getParticipantSanctions = (idParticipante: number) => apiRequest<any[]>('GET', `sanciones/participantes/${idParticipante}`);

export const getPrograms = () => apiRequest<Program[]>('GET', 'programas');
export const createProgram = (programData: Omit<Program, 'id'>) => apiRequest<Program>('POST', 'programas', programData);
export const updateProgram = (id: number, programData: Partial<Program>) => apiRequest<Program>('PUT', `programas/${id}`, programData);
export const deleteProgram = (id: number) => apiRequest<void>('DELETE', `programas/${id}`);

export const getFaculties = () => apiRequest<Faculty[]>('GET', 'facultades');
export const getTimeSlots = () => apiRequest<TimeSlot[]>('GET', 'turnos');

