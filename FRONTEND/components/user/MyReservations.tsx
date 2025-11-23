import React, { useContext, useEffect, useState } from "react";
import {
  Reservation,
  ReservationStatus,
  ParticipantStatus,
  Room,
  Building,
  TimeSlot,
  AttendanceStatus,
} from "../../types";
import { AppContext } from "../../App";
import { CalendarIcon, ClockIcon, UserGroupIcon } from "../icons";
import {
  deleteReservation,
  getMyReservations,
  updateReservation,
  updateReservationAttendance,
  updateReservationParticipation,
} from "../../services/api";
import { getReservationParticipants } from "../../services/api";
import {
  getReservationRoomId,
  getRoomId,
  getBuildingId,
  getReservationStartTurnId,
  getReservationEndTurnId,
  getReservationDate,
  secondsToTimeString,
  timeStringToSeconds,
  buildDateTimeIso,
  parseDateAsLocal,
  buildDateTimeFromDateAndTime,
} from "../../utils";
import { Loader } from "../common/Loader";

const getStatusBadge = (status: ReservationStatus) => {
  switch (status) {
    case ReservationStatus.ACTIVA:
      return "bg-blue-100 text-blue-800";
    case ReservationStatus.CONFIRMADA:
      return "bg-teal-100 text-teal-800";
    case ReservationStatus.FINALIZADA:
      return "bg-green-100 text-green-800";
    case ReservationStatus.CANCELADA:
      return "bg-gray-100 text-gray-800";
    case ReservationStatus.NO_ASISTENCIA:
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const ReservationCard: React.FC<{
  reservation: Reservation;
  onCancel: (id: number, updatedReservationData: any) => void;
  onConfirm: (id: number, attendance: boolean) => void;
  onConfirmInvitation: (id: number, accept: boolean) => void;
  currentUserId: number;
  rooms: Room[];
  buildings: Building[];
  timeSlots: TimeSlot[];
}> = ({
  reservation,
  onCancel,
  onConfirm,
  onConfirmInvitation,
  currentUserId,
  rooms,
  buildings,
  timeSlots,
}) => {
  const [participantIds, setParticipantIds] = React.useState<number[] | null>(
    null
  );
  const reservationId =
    (reservation as any).idReserva ??
    reservation.id ??
    (reservation as any).id_reserva;

  React.useEffect(() => {
    let mounted = true;
    const rawPart =
      (reservation as any).participantes ??
      (reservation as any).participants ??
      null;
    if (Array.isArray(rawPart)) {
      
      if (rawPart.length > 0 && typeof rawPart[0] === "object") {
        const ids = rawPart
          .map(
            (p: any) =>
              p.idParticipante ?? p.id_participante ?? p.participantId ?? p.id
          )
          .filter((x: any) => typeof x === "number");
        if (mounted) setParticipantIds(ids);
        return;
      }
      if (rawPart.length > 0 && typeof rawPart[0] === "number") {
        if (mounted) setParticipantIds(rawPart as number[]);
        return;
      }
    }
    
    if (reservationId != null) {
      getReservationParticipants(reservationId)
        .then((ids) => {
          if (mounted) setParticipantIds(ids);
        })
        .catch(() => {
          if (mounted) setParticipantIds([]);
        });
    } else {
      setParticipantIds([]);
    }
    return () => {
      mounted = false;
    };
  }, [reservation, reservationId]);
  
  const reservationRoomId =
    getReservationRoomId(reservation) ??
    (reservation as any).idSala ??
    (reservation as any).id_sala ??
    undefined;
  const room = rooms.find((r: Room) => getRoomId(r) === reservationRoomId) as
    | Room
    | undefined;
  const roomBuildingId = room ? getBuildingId(room) : undefined;
  const building = roomBuildingId
    ? buildings.find((b: Building) => getBuildingId(b) === roomBuildingId)
    : null;

  const startTurnId =
    getReservationStartTurnId(reservation) ??
    (reservation as any).startTurnId ??
    (reservation as any).start_turn_id;
  const endTurnId =
    (reservation as any).endTurnId ??
    (reservation as any).end_turn_id ??
    undefined;
  const startTurn = timeSlots.find(
    (t: TimeSlot) => (t.idTurno ?? t.id) === startTurnId
  );
  const endTurn = timeSlots.find(
    (t: TimeSlot) => (t.idTurno ?? t.id) === endTurnId
  );

  if (!room || !startTurn || !endTurn) return null;

  const dateStr =
    getReservationDate(reservation) ?? reservation.fecha ?? reservation.date;
  const reservationStartTime =
    buildDateTimeFromDateAndTime(
      dateStr,
      (startTurn as any).horaInicio ??
        (startTurn as any).hora_inicio ??
        (startTurn as any).startTime
    ) ?? new Date(0);
  const reservationEndTime =
    buildDateTimeFromDateAndTime(
      dateStr,
      (endTurn as any).horaFin ??
        (endTurn as any).hora_fin ??
        (endTurn as any).endTime
    ) ?? new Date(0);

  const now = new Date();
  
  const confirmationWindowStart = new Date(
    reservationStartTime.getTime() - 15 * 60 * 1000
  );
  const isConfirmable =
    now >= confirmationWindowStart && now <= reservationEndTime;
  // Organizer may be named creadoPor in responses
  const organizerId =
    (reservation as any).creadoPor ??
    (reservation as any).creado_por ??
    (reservation as any).organizerId;
  const isOrganizer = currentUserId === organizerId;

  const ld = parseDateAsLocal(dateStr);
  const formattedDate = (ld || new Date(dateStr)).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeValueToHHMM = (val: any) => {
    if (val == null) return "";
    if (typeof val === "number" && !isNaN(val)) {
      const hours = Math.floor(val / 3600);
      const minutes = Math.floor((val % 3600) / 60);
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
        2,
        "0"
      )}`;
    }
    if (typeof val === "string") {
      return val.substring(0, 5); // "17:00:00" -> "17:00", or "17:00" -> "17:00"
    }
    return "";
  };

  const startRaw =
    (startTurn as any).horaInicio ??
    (startTurn as any).hora_inicio ??
    (startTurn as any).startTime;
  const endRaw =
    (endTurn as any).horaFin ??
    (endTurn as any).hora_fin ??
    (endTurn as any).endTime;
  const formattedTime = `${timeValueToHHMM(startRaw)} - ${timeValueToHHMM(
    endRaw
  )}`;

  
  const participantsList =
    reservation.participantes ?? reservation.participants ?? [];
  let acceptedParticipants = 0;
  if (
    Array.isArray(participantsList) &&
    participantsList.length > 0 &&
    typeof participantsList[0] === "object"
  ) {
    acceptedParticipants = participantsList.filter(
      (p) =>
        (p.estadoParticipacion ??
          p.estado_participacion ??
          p.participationStatus) === ParticipantStatus.CONFIRMADA
    ).length;
  } else if (participantIds != null) {
    acceptedParticipants = participantIds.length;
  } else if (
    (reservation as any).idParticipante != null ||
    (reservation as any).id_participante != null
  ) {
    // Single participant record shape: count if confirmed
    const pStatus =
      (reservation as any).estadoParticipacion ??
      (reservation as any).estado_participacion ??
      (reservation as any).participationStatus;
    acceptedParticipants = pStatus === ParticipantStatus.CONFIRMADA ? 1 : 0;
  } else {
    acceptedParticipants = 0;
  }
  console.log(reservation);
  

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="flex-grow">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-ucu-primary">{room.nombre}</h3>
          {(() => {
            const reservationStatus =
              reservation.estado ??
              (reservation as any).status ??
              (reservation as any).estadoParticipacion ??
              (reservation as any).participationStatus;
            return (
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${getStatusBadge(
                  reservationStatus as ReservationStatus
                )}`}
              >
                {reservationStatus}
              </span>
            );
          })()}
        </div>
        <p className="text-sm text-gray-500">
          {building ? building.nombre : ""}
        </p>

        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-2 md:gap-6 text-sm text-ucu-dark-gray">
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>{formattedTime}</span>
          </div>
          <div className="flex items-center">
            <UserGroupIcon className="w-4 h-4 mr-2 text-gray-400" />
            <span>{acceptedParticipants} participante(s)</span>
          </div>
        </div>
      </div>
      <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
        <div className="flex flex-row md:flex-row gap-2">
          {reservation.estado === ReservationStatus.ACTIVA &&
            isConfirmable &&
            reservation.asistencia === AttendanceStatus.NO_REGISTRADO &&
            reservationId != null && (
              <button
                onClick={() => onConfirm(reservationId, true)}
                className="text-sm bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Confirmar Asistencia
              </button>
            )}
          {reservation.estado === ReservationStatus.ACTIVA &&
            isConfirmable &&
            reservation.asistencia === AttendanceStatus.NO_REGISTRADO &&
            reservationId != null && (
              <button
                onClick={() => onConfirm(reservationId, false)}
                className="text-sm bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Confirmar Inasistencia
              </button>
            )}
        </div>
        {isOrganizer &&
          reservation.estado === ReservationStatus.ACTIVA &&
          reservationStartTime > now &&
          reservationId != null && (
            <button
              onClick={() =>
                onCancel(reservationId, {
                  id_sala: reservation.idSala,
                  fecha: reservation.fecha,
                  start_turn_id: reservation.startTurnId,
                  end_turn_id: reservation.endTurnId,
                  estado: "cancelada",
                  creado_por: reservation.creadoPor,
                })
              }
              className="text-sm bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
            >
              Cancelar
            </button>
          )}
        {!isOrganizer &&
          reservation.estadoParticipacion === ParticipantStatus.PENDIENTE &&
          reservationStartTime > now &&
          reservation.estado !== ReservationStatus.CANCELADA &&
          reservationId != null && (
            <button
              onClick={() => onConfirmInvitation(reservationId, true)}
              className="text-sm bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              Aceptar
            </button>
          )}
        {!isOrganizer &&
          reservation.estadoParticipacion === ParticipantStatus.PENDIENTE &&
          reservationStartTime > now &&
          reservation.estado !== ReservationStatus.CANCELADA &&
          reservationId != null && (
            <button
              onClick={() => onConfirmInvitation(reservationId, false)}
              className="text-sm bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
            >
              Rechazar
            </button>
          )}
      </div>
    </div>
  );
};

export const MyReservations: React.FC = () => {
  const appContext = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  if (!appContext) return null;

  const { user, reservations, setReservations, rooms, buildings, timeSlots } =
    appContext;

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getMyReservations();
        setReservations(data);
      } catch (err: any) {
        setError(`Failed to load reservations: ${err.message}`);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, [setReservations]);

  const getReservationEndDateTime = (res: Reservation) => {
    const endTurnId = res.endTurnId ?? res.endTurnId ?? res.endTurnId;
    const endTurn = timeSlots.find((t) => (t.idTurno ?? t.id) === endTurnId);
    if (!endTurn) return new Date(0);
    return new Date(
      `${res.fecha ?? res.date}T${endTurn.hora_fin ?? endTurn.endTime}`
    );
  };

  const handleCancelReservation = (
    reservationId: number,
    updatedReservationData: any
  ) => {
    if (reservationId == null) return; // guard against undefined
    if (window.confirm("¿Estás seguro de que quieres cancelar esta reserva?")) {
      updateReservation(reservationId, updatedReservationData)
        .then(() => {
            getMyReservations().then((data) => {
                setReservations(data);
            });
        })
        .catch((err) => {
          if ((err as any)?.status === 403) {
            alert(
              "No tienes permisos para cancelar esta reserva (403 Forbidden)."
            );
          } else {
            alert(`Error al cancelar: ${err.message}`);
          }
        });
    }
  };

  const handleConfirmAttendance = (
    reservationId: number,
    attendance: boolean
  ) => {
    if (reservationId == null) return;
    updateReservationAttendance(reservationId, attendance)
      .then(() => {
        getMyReservations()
            .then((data) => {
                setReservations(data);
            });
      })
      .catch((err) => {
        if ((err as any)?.status === 403) {
          alert(
            "No tienes permisos para confirmar esta reserva (403 Forbidden)."
          );
        } else {
          alert(`Error al confirmar: ${err.message}`);
        }
      });
  };
  const handleConfirmInvitation = (reservationId: number, accept: boolean) => {
    if (reservationId == null) return;
    updateReservationParticipation(reservationId, accept)
      .then(() => {
        getMyReservations().then((data) => {
            setReservations(data);
        });
      }) 
      .catch((err) => {
        if ((err as any)?.status === 403) {
          alert(
            "No tienes permisos para responder a esta invitación (403 Forbidden)."
          );
        } else {
          alert(`Error al procesar la invitación: ${err.message}`);
        }
      });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 flex justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-center text-red-500">
        Error al cargar las reservas: {error}
      </div>
    );
  }

  const userReservations = reservations;

  const upcomingReservations = userReservations.filter((r) => {
    const s = r.estado;
    return (
      r.estado === ReservationStatus.ACTIVA ||
      r.estado === ReservationStatus.CONFIRMADA
    );
  });

  const pastReservations = userReservations.filter((r) => {
    const s = r.estado;
    return (
      r.estado === ReservationStatus.NO_ASISTENCIA ||
      r.estado === ReservationStatus.FINALIZADA
    );
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-ucu-primary mb-4">
          Próximas Reservas
        </h2>
        <div className="space-y-4">
          {upcomingReservations.length > 0 ? (
            upcomingReservations.map((res) => (
              <ReservationCard
                key={res.idReserva ?? res.id}
                reservation={res}
                onCancel={handleCancelReservation}
                onConfirmInvitation={handleConfirmInvitation}
                onConfirm={handleConfirmAttendance}
                currentUserId={user.idParticipante}
                rooms={rooms}
                buildings={buildings}
                timeSlots={timeSlots}
              />
            ))
          ) : (
            <p className="text-gray-500 bg-white p-4 rounded-lg shadow-sm">
              No tienes reservas activas.
            </p>
          )}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-bold text-ucu-primary mb-4">
          Historial de Reservas
        </h2>
        <div className="space-y-4">
          {pastReservations.length > 0 ? (
            pastReservations.map((res) => (
              <ReservationCard
                key={res.idReserva ?? res.id}
                reservation={res}
                onCancel={handleCancelReservation}
                onConfirmInvitation={handleConfirmInvitation}
                onConfirm={handleConfirmAttendance}
                currentUserId={user.idParticipante ?? user.id}
                rooms={rooms}
                buildings={buildings}
                timeSlots={timeSlots}
              />
            ))
          ) : (
            <p className="text-gray-500 bg-white p-4 rounded-lg shadow-sm">
              No tienes reservas pasadas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
