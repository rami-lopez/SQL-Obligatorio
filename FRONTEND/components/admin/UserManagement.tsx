import React, { useEffect, useState } from 'react';
import { User, Role, Program, Reservation } from '../../types';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { UserHistoryModal } from './UserHistoryModal';
import { SanctionUserModal } from './SanctionUserModal';
import { createUser, updateUser, deleteUser, getUsers, getActiveSanctions, createSanction, getParticipantSanctions, deleteSanction } from '../../services/api';

interface UserManagementProps {
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    programs: Program[];
    reservations: Reservation[];
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, programs, reservations }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDeleteId, setUserToDeleteId] = useState<number | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [activeSanctionsId, setActiveSanctionsId] = useState<any[]>([]);
  const [isSanctionModalOpen, setIsSanctionModalOpen] = useState(false);
  const [toSanction, setToSanction] = useState<User | null>(null);
  const [isSanctioned, setIsSanctioned] = useState<boolean | null>(null);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [ciFilter, setCiFilter] = useState<string>('');
  
  const clearFilters = () => {
    setNameFilter('');
    setCiFilter('');
  };

  useEffect(() => {
    getActiveSanctions().then((data) => {
        setActiveSanctionsId(data.map(s => s.idParticipante));
        
    });
  }, []);
  const handleAddUser = async (newUserData: Omit<User, 'id'>) => {
    try {
        const newUser = await createUser(newUserData);
        getUsers().then((data) => {
            setUsers(data);
            setIsAddModalOpen(false);
        });
    } catch (error: any) {
        alert(`Error al agregar usuario: ${error.message}`);
    }
  };

  const handleSaveChanges = async (updatedUser: User) => {
    try {
        const savedUser = await updateUser(updatedUser.idParticipante, updatedUser);
        const refreshed = await getUsers();
        setUsers(refreshed);
       
        setEditingUser(null);
    } catch (error: any) {
        alert(`Error al guardar usuario: ${error.message}`);
    }
  };

  const handleDelete = (userId: number) => {
    setUserToDeleteId(userId);
    setIsDeleteModalOpen(true);
  };
  const handleSanction = (user: User, isSanctioned: boolean) => {
    setToSanction(user);
      setIsSanctioned(isSanctioned);
      setIsSanctionModalOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDeleteId !== null) {
      try {
        await deleteUser(userToDeleteId);
        const refreshed = await getUsers();
        setUsers(refreshed);
      } catch (error: any) {
        alert(`Error al eliminar usuario: ${error.message}`);
      } finally {
        setUserToDeleteId(null);
        setIsDeleteModalOpen(false);
      }
    }
  };
  type SanctionPayload = { fechaInicio?: string; fechaFin?: string; motivo?: string } | undefined;

  const confirmSanction = async (payload?: SanctionPayload) => {
    if (toSanction !== null && isSanctioned !== null) {
      try {
        if (!isSanctioned) {
          // apply sanction - include participante id
          // Ensure fechaInicio is datetime (append time if only date provided)
          let fInicio = payload?.fechaInicio;
          if (fInicio && fInicio.length === 10) fInicio = fInicio + 'T00:00:00';
          await createSanction({ idParticipante: toSanction.idParticipante, fechaInicio: fInicio, fechaFin: payload?.fechaFin, motivo: payload?.motivo });
        } else {
          // revoke: fetch active sanctions for participant and delete them
          const sanctions = await getParticipantSanctions(toSanction.idParticipante);
          console.log(sanctions);
          
          for (const s of sanctions) {
            const sanctionId = s.idSancion ?? s.id_sancion ?? s.id;
            if (sanctionId) await deleteSanction(sanctionId);
          }
        }

        const refreshed = await getActiveSanctions();
        setActiveSanctionsId(refreshed.map(s => s.idParticipante));
        // refresh users list too in case anything changed
        const refreshedUsers = await getUsers();
        setUsers(refreshedUsers);
      } catch (error: any) {
        alert(`Error al sancionar/habilitar usuario: ${error.message}`);
      } finally {
        setToSanction(null);
        setIsSanctioned(null);
        setIsSanctionModalOpen(false);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-ucu-primary">Gestión de Usuarios</h2>
        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-ucu-secondary text-white rounded-md hover:bg-blue-600">
          Agregar Usuario
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700">Nombre</label>
          <input
            type="text"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            placeholder="Buscar por nombre o apellido..."
            className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary sm:text-sm rounded-md"
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700">CI</label>
          <input
            type="text"
            value={ciFilter}
            onChange={(e) => setCiFilter(e.target.value)}
            placeholder="Buscar por CI..."
            className="mt-1 block w-full pl-3 pr-4 py-2 text-base border-gray-300 focus:outline-none focus:ring-ucu-secondary focus:border-ucu-secondary sm:text-sm rounded-md"
          />
        </div>
        <div className="self-end">
          <button onClick={clearFilters} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 text-sm font-medium">Limpiar Filtros</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">Cédula</th>
              <th scope="col" className="px-6 py-3">Nombre</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Rol</th>
              <th scope="col" className="px-6 py-3">Estado</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users
              .filter(u => {
                // name filter: match nombre or apellido or full name
                const qName = nameFilter.trim().toLowerCase();
                if (qName) {
                  const full = `${u.nombre || ''} ${u.apellido || ''}`.toLowerCase();
                  if (!full.includes(qName)) return false;
                }
                // ci filter
                const qCi = ciFilter.trim();
                if (qCi) {
                  if (!((u.ci ?? '').toString().includes(qCi))) return false;
                }
                return true;
              })
              .map(user => (
              <tr key={user.idParticipante} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{user.ci}</td>
                <td className="px-6 py-4">{user.nombre} {user.apellido}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">{user.rol}</td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-4">
                    <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:underline font-medium">Editar</button>
                    <button onClick={() => handleDelete(user.idParticipante)} className="text-red-600 hover:underline font-medium">Eliminar</button>
                    <button onClick={() => setViewingUser(user)} className="text-green-600 hover:underline font-medium">Ver Historial</button>
                    {activeSanctionsId.includes(user.idParticipante) ? <button onClick={() => handleSanction(user, true)} className="text-blue-600 hover:underline font-medium">Habilitar</button>:
                      <button onClick={() => handleSanction(user, false)} className="text-red-600 hover:underline font-medium">Sancionar</button>}
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
                        <p className="mt-2 text-sm text-gray-500">¿Estás seguro de que quieres eliminar este usuario? Esta acción es permanente.</p>
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
      {editingUser && (
        <EditUserModal
            user={editingUser}
            programs={programs}
            onClose={() => setEditingUser(null)}
            onSave={handleSaveChanges}
        />
      )}
      {isAddModalOpen && (
        <AddUserModal
            programs={programs}
            onClose={() => setIsAddModalOpen(false)}
            onAdd={handleAddUser}
        />
      )}
      {viewingUser && (
          <UserHistoryModal
            user={viewingUser}
            reservations={reservations}
            onClose={() => setViewingUser(null)}
          />
      )}
      {isSanctionModalOpen && toSanction && (
        <SanctionUserModal
          toSanction={toSanction}
          isSanctioned={!!isSanctioned}
          onConfirm={confirmSanction}
          onCancel={() => setIsSanctionModalOpen(false)}
        />
      )}
    </div>
  );
};