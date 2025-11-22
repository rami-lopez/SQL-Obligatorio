import React, { useContext, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Reservation, ReservationStatus } from '../../types';
import { AppContext } from '../../App';
import { getAllReservations, getSalasMasReservadas, getTurnosMasDemandados, getPorcentajeReservasUtilizadas, getSalasMenosUtilizadas, getParticipantesMasActivos, getReservasPorDiaSemana, getReservasPorCarreraFacultad, getReservasAsistenciasPorRol, getSancionesPorRol, getPromedioParticipantesPorSala } from '@/services/api';

interface AdminDashboardProps {
    reservations: Reservation[];
}

const StatCard: React.FC<{ title: string; value: string | number; description: string; }> = ({ title, value, description }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <p className="text-3xl font-bold text-ucu-primary mt-1">{value}</p>
        <p className="text-xs text-gray-400 mt-1">{description}</p>
    </div>
)

export const AdminDashboard: React.FC<AdminDashboardProps> = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [porcentajeUtilizadas, setPorcentajeUtilizadas] = useState<number | null>(null);
    const [salasMas, setSalasMas] = useState<any[]>([]);
    const [salasMenos, setSalasMenos] = useState<any[]>([]);
    const [participantesActivos, setParticipantesActivos] = useState<any[]>([]);
    const [turnosDemandados, setTurnosDemandados] = useState<any[]>([]);
    const [reservasPorDia, setReservasPorDia] = useState<any[]>([]);
    const [reservasPorCarrera, setReservasPorCarrera] = useState<any[]>([]);
    const [reservasAsistenciasPorRol, setReservasAsistenciasPorRol] = useState<any[]>([]);
    const [sancionesPorRol, setSancionesPorRol] = useState<any | null>(null);
    const [promedioParticipantesPorSala, setPromedioParticipantesPorSala] = useState<any[]>([]);
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
        // fetch reportes
        const fetchReports = async () => {
            try {
                const [salas, menos, participantes, turnos, porcentaje, dias, porCarrera, asistencias, sanciones, promedios] = await Promise.all([
                    getSalasMasReservadas(5),
                    getSalasMenosUtilizadas(5),
                    getParticipantesMasActivos(5),
                    getTurnosMasDemandados(),
                    getPorcentajeReservasUtilizadas(),
                    getReservasPorDiaSemana(),
                    getReservasPorCarreraFacultad(),
                    getReservasAsistenciasPorRol(),
                    getSancionesPorRol(),
                    getPromedioParticipantesPorSala(),
                ]);

                setSalasMas(salas || []);
                setSalasMenos(menos || []);
                setParticipantesActivos(participantes || []);
                setTurnosDemandados(turnos || []);
                // porcentaje may come as [{porcentaje: value}] or {porcentaje: value}
                const pct = Array.isArray(porcentaje) ? (porcentaje[0] && (porcentaje[0].porcentaje ?? porcentaje[0].porcentaje)) : (porcentaje && (porcentaje.porcentaje ?? porcentaje));
                setPorcentajeUtilizadas(typeof pct === 'number' ? pct : (typeof pct === 'string' ? parseFloat(pct) : null));
                setReservasPorDia(dias || []);
                setReservasPorCarrera(porCarrera || []);
                setReservasAsistenciasPorRol(asistencias || []);
                setSancionesPorRol(sanciones || null);
                setPromedioParticipantesPorSala(promedios || []);
            } catch (e) {
                console.warn('Error fetching reportes', e);
            }
        };
        fetchReports();
    }, []);

    const totalReservations = reservations.length;
    const activeReservations = reservations.filter(r => r.estado === ReservationStatus.ACTIVA && r.fecha === new Date().toISOString().split('T')[0]).length;
    const noShowRate = totalReservations > 0 ? ((reservations.filter(r => r.estado === ReservationStatus.NO_ASISTENCIA).length / totalReservations) * 100).toFixed(1) : "0.0";

    const roomUsageData = rooms.map(room => ({
        name: room.nombre,
        reservas: reservations.filter(r => r.idSala === room.idSala).length
    })).sort((a, b) => b.reservas - a.reservas).slice(0, 5);

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
                <StatCard title="Porcentaje Reservas Utilizadas" value={porcentajeUtilizadas != null ? `${Number(porcentajeUtilizadas).toFixed(1)}%` : 'N/A'} description="Reservas efectivas vs canceladas/no-asistencia." />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500">Salas más Reservadas (Top 5)</h3>
                    <ul className="mt-3 text-sm">
                        {salasMas.map((s, i) => (
                            <li key={i} className="py-1">{s.nombre ?? s.name} — {s.cantidad ?? s.reservas ?? s.reservas}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500">Salas menos Utilizadas (Top 5)</h3>
                    <ul className="mt-3 text-sm">
                        {salasMenos.map((s, i) => (
                            <li key={i} className="py-1">{s.nombre ?? s.name} — {s.reservas ?? s.cantidad ?? 0}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500">Participantes más Activos</h3>
                    <ul className="mt-3 text-sm">
                        {participantesActivos.map((p, i) => (
                            <li key={i} className="py-1">{p.nombre ?? p.name} — {p.reservas ?? p.cantidad ?? 0}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="text-sm font-medium text-gray-500">Sanciones por Rol</h3>
                    <div className="mt-3 text-sm">
                        <div>Docentes: {sancionesPorRol?.docentes ?? sancionesPorRol?.docentes ?? 0}</div>
                        <div>Alumnos: {sancionesPorRol?.alumnos ?? sancionesPorRol?.alumnos ?? 0}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-sm border">
                    <h3 className="font-bold text-ucu-primary mb-4">Salas Más Utilizadas</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={roomUsageData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip wrapperClassName="!bg-white !border !border-gray-200 !rounded-md !shadow-lg" />
                            <Legend wrapperStyle={{ fontSize: "14px" }} />
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
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};