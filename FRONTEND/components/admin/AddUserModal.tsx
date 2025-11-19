import React, { useState } from 'react';
import { User, Role, Program } from '../../types';

interface AddUserModalProps {
  onClose: () => void;
  onAdd: (newUser: Omit<User, 'id'>) => void;
  programs: Program[];
}

export const AddUserModal: React.FC<AddUserModalProps> = ({ onClose, onAdd, programs }) => {
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [ci, setCi] = useState('');
  const [active, setActive] = useState(true);
  const [role, setRole] = useState<Role>(Role.ALUMNO_GRADO);
  const [selectedProgramIds, setSelectedProgramIds] = useState<number[]>([]);

  const handleProgramChange = (programId: number) => {
    setSelectedProgramIds(prev =>
        prev.includes(programId)
            ? prev.filter(id => id !== programId)
            : [...prev, programId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() === '' || lastName.trim() === '' || email.trim() === '' || ci.trim() === '') {
        alert("Todos los campos son obligatorios.");
        return;
    }
    onAdd({nombre: name, apellido: lastName, email, ci, activo: active, rol: role, idProgramas: selectedProgramIds });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-ucu-primary">Agregar Nuevo Usuario</h2>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
                    <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                </div>
                <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido</label>
                    <input type="text" id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
                </div>
            </div>
             <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
            </div>
            <div>
                <label htmlFor="ci" className="block text-sm font-medium text-gray-700">CI (sin puntos ni guiones)</label>
                <input type="text" id="ci" value={ci} onChange={(e) => setCi(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" required />
            </div>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Rol</label>
                    <select id="role" value={role} onChange={(e) => setRole(e.target.value as Role)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                        {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="active" className="block text-sm font-medium text-gray-700">Estado</label>
                    <select id="active" value={active.toString()} onChange={(e) => setActive(e.target.value === 'true')} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Programas Asignados</label>
                <div className="mt-2 p-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto space-y-2">
                {programs.map(program => (
                    <div key={program.idPrograma} className="flex items-center">
                    <input
                        type="checkbox"
                        id={`program-${program.idPrograma}`}
                        checked={selectedProgramIds.includes(program.idPrograma)}
                        onChange={() => handleProgramChange(program.idPrograma)}
                        className="h-4 w-4 text-ucu-secondary border-gray-300 rounded focus:ring-ucu-secondary"
                    />
                    <label htmlFor={`program-${program.idPrograma}`} className="ml-2 text-sm text-gray-700">{program.name}</label>
                    </div>
                ))}
                </div>
            </div>
        </div>
        <div className="p-6 border-t mt-auto bg-gray-50 flex justify-end space-x-3">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-ucu-secondary text-white rounded-md hover:bg-blue-600">Agregar Usuario</button>
        </div>
      </form>
    </div>
  );
};
