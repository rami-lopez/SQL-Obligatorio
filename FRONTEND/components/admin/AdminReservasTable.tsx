import React, { useState, useContext, useEffect } from "react";
import { Reservation, ReservationStatus } from "../../types";
import { EditReservationModal } from "./EditReservationModal";
import { AppContext } from "../../App";
import {
  deleteReservation,
  getAllReservations,
  updateReservation,
} from "../../services/api";
import {
  getReservationId as uid,
  getReservationDate as getResDate,
  getReservationStartTurnId as getResStartTurn,
  getReservationRoomId as getResRoomId,
  getReservationOrganizerId as getResOrganizerId,
  getUserId,
  getRoomId,
  timeStringToSeconds,
  secondsToTimeString,
  buildDateTimeIso,
} from "../../utils";

interface AdminReservasTableProps {
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
}

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

export const AdminReservasTable: React.FC<AdminReservasTableProps> = () => {
  const appContext = useContext(AppContext);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const { users, rooms, timeSlots } = appContext || {};
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await getAllReservations();
        setReservations(data);
      } catch (error) {
        console.error("Error fetching reservations:", error);
      }
    };
    fetchReservations();
  }, []);

  // Use shared helpers from utils for normalization
  const getReservationStatus = (r: any) => r.estado ?? r.status ?? r.estado;
  const [filterRoomName, setFilterRoomName] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterOrganizerName, setFilterOrganizerName] = useState<string>("");
  const [showRoomSuggestions, setShowRoomSuggestions] = useState(false);
  const [showOrganizerSuggestions, setShowOrganizerSuggestions] =
    useState(false);
  const [editingReservation, setEditingReservation] =
    useState<Reservation | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [reservationToDeleteId, setReservationToDeleteId] = useState<
    number | null
  >(null);

  const getReservationDateTime = (res: any) => {
    const dateStr = getResDate(res);
    const turnId = getResStartTurn(res);
    // find turn by multiple possible keys
    const turn = timeSlots?.find(
      (t) =>
        t.id === turnId ||
        (t as any).idTurno === turnId ||
        (t as any).id_turno === turnId
    );
    if (!turn || !dateStr) return new Date(0);
    const timeVal =
      (turn as any).horaInicio ??
      (turn as any).hora_inicio ??
      (turn as any).startTime ??
      (turn as any).start_time;
    const iso = buildDateTimeIso(dateStr, timeVal);
    return iso ? new Date(iso) : new Date(0);
  };

  const reservationsWithDetails = reservations
    .map((res) => {
      const organizerId = getResOrganizerId(res);
      const roomId = getResRoomId(res);
      const user = users?.find((u) => getUserId(u) === organizerId) || null;
      const room = rooms?.find((r) => getRoomId(r) === roomId) || null;
      return { ...res, user, room };
    })
    .sort(
      (a, b) =>
        getReservationDateTime(b).getTime() -
        getReservationDateTime(a).getTime()
    );

  const filteredReservations = reservationsWithDetails.filter((res) => {
    const roomName = (res.room?.nombre).toLowerCase();
    const organizerName = res.user
      ? `${res.user.nombre} ${res.user.apellido}`.toLowerCase()
      : "";
    const lowerCaseFilterRoom = filterRoomName.toLowerCase();
    const lowerCaseFilterOrganizer = filterOrganizerName.toLowerCase();
    const statusVal = getReservationStatus(res);

    if (filterRoomName && !roomName.includes(lowerCaseFilterRoom)) return false;
    if (filterStatus && statusVal !== filterStatus) return false;
    if (
      filterOrganizerName &&
      !organizerName.includes(lowerCaseFilterOrganizer)
    )
      return false;

    return true;
  });

  const clearFilters = () => {
    setFilterRoomName("");
    setFilterStatus("");
    setFilterOrganizerName("");
  };

  const suggestedRooms =
    rooms?.filter((room) =>
      (room.nombre ?? room.name ?? "")
        .toLowerCase()
        .includes(filterRoomName.toLowerCase())
    ) || [];

  const suggestedOrganizers =
    users?.filter((user) =>
      `${user.nombre ?? user.name} ${user.apellido ?? ""}`
        .toLowerCase()
        .includes(filterOrganizerName.toLowerCase())
    ) || [];

  const handleDelete = (reservationId: number) => {
    setReservationToDeleteId(reservationId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (reservationToDeleteId !== null) {
      try {
        await deleteReservation(reservationToDeleteId);
        setReservations((prev) =>
          prev.filter((res) => uid(res) !== reservationToDeleteId)
        );
      } catch (error: any) {
        alert(`Error al eliminar la reserva: ${error.message}`);
      } finally {
        setReservationToDeleteId(null);
        setIsDeleteModalOpen(false);
      }
    }
  };

  const handleSaveChanges = async (updatedReservation) => {
    try {
      const resId = uid(updatedReservation as any);
      if (resId == null) throw new Error("Reservation id is missing");
      console.log(updatedReservation);
      const participantesFormatted = [];

      updatedReservation.participantes.forEach(part => {
        participantesFormatted.push(part.id_participante);
      });
      const formated = {
        id_sala: updatedReservation.idSala,
        fecha: updatedReservation.fecha,
        start_turn_id: updatedReservation.startTurnId,
        end_turn_id: updatedReservation.endTurnId,
        estado: updatedReservation.estado,
        creado_por: updatedReservation.creadoPor,
        participantes: participantesFormatted,
      };
      console.log(formated);
      
      const savedReservation = await updateReservation(resId, formated);

      // setReservations(prev => prev.map(res => uid(res) === uid(savedReservation as any) ? savedReservation : res));
      //setEditingReservation(null);
    } catch (error: any) {
      alert(`Error al guardar la reserva: ${error.message}`);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
      <h2 className="text-2xl font-bold text-ucu-primary mb-4">
        Gestión de Reservas
      </h2>

      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="relative flex-1 min-w-[150px]">
          <label
            htmlFor="room-filter"
            className="block text-sm font-medium text-gray-700"
          >
            Sala
          </label>
          <input
            type="text"
            id="room-filter"
            value={filterRoomName}
            onChange={(e) => setFilterRoomName(e.target.value)}
            onFocus={() => setShowRoomSuggestions(true)}
            onBlur={() => setTimeout(() => setShowRoomSuggestions(false), 150)}
            placeholder="Buscar por nombre de sala..."
            autoComplete="off"
            className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary sm:text-sm rounded-md"
          />
          {showRoomSuggestions &&
            filterRoomName &&
            suggestedRooms.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                {suggestedRooms.map((room) => (
                  <li
                    key={getRoomId(room)}
                    onMouseDown={() => {
                      setFilterRoomName(room.nombre);
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
        <div className="flex-1 min-w-[150px]">
          <label
            htmlFor="status-filter"
            className="block text-sm font-medium text-gray-700"
          >
            Estado
          </label>
          <select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary sm:text-sm rounded-md"
          >
            <option value="">Todos</option>
            {Object.values(ReservationStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
        <div className="relative flex-1 min-w-[150px]">
          <label
            htmlFor="organizer-filter"
            className="block text-sm font-medium text-gray-700"
          >
            Organizador
          </label>
          <input
            type="text"
            id="organizer-filter"
            value={filterOrganizerName}
            onChange={(e) => setFilterOrganizerName(e.target.value)}
            onFocus={() => setShowOrganizerSuggestions(true)}
            onBlur={() =>
              setTimeout(() => setShowOrganizerSuggestions(false), 150)
            }
            placeholder="Buscar por nombre..."
            autoComplete="off"
            className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary sm:text-sm rounded-md"
          />
          {showOrganizerSuggestions &&
            filterOrganizerName &&
            suggestedOrganizers.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-md mt-1 max-h-40 overflow-y-auto shadow-lg">
                {suggestedOrganizers.map((user) => (
                  <li
                    key={user.idParticipante}
                    onMouseDown={() => {
                      setFilterOrganizerName(`${user.nombre} ${user.apellido}`);
                      setShowOrganizerSuggestions(false);
                    }}
                    
                    className="px-4 py-2 hover:bg-ucu-light-gray cursor-pointer"
                  >
                    {user.nombre} {user.apellido}
                  </li>
                ))}
              </ul>
            )}
        </div>
        <div className="self-end">
          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">
                Sala
              </th>
              <th scope="col" className="px-6 py-3">
                Organizador
              </th>
              <th scope="col" className="px-6 py-3">
                Fecha y Hora
              </th>
              <th scope="col" className="px-6 py-3">
                Estado
              </th>
              <th scope="col" className="px-6 py-3">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredReservations.map((res) => {
              const rowId = uid(res);
              return (
                <tr key={rowId} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                    {(res.room?.nombre ?? res.room?.name) || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {res.user
                      ? `${
                          (res.user.nombre ?? res.user.name) +
                          " " +
                          (res.user.apellido ?? "")
                        }`
                      : "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    {getReservationDateTime(res as any).toLocaleString(
                      "es-ES",
                      { dateStyle: "short", timeStyle: "short" }
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        getReservationStatus(res) as ReservationStatus
                      )}`}
                    >
                      {getReservationStatus(res)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      {res.estado !== "no_asistencia" &&
                      res.estado !== "finalizada" ? (
                        <button
                          onClick={() =>
                            setEditingReservation(
                              reservations.find((r) => uid(r) === rowId) || null
                            )
                          }
                          className="text-blue-600 hover:underline font-medium"
                        >
                          Editar
                        </button>
                      ) : null}
                      <button
                        onClick={() => handleDelete(rowId)}
                        className="text-red-600 hover:underline font-medium"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredReservations.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            No se encontraron reservas que coincidan con los filtros
            seleccionados.
          </div>
        )}
      </div>
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <svg
                    className="h-6 w-6 text-red-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Confirmar Eliminación
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    ¿Estás seguro de que quieres eliminar esta reserva? Esta
                    acción es permanente y no se puede deshacer.
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
              <button
                onClick={confirmDelete}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Eliminar
              </button>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      {editingReservation && (
        <EditReservationModal
          reservation={editingReservation}
          onClose={() => setEditingReservation(null)}
          onSave={handleSaveChanges}
        />
      )}
    </div>
  );
};
