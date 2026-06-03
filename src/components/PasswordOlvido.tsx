import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { showNotification } from './Notification';

const PasswordOlvido: React.FC = () => {
    const [email, setEmail] = useState('');
    const [enviado, setEnviado] = useState(false);
    const [cargando, setCargando] = useState(false);

    const manejarEnvio = async (e: React.FormEvent) => {
        e.preventDefault();
        setCargando(true);

        try {
            const formData = new FormData();
            formData.append('email', email);

            const response = await fetch('https://rafa.cicloflorenciopintado.es/api.php?action=solicitarReseteo', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                setEnviado(true);
                showNotification('Se ha enviado un correo con instrucciones', 'success');
            } else {
                showNotification(result.message || 'Error al procesar la solicitud', 'error');
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
                    <h2 className="text-3xl font-bold text-[#D3CCBC] font-serif">Recuperar Contraseña</h2>
                    <p className="text-[#D3CCBC]/70 text-sm mt-2">Introduce tu email para enviarte un enlace de recuperación</p>
                </div>

                <div className="p-8">
                    {!enviado ? (
                        <form onSubmit={manejarEnvio} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-widest">Correo Electrónico</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="tu@email.com"
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#30312E] outline-none transition-all bg-[#D4CDBC]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full bg-[#30312E] text-[#D3CCBC] py-4 rounded-xl font-bold hover:bg-[#4a4b46] transition-all transform hover:scale-[1.02] shadow-lg disabled:opacity-50"
                            >
                                {cargando ? 'Enviando...' : 'Enviar Enlace'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-6">
                            <div className="bg-green-100 text-green-800 p-4 rounded-xl mb-6">
                                ¡Correo enviado con éxito! Revisa tu bandeja de entrada o spam.
                            </div>
                        </div>
                    )}

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

export default PasswordOlvido;

