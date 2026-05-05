import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { showNotification } from './Notification';

const PasswordReset: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [cargando, setCargando] = useState(false);
    const navegar = useNavigate();

    const manejarReset = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showNotification('Las contraseñas no coinciden', 'error');
            return;
        }

        setCargando(true);

        try {
            const formData = new FormData();
            formData.append('token', token || '');
            formData.append('password', password);

            const response = await fetch('https://rafa.cicloflorenciopintado.es/resetearPassword.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                showNotification('Contraseña actualizada correctamente', 'success');
                navegar('/login');
            } else {
                showNotification(result.message || 'Error al actualizar la contraseña', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al conectar con el servidor', 'error');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-0 md:p-6 bg-[#D3CCBC]/30 min-h-[calc(100vh-80px)]">
            <div className="w-full md:max-w-md bg-[#E2DBC9] rounded-none md:rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-fadeIn">
                <div className="bg-[#30312E] p-8 text-center">
                    <h2 className="text-3xl font-bold text-[#D3CCBC] font-serif">Nueva Contraseña</h2>
                    <p className="text-[#D3CCBC]/70 text-sm mt-2">Introduce tu nueva contraseña segura</p>
                </div>

                <div className="p-8">
                    <form onSubmit={manejarReset} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-widest">Nueva Contraseña</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#30312E] outline-none transition-all bg-[#D4CDBC]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-widest">Confirmar Contraseña</label>
                            <input
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#30312E] outline-none transition-all bg-[#D4CDBC]"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={cargando}
                            className="w-full bg-[#30312E] text-[#D3CCBC] py-4 rounded-xl font-bold hover:bg-[#4a4b46] transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
                        >
                            {cargando ? 'Actualizando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link to="/login" className="text-[#30312E] font-bold hover:underline text-sm">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PasswordReset;
