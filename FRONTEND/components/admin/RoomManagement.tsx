import React, { useState, useContext } from 'react';
import { Room, RoomType } from '../../types';
import { EditRoomModal } from './EditRoomModal';
import { AddRoomModal } from './AddRoomModal';
import { AppContext } from '../../App';
import { createRoom, updateRoom, deleteRoom } from '../../services/api';

interface RoomManagementProps {
    rooms: Room[];
    setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
}

export const RoomManagement: React.FC<RoomManagementProps> = ({ rooms, setRooms }) => {
  const appContext = useContext(AppContext);
  const buildings = appContext?.buildings || [];
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterBuildingId, setFilterBuildingId] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterCapacity, setFilterCapacity] = useState('');
  const [filterType, setFilterType] = useState('');
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roomToDeleteId, setRoomToDeleteId] = useState<number | null>(null);

  const filteredRooms = rooms.filter(room => {
    if (filterBuildingId && room.idEdificio !== parseInt(filterBuildingId, 10)) {
      return false;
    }
    if (filterName && !room.nombre.toLowerCase().includes(filterName.toLowerCase())) {
      return false;
    }
    if (filterType && room.tipo !== filterType) {
      return false;
    }
    if (filterCapacity) {
      if (filterCapacity === 'small' && room.capacidad >= 10) return false;
      if (filterCapacity === 'medium' && (room.capacidad < 10 || room.capacidad > 20)) return false;
      if (filterCapacity === 'large' && room.capacidad <= 20) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setFilterBuildingId('');
    setFilterName('');
    setFilterCapacity('');
    setFilterType('');
  };
  
  const handleAddRoom = async (newRoomData: Omit<Room, 'id'>) => {
    try {
        const newRoom = await createRoom(newRoomData);
        setRooms(prev => [...prev, newRoom]);
        setIsAddModalOpen(false);
    } catch (error: any) {
        alert(`Error al agregar sala: ${error.message}`);
    }
  }

  const handleSaveChanges = async (updatedRoom: Room) => {
    try {
        const savedRoom = await updateRoom(updatedRoom.id, updatedRoom);
        setRooms(prev => prev.map(r => r.id === savedRoom.id ? savedRoom : r));
        setEditingRoom(null);
    } catch (error: any) {
        alert(`Error al guardar sala: ${error.message}`);
    }
  };
  
  const handleDelete = (roomId: number) => {
    setRoomToDeleteId(roomId);
    setIsDeleteModalOpen(true);
  };
  
  const confirmDelete = async () => {
    if (roomToDeleteId !== null) {
        try {
            await deleteRoom(roomToDeleteId);
            setRooms(prev => prev.filter(r => r.id !== roomToDeleteId));
        } catch (error: any) {
            alert(`Error al eliminar sala: ${error.message}`);
        } finally {
            setRoomToDeleteId(null);
            setIsDeleteModalOpen(false);
        }
    }
  };


  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-ucu-primary">Gestión de Salas</h2>
        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-ucu-secondary text-white rounded-md hover:bg-blue-600">
          Agregar Sala
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="building-filter" className="block text-sm font-medium text-gray-700">Edificio</label>
          <select
            id="building-filter"
            value={filterBuildingId}
            onChange={e => setFilterBuildingId(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary sm:text-sm rounded-md"
          >
            <option value="">Todos</option>
            {buildings.map(building => (
              <option key={building.idEdificio} value={building.idEdificio}>{building.nombre}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="name-filter" className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            id="name-filter"
            value={filterName}
            onChange={e => setFilterName(e.target.value)}
            placeholder="Buscar por nombre..."
            className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary sm:text-sm rounded-md"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="capacity-filter" className="block text-sm font-medium text-gray-700">Capacidad</label>
          <select
            id="capacity-filter"
            value={filterCapacity}
            onChange={e => setFilterCapacity(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary sm:text-sm rounded-md"
          >
            <option value="">Todas</option>
            <option value="small">Chica (&lt;10)</option>
            <option value="medium">Mediana (10-20)</option>
            <option value="large">Grande (&gt;20)</option>
          </select>
        </div>
        <div className="flex-1 min-w-[150px]">
          <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">Tipo</label>
          <select
            id="type-filter"
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary sm:text-sm rounded-md"
          >
            <option value="">Todos</option>
            {Object.values(RoomType).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="self-end">
          <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium">Limpiar Filtros</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Nombre</th>
              <th scope="col" className="px-6 py-3">Edificio</th>
              <th scope="col" className="px-6 py-3">Capacidad</th>
              <th scope="col" className="px-6 py-3">Tipo</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredRooms.map(room => {
              const building = buildings.find(b => b.idEdificio === room.idEdificio);
              return (
                <tr key={room.idSala} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{room.idSala}</td>
                  <td className="px-6 py-4">{room.nombre}</td>
                  <td className="px-6 py-4">{building?.nombre || 'N/A'}</td>
                  <td className="px-6 py-4">{room.capacidad}</td>
                  <td className="px-6 py-4">{room.tipo}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <button onClick={() => setEditingRoom(room)} className="text-blue-600 hover:underline font-medium">Editar</button>
                      <button onClick={() => handleDelete(room.idSala)} className="text-red-600 hover:underline font-medium">Eliminar</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filteredRooms.length === 0 && (
          <div className="text-center p-8 text-gray-500">
            No se encontraron salas que coincidan con los filtros seleccionados.
          </div>
        )}
      </div>
        {isDeleteModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
                <div className="p-6">
                    <div className="flex items-start">
                        <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">Confirmar Eliminación</h3>
                            <p className="mt-2 text-sm text-gray-500">¿Estás seguro de que quieres eliminar esta sala? Esta acción es permanente.</p>
                        </div>
                    </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
                    <button onClick={confirmDelete} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm">Eliminar</button>
                    <button onClick={() => setIsDeleteModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm">Cancelar</button>
                </div>
              </div>
            </div>
        )}
        {editingRoom && (
            <EditRoomModal
                room={editingRoom}
                onClose={() => setEditingRoom(null)}
                onSave={handleSaveChanges}
            />
        )}
        {isAddModalOpen && (
            <AddRoomModal 
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddRoom}
            />
        )}
    </div>
  );
};