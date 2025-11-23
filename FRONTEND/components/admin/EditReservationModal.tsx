import React, { useState, useContext, useEffect } from "react";
import {
  Reservation,
  Room,
  User,
  ReservationStatus,
  ParticipantStatus,
  Role,
  AttendanceStatus,
} from "../../types";
import { AppContext } from "../../App";
import { getRoomId, getUserId } from "../../utils";
import { getReservationParticipants } from "../../services/api";

interface EditReservationModalProps {
  reservation: Reservation;
  onClose: () => void;
  onSave: (updatedReservation: Reservation) => void;
}

export const EditReservationModal: React.FC<EditReservationModalProps> = ({
  reservation,
  onClose,
  onSave,
}) => {
  const appContext = useContext(AppContext);
  const { timeSlots, rooms, users } = appContext || {};

  const [edited, setEdited] = useState<Reservation>(reservation);
  const initialRoomId = ((reservation as any).idSala ??
    (reservation as any).roomId) as number | undefined;
  const [roomSearch, setRoomSearch] = useState(
    rooms?.find((r) => getRoomId(r) === initialRoomId)?.nombre || ""
  );
  const [participantSearch, setParticipantSearch] = useState("");
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);
  const [participantIds, setParticipantIds] = useState<number[]>(() => {
    // seed from reservation if it already has participant ids
    const arr: any[] = (reservation.participantes ??
      (reservation as any).participants) as any[] | undefined;
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.map(
        (p) => p.participantId ?? p.idParticipante ?? p.id_participante ?? p
      );
    }
    return [];
  });

  if (!appContext || !timeSlots || !rooms || !users) return null;

  useEffect(() => {
    const fetchParticipants = async () => {
      const resId =
        (reservation as any).idReserva ??
        (reservation as any).id_reserva ??
        (reservation as any).id;
      if (!resId) return;
      try {
        const ids = await getReservationParticipants(resId as number);
        if (Array.isArray(ids)) {
          setParticipantIds(ids.map((p) => p.idParticipante));
          setEdited((prev) => ({
            ...prev,
            participantes: ids.map((id) => ({
              id_participante: id,
              estado_participacion: ParticipantStatus.CONFIRMADA,
              asistencia: AttendanceStatus.NO_REGISTRADO,
            })),
          }));
        }
      } catch (err) {
        console.error("Failed to fetch reservation participants", err);
      }
    };
    fetchParticipants();
  }, [reservation]);

  const currentRoom = rooms.find(
    (r) => r.idSala === ((edited as any).idSala ?? (edited as any).roomId)
  );
  const capacity = (currentRoom?.capacity ?? currentRoom?.capacidad) || 0;

  const handleInputChange = (field: string, value: any) => {
    setEdited((prev) => ({ ...prev, [field]: value }));
  };

  const addParticipant = (user: User) => {
    const uid = getUserId(user);
    if (!uid) return;

    // Normalize participantIds (may contain objects) into an array of numeric ids
    const currentIds = participantIds
      .map((p) =>
        typeof p === "number"
          ? p
          : (p as any).id_participante ??
            (p as any).participantId ??
            (p as any).idParticipante ??
            (p as any).id
      )
      .filter((v): v is number => Number.isFinite(v));

    const capacityOk = capacity === 0 ? true : currentIds.length < capacity;
    if (!capacityOk) return;

    if (!currentIds.includes(uid)) {
      const newIds = [...currentIds, uid];


      setParticipantIds(newIds);
      setEdited((prev) => ({
        ...prev,
        participantes: newIds.map((id) => ({
          id_participante: id,
          estado_participacion: ParticipantStatus.CONFIRMADA,
          asistencia: AttendanceStatus.NO_REGISTRADO,
        })),
      }));
      setParticipantSearch("");
    }
  };

  const removeParticipant = (userId: number) => {
   
    const organizerId =
      (edited as any).creadoPor ?? (edited as any).organizerId;
    if (userId === organizerId) return; // Cannot remove organizer
    const newIds = participantIds.filter((id) => id !== userId);

    setParticipantIds(newIds);
    setEdited((prev) => ({
      ...prev,
      participantes: newIds.map((id) => ({
        id_participante: id,
        estado_participacion: ParticipantStatus.CONFIRMADA,
        asistencia: AttendanceStatus.NO_REGISTRADO,
      })),
    }));
  };

  const handleSave = () => {
    if ((edited as any).startTurnId > (edited as any).endTurnId) {
      alert("El turno de inicio debe ser anterior o igual al turno de fin.");
      return;
    }
    if (participantIds.length > capacity) {
      alert(
        `El número de participantes excede la capacidad de la sala (${capacity}).`
      );
      return;
    }
    const finalEdited: Reservation = {
      ...edited,
      participantes: participantIds.map((id) => ({
        id_participante: id,
        estado_participacion: ParticipantStatus.CONFIRMADA,
        asistencia: AttendanceStatus.NO_REGISTRADO,
      })),
    } as Reservation;
    onSave(finalEdited);
  };

  const participantUsers = participantIds
    .map((id) => users.find((u) => getUserId(u) === ( id.idParticipante ?? id) ))
    .filter(Boolean) as User[];

  const suggestedUsers = users
    .filter(
      (u) =>
        `${u.nombre ?? u.name} ${u.apellido ?? u.lastName}`
          .toLowerCase()
          .includes(participantSearch.toLowerCase()) &&
        !participantIds.includes(getUserId(u))
    )
    .slice(0, 5);
  const suggestedRooms = rooms
    .filter((r) =>
      (r.nombre ?? r.name ?? "")
        .toLowerCase()
        .includes(roomSearch.toLowerCase())
    )
    .slice(0, 5);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-ucu-primary">
              Editar Reserva #{reservation.idReserva}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl font-light"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          {/* Room */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Sala
            </label>
            <div className="relative">
              <input
                type="text"
                value={roomSearch}
                onChange={(e) => {
                  setRoomSearch(e.target.value);
                }}
                onFocus={() => setShowRoomSuggestions(true)}
                onBlur={() =>
                  setTimeout(() => setShowRoomSuggestions(false), 200)
                }
                placeholder="Buscar sala..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
              />
              {showRoomSuggestions &&
                roomSearch &&
                suggestedRooms.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {suggestedRooms.map((room) => (
                      <li
                        key={room.idSala}
                        onMouseDown={() => {
                          setRoomSearch(room.nombre);
                          handleInputChange("idSala", room.idSala);
                          setShowRoomSuggestions(false);
                        }}
                        className="px-4 py-2 hover:bg-ucu-light-gray cursor-pointer"
                      >
                        {room.nombre}
                      </li>
                    ))}
                  </ul>
                )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Estado
            </label>
            <select
              value={edited.estado}
              onChange={(e) =>
                handleInputChange("estado", e.target.value as ReservationStatus)
              }
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
            >
              {Object.values(ReservationStatus).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Times */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Fecha
            </label>
            <input
              type="date"
              value={edited.fecha}
              onChange={(e) => handleInputChange("fecha", e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Turno Inicio
              </label>
              <select
                value={edited.startTurnId}
                onChange={(e) =>
                  handleInputChange("startTurnId", parseInt(e.target.value, 10))
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
              >
                {timeSlots.map((t) => (
                  <option key={t.idTurno} value={t.idTurno}>
                    {t.descripcion}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Turno Fin
              </label>
              <select
                value={edited.endTurnId}
                onChange={(e) =>
                  handleInputChange("endTurnId", parseInt(e.target.value, 10))
                }
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
              >
                {timeSlots.map((t) => (
                  <option key={t.idTurno} value={t.idTurno}>
                    {t.descripcion}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Participants */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Participantes ({participantIds.length}/{capacity || "N/A"})
            </label>
            <div className="flex flex-wrap gap-2 mt-1 p-2 border border-gray-300 rounded-md min-h-[44px] bg-gray-50">
              {participantUsers &&
                participantUsers.map((user) => (
                  <span
                    key={user.idParticipante}
                    className="flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium shadow-sm bg-ucu-primary text-white"
                  >
                    {user.nombre} {user.apellido}
                    {user.idParticipante != edited.creadoPor ? (
                      <button
                        onClick={() => removeParticipant(user.idParticipante)}
                        className="font-bold hover:text-red-500 transition-colors"
                      >
                        x
                      </button>
                    ) : null}
                  </span>
                ))}
            </div>

            {participantIds.length < capacity && (
              <div className="relative mt-2">
                <input
                  type="text"
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  placeholder="Buscar y agregar usuarios..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
                {participantSearch && suggestedUsers.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {suggestedUsers.map((user, idx) => (
                      <li
                        key={user.idParticipante}
                        onClick={() => addParticipant(user)}
                        className="px-4 py-2 hover:bg-ucu-light-gray cursor-pointer"
                      >
                        {user.nombre} {user.apellido}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t mt-auto bg-gray-50 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-ucu-secondary text-white rounded-md hover:bg-blue-600"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
