import React, { useState } from 'react';
import { login, getAuthMe } from '../../services/api';
import { User } from '../../types';

interface Props {
    onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login(email, password);
            const user = await getAuthMe();
            onLogin(user);
        } catch (err: any) {
            const msg = err?.message || 'Error de login';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-ucu-light-gray">
            <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md border border-gray-200">
                <h2 className="text-2xl font-semibold mb-4 text-center">Iniciar sesión</h2>
                {error && <div className="text-red-600 bg-red-100 p-2 rounded mb-4">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input
                            type="email"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-ucu-blue"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Contraseña</label>
                        <input
                            type="password"
                            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-ucu-blue"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-ucu-blue text-white py-2 rounded hover:opacity-95 disabled:opacity-60"
                        disabled={loading}
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
