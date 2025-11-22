import React, { useContext } from 'react';
import { User, Reservation, ReservationStatus } from '../../types';
import { AppContext } from '../../App';
import { getParticipantReservations } from '../../services/api';

interface UserHistoryModalProps {
  user: User;
  reservations: Reservation[];
  onClose: () => void;
}

const getStatusBadge = (status: ReservationStatus) => {
  switch (status) {
    case ReservationStatus.ACTIVA:
      return 'bg-blue-100 text-blue-800';
    case ReservationStatus.CONFIRMADA:
      return 'bg-teal-100 text-teal-800';
    case ReservationStatus.FINALIZADA:
      return 'bg-green-100 text-green-800';
    case ReservationStatus.CANCELADA:
      return 'bg-gray-100 text-gray-800';
    case ReservationStatus.NO_ASISTENCIA:
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const UserHistoryModal: React.FC<UserHistoryModalProps> = ({ user, reservations, onClose }) => {
  const appContext = useContext(AppContext);
  const { rooms, timeSlots } = appContext || {};
  const [userReservations, setUserReservations] = React.useState<Reservation[]>([]);
  
  const getReservationDateTime = (dateStr: string, turnId: number) => {
    const turn = timeSlots?.find(t => t.idTurno === turnId);
    if (!turn) return new Date(0);
    return new Date(`${dateStr}T${turn.startTime}`);
  };
 
  React.useEffect(() => {
    getParticipantReservations(user.idParticipante).then(data => setUserReservations(data)).catch(err => console.error(err));
  }, [user.idParticipante]);
  
  
  const noShowCount = userReservations.filter(r => 
    r.asistencia === 'ausente'
  ).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-start">
            <h2 className="text-2xl font-bold text-ucu-primary">Historial de {user.nombre} {user.apellido}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl font-light">&times;</button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Sanctions */}
          <div>
            <h3 className="text-lg font-semibold text-ucu-dark-gray mb-2">Sanciones</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="font-bold text-red-800 text-2xl">{noShowCount}</p>
              <p className="text-sm text-red-700">Inasistencias (como organizador)</p>
            </div>
          </div>
          
          {/* Reservation History */}
          <div>
            <h3 className="text-lg font-semibold text-ucu-dark-gray mb-2">Historial de Reservas</h3>
            <div className="border rounded-lg overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {userReservations.length > 0 ? (
                  userReservations.map(res => {
                    const room = rooms?.find(r => r.idSala === res.idSala);
                    const dateTime = getReservationDateTime(res.fecha, res.startTurnId);
                    return (
                      <li key={res.idReserva} className="p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-800">{room?.nombre || 'Sala desconocida'}</p>
                            <p className="text-sm text-gray-500">
                              {dateTime.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(res.estado)}`}>
                            {res.estado}
                          </span>
                        </div>
                      </li>
                    );
                  })
                ) : (
                  <li className="p-4 text-center text-gray-500">
                    Este usuario no tiene reservas en su historial.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="p-6 border-t mt-auto bg-gray-50 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cerrar</button>
        </div>
      </div>
    </div>
  );
};