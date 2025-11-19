
import React from 'react';
import { OWL_LOADER_URL } from '../../constants';

export const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <img src={OWL_LOADER_URL} alt="Cargando..." className="w-24 h-24" />
      <p className="mt-4 text-ucu-primary font-semibold animate-pulse">Cargando...</p>
    </div>
  );
};
