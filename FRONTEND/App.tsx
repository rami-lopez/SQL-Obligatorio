import React, { useState, useMemo, useEffect } from 'react';
import { UcuNavbar } from './components/layout/UcuNavbar';
import { UserView } from './components/user/UserView';
import { AdminView } from './components/admin/AdminView';
import { User, Role, Reservation, Room, Building, Program, Faculty, TimeSlot } from './types';
import { getBuildings, getFaculties, getPrograms, getRooms, getTimeSlots, getUsers, getAuthMe } from './services/api';
import { Loader } from './components/common/Loader';
import { BUILDING_MAP_POSITIONS } from './constants';
import Login from './components/common/Login';


interface AppContextType {
  user: User;
  setUser: (user: User) => void;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  buildings: Building[];
  setBuildings: React.Dispatch<React.SetStateAction<Building[]>>;
  programs: Program[];
  setPrograms: React.Dispatch<React.SetStateAction<Program[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  faculties: Faculty[];
  setFaculties: React.Dispatch<React.SetStateAction<Faculty[]>>;
  timeSlots: TimeSlot[];
  setTimeSlots: React.Dispatch<React.SetStateAction<TimeSlot[]>>;
}

export const AppContext = React.createContext<AppContextType | null>(null);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch application data (buildings, rooms, users, programs, faculties, timeSlots)
  const fetchAllData = async (authUserFromMe?: User | null) => {
    try {
      setIsLoading(true);
      const [
        usersData,
        roomsData,
        buildingsDataFromApi,
        programsData,
        facultiesData,
        timeSlotsData
      ] = await Promise.all([
        getUsers(),
        getRooms(),
        getBuildings(),
        getPrograms(),
        getFaculties(),
        getTimeSlots()
      ]);

      const hydratedBuildings = buildingsDataFromApi.map(building => ({
        ...building,
        mapPosition: BUILDING_MAP_POSITIONS[building.id] || { top: '0', left: '0', width: '0', height: '0' }
      }));

      setUsers(usersData);
      setRooms(roomsData);
      setBuildings(hydratedBuildings);
      setPrograms(programsData);
      setFaculties(facultiesData);
      setTimeSlots(timeSlotsData);

      // Prefer authenticated user info from /auth/me when available
      if (authUserFromMe) {
        setCurrentUser(authUserFromMe);
      } else if (!currentUser && usersData.length > 0) {
        // fallback: use the first user in the list (useful for local dev without auth)
        setCurrentUser(usersData[0]);
      }
    } catch (err: any) {
      setError(`Failed to load data: ${err.message}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Note: do not auto-check localStorage for auth token on mount.
  // The app requires the user to login on every page reload, so
  // data loading is triggered only after a successful login.

  const contextValue = useMemo(() => {
    if (!currentUser) {
      return null;
    }
    return {
      user: currentUser,
      setUser: setCurrentUser,
      reservations: reservations,
      setReservations: setReservations,
      rooms: rooms,
      setRooms: setRooms,
      buildings: buildings,
      setBuildings: setBuildings,
      programs: programs,
      setPrograms: setPrograms,
      users: users,
      setUsers: setUsers,
      faculties: faculties,
      setFaculties: setFaculties,
      timeSlots: timeSlots,
      setTimeSlots: setTimeSlots,
    };
  }, [currentUser, reservations, rooms, buildings, programs, users, faculties, timeSlots]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 bg-red-100 p-4 rounded-lg shadow-md border border-red-200">{error}</div>
      </div>
    );
  }

  if (!contextValue || !currentUser) {
    return (
      <Login onLogin={(user: User) => { fetchAllData(user); }} />
    );
  }

  return (
    <AppContext.Provider value={contextValue}>
      <div className="min-h-screen bg-ucu-light-gray font-sans">
        <UcuNavbar />
        <main className="p-4 md:p-8">
          {currentUser.rol === Role.ADMIN ? <AdminView /> : <UserView />}
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;