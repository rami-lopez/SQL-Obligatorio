import React, { useState } from 'react';
import { Program, Faculty } from '../../types';
import { EditProgramModal } from './EditProgramModal';
import { AddProgramModal } from './AddProgramModal';
import { createProgram, updateProgram, deleteProgram } from '../../services/api';

interface ProgramManagementProps {
    programs: Program[];
    setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
    faculties: Faculty[];
}

export const ProgramManagement: React.FC<ProgramManagementProps> = ({ programs, setPrograms, faculties }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [programToDeleteId, setProgramToDeleteId] = useState<number | null>(null);

  const handleAddProgram = async (newProgramData: Omit<Program, 'id'>) => {
    try {
        const newProgram = await createProgram(newProgramData);
        setPrograms(prev => [...prev, newProgram]);
        setIsAddModalOpen(false);
    } catch(error: any) {
        alert(`Error al agregar programa: ${error.message}`);
    }
  };

  const handleSaveChanges = async (updatedProgram: Program) => {
    try {
        const savedProgram = await updateProgram(updatedProgram.idPrograma, updatedProgram);
       
        setPrograms(prev => prev.map(p => p.idPrograma === savedProgram.idPrograma ? savedProgram : p));
        setEditingProgram(null);
    } catch (error: any) {
        alert(`Error al guardar programa: ${error.message}`);
    }
  };
  
  const handleDelete = (programId: number) => {
    setProgramToDeleteId(programId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (programToDeleteId !== null) {
        try {
            await deleteProgram(programToDeleteId);
            setPrograms(prev => prev.filter(p => p.idPrograma !== programToDeleteId));
        } catch(error: any) {
            alert(`Error al eliminar programa: ${error.message}`);
        } finally {
            setProgramToDeleteId(null);
            setIsDeleteModalOpen(false);
        }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-ucu-primary">Gestión de Programas</h2>
        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-ucu-secondary text-white rounded-md hover:bg-blue-600">
          Agregar Programa
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Nombre del Programa</th>
              <th scope="col" className="px-6 py-3">Facultad</th>
              <th scope="col" className="px-6 py-3">Tipo</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {programs.map(program => (
              <tr key={program.idPrograma} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{program.idPrograma}</td>
                <td className="px-6 py-4">{program.nombre}</td>
                <td className="px-6 py-4">{faculties.find(f => f.idFacultad === program.idFacultad)?.nombre || 'N/A'}</td>
                <td className="px-6 py-4 capitalize">{program.tipo}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <button onClick={() => setEditingProgram(program)} className="text-blue-600 hover:underline font-medium">Editar</button>
                    <button onClick={() => handleDelete(program.idPrograma)} className="text-red-600 hover:underline font-medium">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                            <p className="mt-2 text-sm text-gray-500">¿Estás seguro de que quieres eliminar este programa? Esta acción es permanente.</p>
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
        {editingProgram && (
            <EditProgramModal
                program={editingProgram}
                faculties={faculties}
                onClose={() => setEditingProgram(null)}
                onSave={handleSaveChanges}
            />
        )}
        {isAddModalOpen && (
            <AddProgramModal
                faculties={faculties}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddProgram}
            />
        )}
    </div>
  );
};