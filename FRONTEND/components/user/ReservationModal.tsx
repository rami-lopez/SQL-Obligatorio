import React, { useState, useContext, useEffect } from "react";
import {
  Room,
  User,
  ReservationParticipant,
  ParticipantStatus,
  ReservationStatus,
  Role,
  AttendanceStatus,
} from "../../types";
import { CalendarIcon } from "../icons";
import { AppContext } from "../../App";
import {
  createReservation,
  getAllReservations,
  getParticipantSanctions,
} from "../../services/api";
import { getReservationRoomId, getRoomId, getUserId } from "../../utils";

interface ReservationModalProps {
  room: Room;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  room,
  onClose,
}) => {
  const appContext = useContext(AppContext);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTurnIds, setSelectedTurnIds] = useState<number[]>([]);
  const [sanctioned, setsanctioned] = useState(true);

  const currentUser = appContext?.user;
  const currentUserId = currentUser
    ? currentUser.idParticipante ?? currentUser.id
    : undefined;
  const [participants, setParticipants] = useState<ReservationParticipant[]>(
    currentUserId
      ? [
          {
            idParticipante: currentUserId,
            participantId: currentUserId,
            estadoParticipacion: ParticipantStatus.CONFIRMADA,
            participationStatus: ParticipantStatus.CONFIRMADA,
            asistencia: AttendanceStatus.NO_REGISTRADO,
            attendance: AttendanceStatus.NO_REGISTRADO,
          },
        ]
      : []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [allReservations, setAllReservations] = useState([]);

  if (!currentUser || !appContext) {
    return null;
  }
  const { reservations, setReservations, timeSlots, users } = appContext;

  const toggleTurn = (turnId: number) => {
    const newTurnIds = [...selectedTurnIds];
    const turnIndex = newTurnIds.indexOf(turnId);

    if (turnIndex > -1) {
      newTurnIds.splice(turnIndex, 1);
    } else {
      if (newTurnIds.length < 2) {
        newTurnIds.push(turnId);
      } else {
        alert("Puede reservar un máximo de 2 horas (2 turnos) por día.");
      }
    }
    newTurnIds.sort((a, b) => a - b);
    setSelectedTurnIds(newTurnIds);
  };
  useEffect(() => {
    const checkSanctions = async () => {
      getParticipantSanctions(currentUser.idParticipante).then((data) => {
        if (data.length > 0) {
          setsanctioned(true);
        } else {
          setsanctioned(false);
        }
      });
    };
    checkSanctions();
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await getAllReservations();
        setAllReservations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };
    fetchReservations();
  }, []);

  const getTimeFromTurn = (turnId: number) => {
    const turn = timeSlots.find((t) => t.idTurno === turnId);
    return turn ? turn.startTime.substring(0, 5) : "N/A";
  };
  const occupiedTurnIds = allReservations
    .filter((r) => {
      if (
        getReservationRoomId(r) === getRoomId(room) &&
        r.fecha === selectedDate &&
        (r.estado === ReservationStatus.ACTIVA ||
          r.estado === ReservationStatus.CONFIRMADA)
      )
        return true;

      return false;
    })
    .flatMap((r) => {
      const start =
        r.start_turn_id ?? r.startTurnId ?? r.startTurnId ?? undefined;
      const end = r.end_turn_id ?? r.endTurnId ?? r.endTurnId ?? undefined;
      const turns: number[] = [];
      if (typeof start === "number" && typeof end === "number") {
        for (let i = start; i <= end; i++) {
          turns.push(i);
        }
      }
      return turns;
    });

  const addParticipant = (userToAdd: User) => {
    const uid = getUserId(userToAdd);
    if (!uid) return;
    const capacity = room.capacidad ?? room.capacity;
    if (participants.length >= capacity) return;
    if (participants.some((p) => getUserId(p as any) === uid)) return;
    const newP: ReservationParticipant = {
      id_participante: uid,
      idParticipante: uid,
      participantId: uid,
      estado_participacion: ParticipantStatus.PENDIENTE,
      estadoParticipacion: ParticipantStatus.PENDIENTE,
      participationStatus: ParticipantStatus.PENDIENTE,
      asistencia: AttendanceStatus.NO_REGISTRADO,
      attendance: AttendanceStatus.NO_REGISTRADO,
    } as any;
    setParticipants((prev) => [...prev, newP]);
    setSearchTerm(""); // Clear search after adding
  };

  const removeParticipant = (userToRemove: User) => {
    const uid = getUserId(userToRemove);
    const currentUid = getUserId(currentUser);
    if (!uid) return;
    if (uid === currentUid) return;
    setParticipants((prev) => prev.filter((p) => getUserId(p as any) !== uid));
  };

  const participantUsers = participants.map((p) => {
    const participantId = getUserId(p as any);
    const user = users.find((u) => getUserId(u) === participantId);
    return {
      ...p,
      name: user
        ? `${user.nombre ?? user.name} ${user.apellido ?? user.lastName}`
        : "Usuario desconocido",
      user: user,
    } as any;
  });

  const filteredUsers = users
    .filter(
      (u) =>
        `${u.nombre ?? u.name} ${u.apellido ?? u.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) &&
        !participants.some((p) => getUserId(p as any) === getUserId(u))
    )
    .slice(0, 5); // Limit suggestions

  const handleConfirm = async () => {
    if (selectedTurnIds.length === 0) {
      alert("Por favor seleccione al menos un turno.");
      return;
    }
    // Basic contiguity check
    for (let i = 0; i < selectedTurnIds.length - 1; i++) {
      if (selectedTurnIds[i + 1] !== selectedTurnIds[i] + 1) {
        alert("Los turnos seleccionados deben ser contiguos.");
        return;
      }
    }
    if (participants.length > (room.capacidad ?? room.capacity)) {
      alert(
        `El número de participantes (${
          participants.length
        }) excede la capacidad de la sala (${room.capacidad ?? room.capacity}).`
      );
      return;
    }
    if (participants.length === 0) {
      alert("Debe haber al menos un participante en la reserva.");
      return;
    }

    const participantIds = participants
      .map((p) => getUserId(p as any))
      .filter((x): x is number => typeof x === "number");

    const newReservationData = {
      id_sala: room.idSala ?? room.id,
      fecha: selectedDate,
      start_turn_id: selectedTurnIds[0],
      end_turn_id: selectedTurnIds[selectedTurnIds.length - 1],
      participantes: participantIds,
      creado_por: currentUser.idParticipante ?? getUserId(currentUser),
    };

    try {
      const createdReservation = await createReservation(
        newReservationData as any
      );
      setReservations([...reservations, createdReservation]);
      alert(
        `Reserva para ${
          room.nombre ?? room.name
        } confirmada. Se han enviado invitaciones a los participantes.`
      );
      onClose();
    } catch (error: any) {
      console.error("Failed to create reservation", error);
      alert(`Error al crear la reserva: ${error.response.detail}`);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-ucu-primary">
                Reservar Sala: {room.nombre ?? room.name}
              </h2>
              <p className="text-gray-500">
                Capacidad: {room.capacidad ?? room.capacity} personas
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl font-light"
            >
              &times;
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <label
              htmlFor="date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              1. Seleccione la fecha
            </label>
            <div className="relative">
              <input
                type="date"
                id="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-ucu-secondary focus:border-ucu-secondary"
              />
              <CalendarIcon className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. Seleccione los turnos (máx. 2)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {timeSlots.map((turn) => {
                const turnId = turn.idTurno ?? turn.id;
                const isSelected = selectedTurnIds.includes(turnId);
                const occupied = occupiedTurnIds.includes(turnId);
                const gone =
                  (getTimeFromTurn(turnId) <=
                    new Date().toLocaleTimeString(undefined, {
                      hour12: false,
                    }) &&
                    selectedDate <= new Date().toISOString().split("T")[0]) ||
                  selectedDate < new Date().toISOString().split("T")[0];

                return (
                  <button
                    key={turnId}
                    disabled={occupied || gone}
                    onClick={() => toggleTurn(turnId)}
                    className={`p-2 rounded-md text-sm text-center border transition-colors
                                    ${
                                      occupied || gone
                                        ? "bg-gray-200 text-gray-400 cursor-not-allowed line-through"
                                        : ""
                                    }
                                    ${
                                      isSelected
                                        ? "bg-ucu-primary text-white border-ucu-primary shadow-md"
                                        : ""
                                    }
                                    ${
                                      !occupied && !gone && !isSelected
                                        ? "bg-white hover:bg-ucu-light-gray"
                                        : ""
                                    }
                                `}
                  >
                    {turn.descripcion}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3. Añadir participantes ({participants.length}/{room.capacidad})
            </label>
            <div className="flex flex-wrap gap-2 mb-2 p-2 border border-gray-300 rounded-md min-h-[44px] bg-gray-50">
              {participantUsers.map((p) => (
                <span
                  key={p.idParticipante}
                  title={p.estadoParticipacion}
                  className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium shadow-sm ${
                    p.estadoParticipacion === ParticipantStatus.CONFIRMADA
                      ? "bg-ucu-primary text-white"
                      : "bg-ucu-light-blue text-ucu-primary"
                  }`}
                >
                  {p.idParticipante === currentUserId ? "👑 " : ""}
                  {p.name}
                  {(p.id_participante ?? p.participantId) !== currentUserId &&
                    p.user && (
                      <button
                        onClick={() => removeParticipant(p.user as User)}
                        className="font-bold text-ucu-primary/70 hover:text-red-500 transition-colors"
                      >
                        &times;
                      </button>
                    )}
                </span>
              ))}
            </div>

            {participants.length < (room.capacidad ?? room.capacity) ? (
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar y agregar usuarios..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-ucu-secondary focus:border-ucu-secondary"
                />
                {searchTerm && filteredUsers.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                    {filteredUsers.map((u) => (
                      <li
                        key={u.id_participante ?? u.id}
                        onClick={() => addParticipant(u)}
                        className="px-4 py-2 hover:bg-ucu-light-gray cursor-pointer"
                      >
                        {u.nombre ?? u.name} {u.apellido ?? u.lastName}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : (
              <p className="text-sm text-center text-gray-500 p-2 bg-ucu-light-gray rounded-md">
                Capacidad máxima de la sala alcanzada.
              </p>
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
          {sanctioned ? (
            <button
              disabled
              className="px-4 py-2 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
              title="Usuario sancionado"
            >
              Sancionado
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              className="px-4 py-2 bg-ucu-secondary text-white rounded-md hover:bg-blue-600"
            >
              Confirmar Reserva
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
