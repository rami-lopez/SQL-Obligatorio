import React, { useState, useEffect } from 'react';
import { AdminDashboard } from './AdminDashboard';
import { AdminReservasTable } from './AdminReservasTable';
import { AppContext } from '../../App';
import { BuildingManagement } from './BuildingManagement';
import { RoomManagement } from './RoomManagement';
import { UserManagement } from './UserManagement';
import { ProgramManagement } from './ProgramManagement';
import { getAllReservations } from '../../services/api';
import { Loader } from '../common/Loader';


type AdminViewTab = 'dashboard' | 'reservations' | 'rooms' | 'buildings' | 'programs' | 'users';

export const AdminView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminViewTab>('dashboard');
    const appContext = React.useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!appContext) return;
        const fetchAdminData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch all reservations once for the entire admin panel (admin endpoint)
                const reservationsData = await getAllReservations();
                appContext.setReservations(reservationsData);
            } catch (err: any) {
                setError(`Failed to load admin data: ${err.message}`);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAdminData();
    }, [appContext?.setReservations]);


    if (!appContext) return null;
    const { reservations, setReservations, rooms, setRooms, buildings, setBuildings, programs, setPrograms, users, setUsers, faculties } = appContext;


    const renderContent = () => {
        if (isLoading) {
            return <div className="bg-white p-6 rounded-lg shadow-sm flex justify-center"><Loader /></div>;
        }
        if (error) {
            return <div className="bg-white p-6 rounded-lg shadow-sm text-center text-red-500">Error: {error}</div>;
        }

        switch (activeTab) {
            case 'dashboard':
                return <AdminDashboard reservations={reservations} />;
            case 'reservations':
                return <AdminReservasTable reservations={reservations} setReservations={setReservations} />;
            case 'rooms':
                return <RoomManagement rooms={rooms} setRooms={setRooms} />;
            case 'buildings':
                return <BuildingManagement buildings={buildings} setBuildings={setBuildings}/>;
            case 'programs':
                return <ProgramManagement programs={programs} setPrograms={setPrograms} faculties={faculties} />;
            case 'users':
                return <UserManagement currentUser={appContext?.user} users={users} setUsers={setUsers} programs={programs} reservations={reservations} />;
            default:
                return <AdminDashboard reservations={reservations}/>;
        }
    }

    const TabButton: React.FC<{tab: AdminViewTab, label: string}> = ({ tab, label }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab 
                ? 'bg-ucu-primary text-white shadow' 
                : 'text-gray-600 hover:bg-ucu-light-gray'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="space-y-6">
            <div className="bg-white p-3 rounded-lg shadow-sm flex flex-wrap items-center gap-2">
                <TabButton tab="dashboard" label="Dashboard" />
                <TabButton tab="reservations" label="Gestión de Reservas" />
                <TabButton tab="rooms" label="Gestión de Salas" />
                <TabButton tab="buildings" label="Gestión de Edificios" />
                <TabButton tab="programs" label="Gestión de Programas" />
                <TabButton tab="users" label="Gestión de Usuarios" />
            </div>
            <div>
                {renderContent()}
            </div>
        </div>
    );
};