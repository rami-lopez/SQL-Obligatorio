import React, { useState } from 'react';
import { login, getAuthMe, setAuthToken } from '../../services/api';
import { User } from '../../types';
import UcuLogo from '../../assets/logo_ucu_40_color.svg';

interface Props {
    onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const doLogin = async () => {
        setError(null);
        setLoading(true);
        try {
            const token = await login(email, password);
            
            try { setAuthToken(token); } catch (e) { /* ignore */ }
            const user = await getAuthMe();
            onLogin(user);
        } catch (err: any) {
            const msg = err?.message || 'Error de login';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await doLogin();
    };

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!loading) await doLogin();
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="flex bg-ucu-blue text-white rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full mx-4">

                {/* sección de bienvenida */}
                <div className="flex-1 p-12 hidden md:block bg-blue-100 text-gray-800">
                    <img src={UcuLogo} alt="Logo UCU" className="mb-6 w-auto h-40" />
                    <h1 className="text-4xl font-bold mb-4">¡Bienvenido!</h1>
                    <h2 className="text-xl font-light mb-6">Plataforma de Reservas UCU</h2>
                    <p className="text-sm opacity-90">
                        Inicia sesión con tus credenciales para acceder a la gestión de reservas y recursos.
                    </p>
                </div>

                <div className="w-full md:w-1/2 bg-white p-8 md:p-12 rounded-xl md:rounded-l-none text-gray-800">
                    <h2 className="text-3xl font-bold mb-8 text-center text-ucu-blue">Iniciar sesión</h2>
                    
                    {error && <div className="text-red-600 bg-red-100 p-3 rounded mb-4 border border-red-300">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="tu.email@ucu.edu.uy"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucu-blue transition duration-150"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                required
                            />
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">Contraseña</label>
                            <input
                                type="password"
                                placeholder="********"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-ucu-blue transition duration-150"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                                required
                            />
                        </div>
                        
                        <div className="flex gap-4">
                            <button
                                type="button"
                                className="w-24 bg-gray-200 text-gray-800 font-semibold py-3 rounded-lg hover:bg-gray-300 transition duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                                onClick={() => { if (!loading) doLogin(); }}
                                disabled={loading}
                            >
                                Enter
                            </button>
                        </div>
                    </form>
                </div>
                
            </div>
            
        </div>
    );
};

export default Login;