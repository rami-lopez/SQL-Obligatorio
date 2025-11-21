import React, { useState } from 'react';
import { User, Role, Program, Reservation } from '../../types';
import { AddUserModal } from './AddUserModal';
import { EditUserModal } from './EditUserModal';
import { UserHistoryModal } from './UserHistoryModal';
import { createUser, updateUser, deleteUser } from '../../services/api';

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

  const handleAddUser = async (newUserData: Omit<User, 'id'>) => {
    try {
        const newUser = await createUser(newUserData);
        setUsers(prev => [...prev, newUser]);
        setIsAddModalOpen(false);
    } catch (error: any) {
        alert(`Error al agregar usuario: ${error.message}`);
    }
  };

  const handleSaveChanges = async (updatedUser: User) => {
    try {
        const savedUser = await updateUser(updatedUser.idParticipante, updatedUser);
        setUsers(prev => prev.map(u => u.idParticipante === savedUser.idParticipante ? savedUser : u));
        setEditingUser(null);
    } catch (error: any) {
        alert(`Error al guardar usuario: ${error.message}`);
    }
  };

  const handleDelete = (userId: number) => {
    setUserToDeleteId(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDeleteId !== null) {
      try {
        await deleteUser(userToDeleteId);
        setUsers(prev => prev.filter(u => u.idParticipante !== userToDeleteId));
      } catch (error: any) {
        alert(`Error al eliminar usuario: ${error.message}`);
      } finally {
        setUserToDeleteId(null);
        setIsDeleteModalOpen(false);
      }
    }
  };
console.log(users);

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-ucu-primary">Gestión de Usuarios</h2>
        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 bg-ucu-secondary text-white rounded-md hover:bg-blue-600">
          Agregar Usuario
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Nombre</th>
              <th scope="col" className="px-6 py-3">Email</th>
              <th scope="col" className="px-6 py-3">Rol</th>
              <th scope="col" className="px-6 py-3">Estado</th>
              <th scope="col" className="px-6 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.idParticipante} className="bg-white border-b hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{user.idParticipante}</td>
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
    </div>
  );
};