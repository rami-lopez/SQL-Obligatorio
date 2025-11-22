import React, { useState } from "react";
import { User } from "@/types";

type SanctionPayload = {
  fechaInicio?: string;
  fechaFin?: string;
  motivo?: string;
};

type SanctionUserModalProps = {
  toSanction: User;
  onConfirm: (payload?: SanctionPayload) => void;
  onCancel: () => void;
  isSanctioned: boolean;
};

export const SanctionUserModal: React.FC<SanctionUserModalProps> = ({
  toSanction,
  onConfirm,
  onCancel,
  isSanctioned,
}) => {
  const today = new Date().toISOString().split("T")[0];
  const [fechaInicio, setFechaInicio] = useState<string>(today);
  const [fechaFin, setFechaFin] = useState<string>(today);
  const [motivo, setMotivo] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = () => {
    if (!isSanctioned) {
      // validate dates
      if (!fechaInicio || !fechaFin) {
        setError("Por favor complete ambas fechas.");
        return;
      }
      if (fechaFin < fechaInicio) {
        setError("La fecha fin debe ser igual o posterior a la fecha inicio.");
        return;
      }
      setError(null);
      onConfirm({ fechaInicio: new Date(fechaInicio).toISOString().split("T")[0], fechaFin: new Date(fechaFin).toISOString().split("T")[0], motivo: motivo || undefined });
    } else {
      // revoke sanction
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
              <svg
                className="h-6 w-6 text-red-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {isSanctioned ? "Revocar sanción" : "Sancionar usuario"}
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                {isSanctioned
                  ? `¿Deseas revocar la sanción de ${toSanction.nombre}? El usuario podrá volver a reservar.`
                  : `Sancionar a ${toSanction.nombre}. Completa el periodo y, opcionalmente, un motivo.`}
              </p>
            </div>
          </div>

          {!isSanctioned && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha inicio</label>
                <input
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha fin</label>
                <input
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Motivo (opcional)</label>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>
          )}
        </div>

        <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rounded-b-lg">
          <button
            onClick={handleConfirm}
            className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
              isSanctioned ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isSanctioned ? "Revocar sanción" : "Aplicar sanción"}
          </button>
          <button
            onClick={onCancel}
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
