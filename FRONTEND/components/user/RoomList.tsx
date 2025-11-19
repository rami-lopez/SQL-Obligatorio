import React, { useState, useContext } from 'react';
import { Building, Room } from '../../types';
import { SalaCard } from '../common/SalaCard';
import { ReservationModal } from './ReservationModal';
import { AppContext } from '../../App';
import { getBuildingId, getRoomId } from '../../utils';

interface RoomListProps {
  building: Building;
}

export const RoomList: React.FC<RoomListProps> = ({ building }) => {
  const appContext = useContext(AppContext);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const buildingIdValue = getBuildingId(building);
  const roomsInBuilding = (appContext?.rooms || []).filter(room => getBuildingId(room) === buildingIdValue);

  const handleReserveClick = (room: Room) => {
    setSelectedRoom(room);
  };
  
  const handleCloseModal = () => {
    setSelectedRoom(null);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <h2 className="text-2xl font-bold text-ucu-primary mb-1">Salas disponibles en: <span className="text-ucu-dark-gray">{building.nombre}</span></h2>
      <p className="text-gray-500 mb-6">Seleccioná una sala para ver los horarios y realizar una reserva.</p>
      
      {/* TODO: Add filtering UI */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {roomsInBuilding.length > 0 ? (
            roomsInBuilding.map((room, idx) => (
              <SalaCard key={String(getRoomId(room) ?? idx)} room={room} onReserve={() => handleReserveClick(room)} />
            ))
        ) : (
          <p className="text-gray-500 col-span-full">No hay salas disponibles en este edificio.</p>
        )}
      </div>

      {selectedRoom && <ReservationModal room={selectedRoom} onClose={handleCloseModal} />}
    </div>
  );
};