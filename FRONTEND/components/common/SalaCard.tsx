import React from 'react';
import { Room, RoomType } from '../../types';
import { UserGroupIcon, ClockIcon } from '../icons';

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

  const isAvailableNow = Math.random() > 0.5;

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
            {isAvailableNow ? 'Disponible ahora' : 'Consultar horarios'}
          </span>
        </div>
      </div>
      <button 
        onClick={onReserve}
        className="mt-4 w-full bg-ucu-secondary text-white font-semibold py-2 rounded-md hover:bg-blue-600 transition-colors"
      >
        Reservar sala
      </button>
    </div>
  );
};
