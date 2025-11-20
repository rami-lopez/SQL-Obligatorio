import {useContext, useState, useEffect} from 'react';
import React from 'react';
import { ReservationStatus, Room, RoomType } from '../../types';
import { UserGroupIcon, ClockIcon } from '../icons';
import { AppContext } from '../../App';
import { getIsRoomOcuppied } from '@/services/api';
import { getReservationRoomId, getRoomId, getUserId } from '../../utils';

interface SalaCardProps {
  room: Room;
  onReserve: () => void;
}


const getRoomTypeColor = (type: RoomType) => {
  switch (type) {
    case RoomType.POSGRADO:
      return 'bg-purple-100 text-purple-800';
    case RoomType.DOCENTE:
      return 'bg-green-100 text-green-800';
    case RoomType.LIBRE:
    default:
      return 'bg-blue-100 text-blue-800';
  }
};

export const SalaCard: React.FC<SalaCardProps> = ({ room, onReserve }) => {

  const appContext = useContext(AppContext);
  if (!appContext) {
    return null;
  }
  const user = appContext?.user
    const reservations = appContext?.reservations;
    const timeSlots = appContext?.timeSlots;

  const tiempo = new Date().toISOString().split('T')[0];

  const [isAvailableNow, setAvail] = useState(true)
  const [puedeReservar, setPuedeReservar] = useState(false)

  // ver que salas puede usar
  useEffect(() => {
      if (user.rol === 'docente') {
        setPuedeReservar(true)
        return;
      }
      if (user.rol === 'alumno_posgrado' && (room.tipo === 'posgrado' || room.tipo === 'libre')) {
        setPuedeReservar(true)
        return;
      }
      if (user.rol === 'alumno_grado' && room.tipo === 'libre') {
        setPuedeReservar(true)
        return;
      }
    }, [user])

    useEffect(() => {
      const verificacionOcupada = async () => {
        try {
          const salaOcupada = await getIsRoomOcuppied(room.idSala, tiempo)
          setAvail(!salaOcupada)
          console.log(salaOcupada, room.idSala, tiempo)
        } catch (error) {
          return error;
        }
      }
      verificacionOcupada();
    }, [])

  return (
    <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-lg hover:border-ucu-primary transition-all duration-300 bg-white">
      <div>
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-ucu-primary">{room.nombre}</h3>
            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getRoomTypeColor(room.tipo)}`}>
            {room.tipo}
            </span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-2">
          <UserGroupIcon className="w-4 h-4 mr-2" />
          <span>Capacidad: {room.capacidad} personas</span>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <ClockIcon className="w-4 h-4 mr-2" />
          <span className={isAvailableNow ? 'text-green-600' : 'text-orange-600'}>
            {isAvailableNow ? 'Disponible ahora' : 'Verificar horarios'}
          </span>
        </div>
      </div>

      {puedeReservar ? 
      <button 
        onClick={onReserve}
        className="mt-4 w-full bg-ucu-secondary text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Reservar sala
      </button> :
      
      <button 
        disabled
        className="mt-4 w-full bg-gray-600 text-white font-semibold py-2 rounded-md hover:bg-gray-600 transition-colors"
      >
        Exclusivo {room.tipo}
      </button>
      }
    </div>
  );
};
