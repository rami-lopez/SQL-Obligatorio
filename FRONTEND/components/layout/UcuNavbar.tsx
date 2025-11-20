import React, { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "../../App";
import ucuLogo from "../../assets/logo_ucu_40.svg";
import { NotificationIcon, ChatIcon, ChevronDownIcon } from "../icons";
import {
  Role,
  ParticipantStatus,
  Reservation,
  ReservationStatus,
  User,
  Room,
  TimeSlot,
} from "../../types";
import {
  getMyReservations,
  updateReservation,
  updateReservationParticipation,
  getParticipantSanctions,
  clearAuthToken,
} from "../../services/api";

function parseDateOnly(dateStr?: string | null) {
  if (!dateStr) return null;
  // Expect YYYY-MM-DD, construct local date to avoid timezone shifts
  const m = /^([0-9]{4})-([0-9]{2})-([0-9]{2})/.exec(dateStr);
  if (!m) return new Date(dateStr);
  const y = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10) - 1;
  const d = parseInt(m[3], 10);
  return new Date(y, mo, d);
}

const NotificationDropdown: React.FC<{
  invitations: Reservation[];
  onAccept: (reservationId: number, participation: boolean) => void;
  rooms: Room[];
  users: User[];
  timeSlots: TimeSlot[];
}> = ({ invitations, onAccept, rooms, users, timeSlots }) => {
  if (invitations.length === 0) {
    return (
      <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-20 p-4 text-sm text-gray-500">
        No tienes notificaciones nuevas.
      </div>
    );
  }

  const getTimeFromTurn = (turnId: number) => {
    const turn = timeSlots.find((t) => t.idTurno === turnId);
    return turn ? turn.startTime.substring(0, 5) : "N/A";
  };
  console.log(invitations);
  

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 overflow-hidden">
      <div className="p-3 bg-gray-50 border-b">
        <h3 className="text-sm font-semibold text-gray-800">
          Invitaciones a Reservas
        </h3>
      </div>
      <ul className="divide-y max-h-80 overflow-y-auto">
        {invitations.map((res) => {
          const resId = res.idReserva;
          const room = rooms.find((r) => r.idSala === res.idSala);
          const organizer = users.find(
            (u) => u.idParticipante === res.creadoPor 
          );
          const dateObj = parseDateOnly(res.fecha);
          const date = dateObj
            ? dateObj.toLocaleDateString("es-ES", {
                year: "numeric",
                weekday: "long",
                day: "numeric",
                month: "short",
              })
            : res.fecha
            ? new Date(res.fecha).toLocaleDateString("es-ES", {
                year: "numeric",
                weekday: "long",
                day: "numeric",
                month: "short",
              })
            : "";
          return (
            <li key={resId} className="p-3 text-gray-700 text-sm">
              <p>
                <span className="font-semibold">
                  {organizer?.nombre || "Alguien"}
                </span>{" "}
                te ha invitado a una reserva en
                <span className="font-semibold">
                  {" "}
                  {room?.nombre || "una sala"}
                </span>
                .
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {date} a las {getTimeFromTurn(res.startTurnId)}
              </p>
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => onAccept(resId, false)}
                  className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Rechazar
                </button>
                <button
                  onClick={() => onAccept(resId, true)}
                  className="px-3 py-1 text-xs font-medium text-white bg-ucu-secondary rounded-md hover:bg-blue-600"
                >
                  Aceptar
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export const UcuNavbar: React.FC = () => {
  const appContext = useContext(AppContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!appContext) return null;

  const {
    user,
    setUser,
    reservations,
    setReservations,
    users,
    rooms,
    timeSlots,
  } = appContext;

  const handleLogout = async () => {
    await clearAuthToken();
    setUser(null);
    setShowUserDropdown(false);
    window.location.href = "/"; 
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await getMyReservations();
        setReservations(data);
      } catch (error) {
        console.error("Failed to load reservations:", error);
      }
    };
    fetchReservations();
  }, [setReservations]);

  const [sanctions, setSanctions] = useState<any[]>([]);

  useEffect(() => {
    const fetchSanctions = async () => {
      if (!user) return setSanctions([]);
      const participantId =
        (user as any).idParticipante ??
        (user as any).id_participante ??
        (user as any).id;
      if (!participantId) return setSanctions([]);
      try {
        const data = await getParticipantSanctions(participantId);
        setSanctions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch sanctions:", err);
        setSanctions([]);
      }
    };
    fetchSanctions();
  }, [user]);

  const pendingInvitations = reservations.filter(
    (r) =>
      r.estadoParticipacion === ParticipantStatus.PENDIENTE &&
      r.estado !== ReservationStatus.CANCELADA &&
      r.fecha >= new Date().toISOString().split("T")[0]
  );

  const handleAccept = async (
    reservationId: number,
    participation: boolean
  ) => {
    try {
      const updatedReservation = await updateReservationParticipation(
        reservationId,
        participation
      );
      setReservations((prev) =>
        prev.map((res) => (res.id === reservationId ? updatedReservation : res))
      );
      setShowNotifications(false);
    } catch (error) {
      console.error("Failed to accept invitation:", error);
      alert("Error al aceptar la invitación.");
    }
  };

  return (
    <header className="bg-ucu-primary text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <img src={ucuLogo} alt="UCU Logo" className="h-8" />
            <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
              <a
                href="#"
                className="hover:text-ucu-light-blue transition-colors"
              >
                Página Principal
              </a>
              <a
                href="#"
                className="text-white font-semibold border-b-2 border-ucu-secondary pb-1"
              >
                Mis cursos
              </a>
              <a
                href="#"
                className="hover:text-ucu-light-blue transition-colors"
              >
                Soporte a Usuarios
              </a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-sm font-medium hover:text-ucu-light-blue transition-colors">
              Recientes <ChevronDownIcon className="w-4 h-4 ml-1" />
            </button>
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications((s) => !s)}
                className="relative hover:text-ucu-light-blue transition-colors"
              >
                <NotificationIcon className="w-6 h-6" />
                {pendingInvitations.length > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                      {pendingInvitations.length}
                    </span>
                  </span>
                )}
              </button>
              {showNotifications && (
                <NotificationDropdown
                  invitations={pendingInvitations}
                  onAccept={handleAccept}
                  rooms={rooms}
                  users={users}
                  timeSlots={timeSlots}
                />
              )}
            </div>
            <button className="hover:text-ucu-light-blue transition-colors">
              <ChatIcon className="w-6 h-6" />
            </button>
            <div className="w-px h-6 bg-white/30"></div>
            <div className="relative" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown((s) => !s)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div>
                  {user.rol != "admin" && sanctions && sanctions.length > 0 ? (
                    (() => {
                      const s = sanctions[0];
                      const start = parseDateOnly(
                        s?.fechaInicio ?? s?.fecha_inicio
                      );
                      const end = parseDateOnly(s?.fechaFin ?? s?.fecha_fin);
                      const startStr = start
                        ? start.toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "";
                      const endStr = end
                        ? end.toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "";
                      return (
                        <div className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-semibold">
                          Sanción: {startStr}
                          {endStr ? ` → ${endStr}` : ""}
                        </div>
                      );
                    })()
                  ) : (
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-ucu-primary font-bold text-lg">
                      {user.email ? user.email[0].toUpperCase() : ""}
                    </div>
                  )}
                </div>
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 overflow-hidden">
                  <div className="p-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Cerrar Sesión
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>  
        
      </div>
    </header>
  );
};
