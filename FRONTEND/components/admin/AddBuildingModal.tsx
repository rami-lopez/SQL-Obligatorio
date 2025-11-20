import React, { useState } from 'react';
import { Building } from '../../types';

interface AddBuildingModalProps {
  onClose: () => void;
  onAdd: (newBuilding: Omit<Building, 'id' | 'mapPosition'>) => void;
}

export const AddBuildingModal: React.FC<AddBuildingModalProps> = ({ onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [department, setDepartment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '' || address.trim() === '') {
        alert("El nombre y la dirección no pueden estar vacíos.");
        return;
    }
    onAdd({ nombre: name, direccion: address, departamento:  department });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-ucu-primary">Agregar Nuevo Edificio</h2>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Edificio</label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              type="text"
              id="address"
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
              required
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
            <input
              type="text"
              id="department"
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
            />
          </div>
        </div>
        <div className="p-6 border-t mt-auto bg-gray-50 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-ucu-secondary text-white rounded-md hover:bg-blue-600">Agregar Edificio</button>
        </div>
      </form>
    </div>
  );
};
