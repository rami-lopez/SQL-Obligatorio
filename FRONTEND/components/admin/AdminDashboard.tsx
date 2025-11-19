import React, { useContext, useEffect,useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Reservation, ReservationStatus } from '../../types';
import { AppContext } from '../../App';
import { getAllReservations } from '@/services/api';

interface AdminDashboardProps {
    reservations: Reservation[];
}

const StatCard: React.FC<{title: string; value: string | number; description: string;}> = ({title, value, description}) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-ucu-primary mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
)

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const appContext = useContext(AppContext);
    const rooms = appContext?.rooms || [];
    useEffect(() => {
        const fetchReservations = async () => {
            try {
                const data = await getAllReservations();
                setReservations(data);
            } catch (error) {
                console.error("Error fetching reservations:", error);
            }
        };
        fetchReservations();
    }, []);

    const totalReservations = reservations.length;
    const activeReservations = reservations.filter(r => r.estado === ReservationStatus.ACTIVA).length;
    const noShowRate = totalReservations > 0 ? ((reservations.filter(r => r.estado === ReservationStatus.NO_ASISTENCIA).length / totalReservations) * 100).toFixed(1) : "0.0";

    const roomUsageData = rooms.map(room => ({
        name: room.nombre,
        reservas: reservations.filter(r => r.idSala === room.idSala).length
    })).sort((a,b) => b.reservas - a.reservas).slice(0, 5);

    const statusData = [
        { name: 'Activas', value: activeReservations },
        { name: 'Finalizadas', value: reservations.filter(r => r.estado === ReservationStatus.FINALIZADA).length },
        { name: 'Sin Asistencia', value: reservations.filter(r => r.estado === ReservationStatus.NO_ASISTENCIA).length },
        { name: 'Canceladas', value: reservations.filter(r => r.estado === ReservationStatus.CANCELADA).length },
    ];
    const COLORS = ['#3b82f6', '#16a34a', '#ef4444', '#6b7280'];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Reservas Totales (Histórico)" value={totalReservations} description="Total de reservas en el sistema." />
                <StatCard title="Reservas Activas Hoy" value={activeReservations} description="Próximas reservas para hoy." />
                <StatCard title="Tasa de No Asistencia" value={`${noShowRate}%`} description="Porcentaje de inasistencias." />
                <StatCard title="Salas más Usada" value={roomUsageData[0]?.name || 'N/A'} description="Basado en el total de reservas." />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-ucu-primary mb-4">Salas Más Utilizadas</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={roomUsageData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false}/>
                            <Tooltip wrapperClassName="!bg-white !border !border-gray-200 !rounded-md !shadow-lg" />
                            <Legend wrapperStyle={{fontSize: "14px"}} />
                            <Bar dataKey="reservas" fill="#1e3264" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-ucu-primary mb-4">Distribución de Estados de Reserva</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={statusData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={(entry) => `${entry.name} (${entry.value})`}>
                                {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend/>
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};