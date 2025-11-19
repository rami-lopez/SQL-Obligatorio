import React, { useState } from 'react';
import { Program, Faculty, ProgramType } from '../../types';

interface EditProgramModalProps {
  program: Program;
  faculties: Faculty[];
  onClose: () => void;
  onSave: (updatedProgram: Program) => void;
}

export const EditProgramModal: React.FC<EditProgramModalProps> = ({ program, faculties, onClose, onSave }) => {
  const [editedProgram, setEditedProgram] = useState<Program>(program);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedProgram(prev => ({ ...prev, [name]: name === 'facultyId' ? parseInt(value, 10) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedProgram.nombre.trim() === '') {
        alert("El nombre no puede estar vacío.");
        return;
    }
    onSave(editedProgram);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-ucu-primary">Editar Programa: {program.name}</h2>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre del Programa</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={editedProgram.nombre}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
              required
            />
          </div>
          <div>
            <label htmlFor="facultyId" className="block text-sm font-medium text-gray-700">Facultad</label>
            <select
              id="facultadId"
              name="facultadId"
              value={editedProgram.idFacultad}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
            >
                {faculties.map(f => <option key={f.idFacultad} value={f.idFacultad}>{f.nombre}</option>)}
            </select>
          </div>
           <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">Tipo</label>
            <select
              id="tipo"
              name="tipo"
              value={editedProgram.tipo}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary"
            >
                {Object.values(ProgramType).map(t => <option key={t} value={t}>{t}</option>)}
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
