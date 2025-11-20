import React, { useState, useContext } from 'react';
import { Room, RoomType, Building } from '../../types';
import { AppContext } from '../../App';

interface AddRoomModalProps {
  onClose: () => void;
  onAdd: (newRoom: Omit<Room, 'id'>) => void;
}

export const AddRoomModal: React.FC<AddRoomModalProps> = ({ onClose, onAdd }) => {
  const appContext = useContext(AppContext);
  const buildings = appContext?.buildings || [];
  
  const [newRoom, setNewRoom] = useState<Omit<Room, 'id'>>({
    nombre: '',
    id_edificio: buildings[0]?.idEdificio || 0,
    capacidad: 10,
    tipo: RoomType.LIBRE,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewRoom(prev => ({ ...prev, [name]: name === 'capacidad' || name === 'id_edificio' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRoom.nombre.trim() === '' || newRoom.capacidad <= 0 || !newRoom.id_edificio) {
        alert("Por favor, complete todos los campos correctamente.");
        return;
    }
    onAdd(newRoom);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-ucu-primary">Agregar Nueva Sala</h2>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre de la Sala</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={newRoom.nombre}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
              required
            />
          </div>
          <div>
            <label htmlFor="id_edificio" className="block text-sm font-medium text-gray-700">Edificio</label>
            <select
              id="id_edificio"
              name="id_edificio"
              value={newRoom.id_edificio}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
            >
              {buildings.map((b: Building) => <option key={b.idEdificio} value={b.idEdificio}>{b.nombre}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="capacidad" className="block text-sm font-medium text-gray-700">Capacidad</label>
            <input
              type="number"
              id="capacidad"
              name="capacidad"
              value={newRoom.capacidad}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
              required
              min="1"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo de Sala</label>
            <select
              id="tipo"
              name="tipo"
              value={newRoom.tipo}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
            >
              {Object.values(RoomType).map(type => <option key={type} value={type}>{type}</option>)}
            </select>
          </div>
        </div>
        <div className="p-6 border-t mt-auto bg-gray-50 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-ucu-secondary text-white rounded-md hover:bg-blue-600">Agregar Sala</button>
        </div>
      </form>
    </div>
  );
};