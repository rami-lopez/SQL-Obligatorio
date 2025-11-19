import React, { useState, useContext } from 'react';
import { Room, RoomType, Building } from '../../types';
import { AppContext } from '../../App';

interface EditRoomModalProps {
  room: Room;
  onClose: () => void;
  onSave: (updatedRoom: Room) => void;
}

export const EditRoomModal: React.FC<EditRoomModalProps> = ({ room, onClose, onSave }) => {
  const appContext = useContext(AppContext);
  const buildings = appContext?.buildings || [];
  const [editedRoom, setEditedRoom] = useState<Room>(room);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedRoom(prev => ({ ...prev, [name]: name === 'capacity' || name === 'buildingId' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(editedRoom);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-ucu-primary">Editar Sala: {room.name}</h2>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la Sala</label>
            <input
              type="text"
              id="name"
              name="name"
              value={editedRoom.name}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
              required
            />
          </div>
          <div>
            <label htmlFor="buildingId" className="block text-sm font-medium text-gray-700">Edificio</label>
            <select
              id="buildingId"
              name="buildingId"
              value={editedRoom.buildingId}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
            >
              {buildings.map((b: Building) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">Capacidad</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={editedRoom.capacity}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
              required
              min="1"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Sala</label>
            <select
              id="type"
              name="type"
              value={editedRoom.type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
            >
              {Object.values(RoomType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>
        <div className="p-6 border-t mt-auto bg-gray-50 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-ucu-secondary text-white rounded-md hover:bg-blue-600">Guardar Cambios</button>
        </div>
      </form>
    </div>
  );
};