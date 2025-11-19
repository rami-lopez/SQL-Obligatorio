import React, { useState, useContext } from "react";
import { MapaEdificios } from "./MapaEdificios";
import { RoomList } from "./RoomList";
import { MyReservations } from "./MyReservations";
import { Building } from "../../types";
import { Loader } from "../common/Loader";
import { AppContext } from "../../App";
import { getBuildingId } from "../../utils";

type View = "map" | "rooms" | "my-reservations";

export const UserView: React.FC = () => {
  const appContext = useContext(AppContext);
  const [currentView, setCurrentView] = useState<View>("map");
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectBuilding = (buildingId: number) => {
    setIsLoading(true);
    setTimeout(() => {
      const building = appContext?.buildings.find(
        (b) => getBuildingId(b) === buildingId
      );
      console.log("Selected building:", building);
      console.log(buildingId);

      console.log(appContext?.buildings);

      if (building) {
        setSelectedBuilding(building);
        setCurrentView("rooms");
      }
      setIsLoading(false);
    }, 500);
  };

  const navigateTo = (view: View) => {
    setCurrentView(view);
    if (view === "map") {
      setSelectedBuilding(null);
    }
  };
  const manualPositions = {
    1: { top: "45.5%", left: "21%", width: "10%", height: "9%" },
    2: { top: "22%", left: "26%", width: "6.5%", height: "7%" },
    4: { top: "38%", left: "16%", width: "6.5%", height: "7%" },
    7: { top: "35%", left: "27%", width: "5.8%", height: "7.5%" },
    9: { top: "55%", left: "24.5%", width: "5%", height: "7.5%" },
    10: { top: "14%", left: "21.2%", width: "5%", height: "6%" },
    11: { top: "55%", left: "30.7%", width: "5%", height: "6%" },
    8: { top: "5%", left: "30.7%", width: "5%", height: "6%" },
  };
  const renderContent = () => {
    if (isLoading) {
      return <Loader />;
    }

    switch (currentView) {
      case "map":
        return (
          <MapaEdificios
            onSelectBuilding={handleSelectBuilding}
            mapPositions={manualPositions}
          />
        );
      case "rooms":
        return selectedBuilding ? (
          <RoomList building={selectedBuilding} />
        ) : (
          <div />
        );
      case "my-reservations":
        return <MyReservations />;
      default:
        return (
          <MapaEdificios
            onSelectBuilding={handleSelectBuilding}
            mapPositions={manualPositions}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
        <button
          onClick={() => navigateTo("map")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            currentView === "map" || currentView === "rooms"
              ? "bg-ucu-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Reservar Salas
        </button>
        <button
          onClick={() => navigateTo("my-reservations")}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            currentView === "my-reservations"
              ? "bg-ucu-primary text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Mis Reservas
        </button>
      </div>
      {(currentView === "map" ||
        (currentView === "rooms" && selectedBuilding)) && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <span
            onClick={() => navigateTo("map")}
            className="cursor-pointer hover:text-ucu-primary"
          >
            Selección de edificio
          </span>
          {selectedBuilding && <span className="text-gray-400">/</span>}
          {selectedBuilding && (
            <span className="font-semibold text-ucu-primary">
              {selectedBuilding.nombre ?? selectedBuilding.name}
            </span>
          )}
        </div>
      )}
      {renderContent()}
    </div>
  );
};
