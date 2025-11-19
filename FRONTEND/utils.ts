// Small helpers to normalize IDs and time values across components.

export const getReservationId = (r: any): number | undefined => r?.idReserva ?? r?.id_reserva ?? r?.id ?? r?.idReserva;
export const getReservationDate = (r: any): string | undefined => r?.fecha ?? r?.date ?? r?.createdAt ?? r?.created_at ?? undefined;
export const getReservationStartTurnId = (r: any): number | undefined => r?.startTurnId ?? r?.start_turn_id ?? r?.startTurnId ?? undefined;
export const getReservationEndTurnId = (r: any): number | undefined => r?.endTurnId ?? r?.end_turn_id ?? r?.endTurnId ?? undefined;
export const getReservationRoomId = (r: any): number | undefined => r?.idSala ?? r?.id_sala ?? r?.roomId ?? r?.id ?? undefined;
export const getReservationOrganizerId = (r: any): number | undefined => r?.creadoPor ?? r?.creado_por ?? r?.organizerId ?? r?.creadoPor ?? undefined;

export const getUserId = (u: any): number | undefined => u?.idParticipante ?? u?.id_participante ?? u?.id ?? undefined;
export const getRoomId = (rm: any): number | undefined => rm?.idSala ?? rm?.id_sala ?? rm?.id ?? undefined;
export const getBuildingId = (b: any): number | undefined => b?.idEdificio ?? b?.id_edificio ?? b?.id ?? undefined;

export function timeStringToSeconds(t: string | number): number {
  if (t == null) return 0;
  if (typeof t === 'number') return t;
  const s = String(t).trim();
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  const parts = s.split(':').map(p => parseInt(p, 10));
  if (parts.length === 3) return parts[0]*3600 + parts[1]*60 + parts[2];
  if (parts.length === 2) return parts[0]*3600 + parts[1]*60;
  return 0;
}

export function secondsToTimeString(sec: number): string {
  if (typeof sec !== 'number' || isNaN(sec)) return '00:00:00';
  const hh = Math.floor(sec/3600).toString().padStart(2,'0');
  const mm = Math.floor((sec%3600)/60).toString().padStart(2,'0');
  const ss = (sec%60).toString().padStart(2,'0');
  return `${hh}:${mm}:${ss}`;
}

export function buildDateTimeIso(dateStr: string | undefined, timeVal: string | number | undefined): string | null {
  if (!dateStr || timeVal == null) return null;
  const seconds = timeStringToSeconds(timeVal as any);
  const timeStr = secondsToTimeString(seconds);
  return `${dateStr}T${timeStr}`;
}

// Parse a YYYY-MM-DD date string as a local Date (avoid the UTC interpretation of `new Date('YYYY-MM-DD')`).
export function parseDateAsLocal(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  const parts = String(dateStr).split('-').map(p => parseInt(p, 10));
  if (parts.length < 3 || parts.some(isNaN)) return null;
  const [y, m, d] = parts;
  return new Date(y, m - 1, d);
}

// Build a Date object from a date string (YYYY-MM-DD) and a time value (seconds or 'HH:MM:SS')
export function buildDateTimeFromDateAndTime(dateStr: string | undefined, timeVal: string | number | undefined): Date | null {
  if (!dateStr || timeVal == null) return null;
  const date = parseDateAsLocal(dateStr);
  if (!date) return null;
  const seconds = timeStringToSeconds(timeVal as any);
  const hh = Math.floor(seconds / 3600);
  const mm = Math.floor((seconds % 3600) / 60);
  const ss = seconds % 60;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hh, mm, ss);
}
