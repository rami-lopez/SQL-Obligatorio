import React, { useState } from 'react';
import { Program, Faculty, ProgramType } from '../../types';

interface AddProgramModalProps {
  faculties: Faculty[];
  onClose: () => void;
  onAdd: (newProgram: Omit<Program, 'id'>) => void;
}

export const AddProgramModal: React.FC<AddProgramModalProps> = ({ faculties, onClose, onAdd }) => {
  const [name, setName] = useState('');
  const [facultyId, setFacultyId] = useState<number>(faculties[0]?.id || 0);
  const [type, setType] = useState<ProgramType>(ProgramType.GRADO);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '' || !facultyId) {
        alert("El nombre y la facultad son obligatorios.");
        return;
    }
    onAdd({ name, facultyId, type });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-ucu-primary">Agregar Nuevo Programa</h2>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Programa</label>
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
            <label htmlFor="facultyId" className="block text-sm font-medium text-gray-700">Facultad</label>
            <select
              id="facultyId"
              name="facultyId"
              value={facultyId}
              onChange={(e) => setFacultyId(parseInt(e.target.value, 10))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
            >
                {faculties.map(f => <option key={f.idFacultad} value={f.idFacultad}>{f.nombre}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              id="type"
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value as ProgramType)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
            >
                {Object.values(ProgramType).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="p-6 border-t mt-auto bg-gray-50 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-ucu-secondary text-white rounded-md hover:bg-blue-600">Agregar Programa</button>
        </div>
      </form>
    </div>
  );
};
