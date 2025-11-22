import React, { useState } from "react";
import { User, Role, Program } from "../../types";

interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSave: (updatedUser: User) => void;
  programs: Program[];
}

export const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  onClose,
  onSave,
  programs,
}) => {
  const [editedUser, setEditedUser] = useState<User>(user);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "activo") {
      setEditedUser((prev) => ({ ...prev, activo: value === "1" ? 1 : 0 }));
    } else {
      setEditedUser((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleProgramChange = (programId: number) => {
    const currentProgramIds = editedUser.programIds || [];
    const newProgramIds = currentProgramIds.includes(programId)
      ? currentProgramIds.filter((id) => id !== programId)
      : [...currentProgramIds, programId];
    setEditedUser((prev) => ({ ...prev, programIds: newProgramIds }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedUser.nombre.trim() === "" || editedUser.apellido.trim() === "") {
      alert("El nombre y el apellido no pueden estar vacíos.");
      return;
    }
    onSave(editedUser);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all max-h-[90vh] flex flex-col"
      >
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-ucu-primary">
            Editar Usuario: {user.nombre} {user.apellido}
          </h2>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={editedUser.nombre}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
            <div>
              <label
                htmlFor="apellido"
                className="block text-sm font-medium text-gray-700"
              >
                Apellido
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={editedUser.apellido}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={editedUser.email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>
          <div>
            <label
              htmlFor="ci"
              className="block text-sm font-medium text-gray-700"
            >
              CI (sin puntos ni guiones)
            </label>
            <input
              type="text"
              id="ci"
              name="ci"
              value={editedUser.ci}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="rol"
                className="block text-sm font-medium text-gray-700"
              >
                Rol
              </label>
              <select
                id="rol"
                name="rol"
                value={editedUser.rol}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                <option value={Role.ADMIN}>Admin</option>
                <option value={Role.ALUMNO_GRADO}>Alumno de Grado</option>
                <option value={Role.ALUMNO_POSGRADO}>Alumno de Posgrado</option>
                <option value={Role.DOCENTE}>Docente</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="activo"
                className="block text-sm font-medium text-gray-700"
              >
                Estado
              </label>
              <select
                id="activo"
                name="activo"
                value={editedUser.activo}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
              >
                <option value="1">Activo</option>
                <option value="0">Inactivo</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Programas Asignados
            </label>
            <div className="mt-2 p-2 border border-gray-300 rounded-md max-h-40 overflow-y-auto space-y-2">
              {programs.map((program) => (
                <div key={program.idPrograma} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`edit-program-${program.idPrograma}`}
                    checked={editedUser.programIds?.includes(
                      program.idPrograma
                    )}
                    onChange={() => handleProgramChange(program.idPrograma)}
                    className="h-4 w-4 text-ucu-secondary border-gray-300 rounded focus:ring-ucu-secondary"
                  />
                  <label
                    htmlFor={`edit-program-${program.idPrograma}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {program.nombre}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t mt-auto bg-gray-50 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-ucu-secondary text-white rounded-md hover:bg-blue-600"
          >
            Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  );
};
