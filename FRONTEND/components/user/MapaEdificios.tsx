import React, { useContext } from 'react';
import  { BUILDING_MAP_POSITIONS}  from '../../constants';
import MAP_IMAGE_URL from '../../assets/mapa.png';
import UCU_LOGO_URL from '../../assets/ucu_logo.png';
import { Building } from '../../types';
import { AppContext } from '../../App';
import { getBuildingId } from '../../utils';

interface MapaEdificiosProps {
  onSelectBuilding: (buildingId: number) => void;
  
  mapPositions?: { [key: number]: { top: string; left: string; width: string; height: string } };
}

 
export const MapaEdificios: React.FC<MapaEdificiosProps> = ({ onSelectBuilding, mapPositions }) => {
  const appContext = useContext(AppContext);
  const buildings = appContext?.buildings || [];
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
       <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold text-cyan-600">¿DÓNDE QUEDA MI SALÓN?</h1>
            <p className="text-ucu-dark-gray mt-2">Haz click sobre el edificio en el mapa para reservar tu salón.</p>
        </div>
        <img src={UCU_LOGO_URL} alt="UCU Logo" className="h-10 mt-4 md:mt-0"/>
       </div>
      
      {/* Desktop Map */}
      <div className="hidden md:block relative w-full max-w-5xl mx-auto">
        <img src={MAP_IMAGE_URL} alt="Mapa de Edificios UCU" className="w-full h-auto rounded-lg" />
        {buildings.map((building) => {
          const bid = getBuildingId(building) ?? building.id;
          // Determine map position precedence:
          // 1. explicit prop `mapPositions[bid]`
          // 2. building.mapPosition (hydrated by App)
          // 3. BUILDING_MAP_POSITIONS (constants)
          const explicit = mapPositions && bid != null ? mapPositions[bid] : undefined;
          const mp = explicit ?? (building as any).mapPosition ?? (BUILDING_MAP_POSITIONS as any)[bid];
          const stylePos = mp ? { top: mp.top, left: mp.left, width: mp.width, height: mp.height } : { top: '10%', left: '10%', width: '10%', height: '10%'};
          return (
            <div
              key={String(bid ?? 'unknown')}
              className="absolute group cursor-pointer"
              style={{  ...stylePos}}
              onClick={() => bid != null && onSelectBuilding(bid as number)}
            >
              <div className="absolute inset-0 bg-ucu-secondary/30 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-2 border-dashed border-ucu-primary"></div>
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-ucu-primary text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                {building.nombre}
                <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-ucu-primary"></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile List */}
      <div className="block md:hidden space-y-3">
        <h2 className="text-xl font-bold text-ucu-primary mb-4">Seleccioná un edificio</h2>
        {buildings.map((building) => (
          <button
            key={String(getBuildingId(building) ?? building.id ?? Math.random())}
            onClick={() => {
              const bid = getBuildingId(building);
              if (bid != null) onSelectBuilding(bid);
            }}
            className="w-full text-left p-4 bg-ucu-light-gray rounded-lg hover:bg-ucu-primary hover:text-white transition-all duration-200 shadow-sm"
          >
            <p className="font-semibold">{building.nombre}</p>
            <p className="text-sm opacity-70">{building.direccion}</p>
          </button>
        ))}
      </div>
    </div>
  );
};