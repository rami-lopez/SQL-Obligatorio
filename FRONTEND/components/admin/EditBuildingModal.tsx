import React, { useState } from 'react';
import { Building } from '../../types';

interface EditBuildingModalProps {
  building: Building;
  onClose: () => void;
  onSave: (updatedBuilding: Building) => void;
}

export const EditBuildingModal: React.FC<EditBuildingModalProps> = ({ building, onClose, onSave }) => {
  const [editedBuilding, setEditedBuilding] = useState<Building>(building);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedBuilding(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(editedBuilding.nombre.trim() === '' || editedBuilding.direccion.trim() === '') {
        alert("El nombre y la dirección no pueden estar vacíos.");
        return;
    }
    onSave(editedBuilding);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-ucu-primary">Editar Edificio: {building.nombre}</h2>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre del Edificio</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={editedBuilding.nombre}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
              required
            />
          </div>
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Dirección</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={editedBuilding.direccion}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
              required
            />
          </div>
          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700">Departamento</label>
            <input
              type="text"
              id="departamento"
              name="departamento"
              value={editedBuilding.departamento}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
            />
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
