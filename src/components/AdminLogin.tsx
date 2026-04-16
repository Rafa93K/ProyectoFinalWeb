import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin: React.FC = () => {
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);
    const navegar = useNavigate();

    useEffect(() => {
        // Si ya hay sesión de admin, redirigir directamente
        const adminSesion = localStorage.getItem('adminSesion');
        if (adminSesion) {
            navegar('/admin');
        }
    }, [navegar]);

    const manejarLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setCargando(true);

        try {
            /* 
               CONEXIÓN CON EL SERVIDOR:
               Enviamos los datos al backend para verificar en la tabla Administrador
            */
            const formData = new FormData();
            formData.append('usuario', nombre);
            formData.append('contrasena', password);

            // Ajustar esta URL a la ruta real de tu backend
            const respuesta = await fetch('https://rafa.cicloflorenciopintado.es/loginAdmin.php', {
                method: 'POST',
                body: formData
            });

            const resultado = await respuesta.json();

            if (resultado.success) {
                // Guardamos en la sesión el nombre y contraseña (o un token si lo prefieres)
                // Usamos localStorage para que nos recuerde como pidió el usuario
                localStorage.setItem('adminSesion', JSON.stringify({
                    nombre: nombre,
                    auth: true,
                    timestamp: new Date().getTime()
                }));
                
                navegar('/admin');
                window.location.reload(); // Recargar para asegurar que el estado se actualiza
            } else {
                setError(resultado.message || 'Credenciales incorrectas');
            }
        } catch (err) {
            console.error('Error en el login:', err);
            setError('Error de conexión con el servidor');
            
            // MOCK PARA PRUEBAS (Si el backend no está listo, permitir entrar con admin/admin)
            if (nombre === 'admin' && password === 'admin') {
                console.warn('Backend no encontrado, usando Mock temporal');
                localStorage.setItem('adminSesion', JSON.stringify({ nombre: 'Administrador', auth: true }));
                navegar('/admin');
                window.location.reload();
            }
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-stone-100 relative overflow-hidden">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#30312E]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#D3CCBC]/20 rounded-full blur-3xl" />

            <div className="w-full max-w-md bg-[#E2DBC9] backdrop-blur-md rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-white/20 animate-fadeIn relative z-10">
                <div className="bg-[#30312E] p-10 text-center relative overflow-hidden">
                    {/* Brillo decorativo */}
                    <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-white/10 to-transparent opacity-50" />
                    
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-[#D3CCBC]/10 rounded-2xl mb-4 border border-[#D3CCBC]/20">
                        <span className="text-3xl">🔐</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#D3CCBC] font-serif tracking-tight">Acceso Admin</h2>
                    <p className="text-[#D3CCBC]/60 text-sm mt-2 uppercase tracking-[0.2em] font-medium">Panel de Gestión</p>
                </div>

                <form onSubmit={manejarLogin} className="p-10 space-y-6">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-xl animate-shake">
                            <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                                <span>⚠️</span> {error}
                            </p>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Usuario Maestro</label>
                        <div className="relative group">
                            <input 
                                type="text" 
                                required
                                placeholder="Introduce tu nombre"
                                className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-[#30312E] focus:border-transparent outline-none transition-all bg-[#D4CDBC]"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest ml-1">Contraseña</label>
                        <div className="relative group">
                            <input 
                                type="password" 
                                required
                                placeholder="••••••••"
                                className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:ring-2 focus:ring-[#30312E] focus:border-transparent outline-none transition-all bg-[#D4CDBC]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={cargando}
                        className={`w-full bg-[#30312E] text-[#D3CCBC] py-5 rounded-2xl font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl mt-4 flex items-center justify-center gap-3 ${cargando ? 'opacity-70 cursor-wait' : 'hover:bg-[#4a4b46]'}`}
                    >
                        {cargando ? (
                            <>
                                <div className="w-5 h-5 border-2 border-[#D3CCBC]/30 border-t-[#D3CCBC] rounded-full animate-spin" />
                                <span>Verificando...</span>
                            </>
                        ) : (
                            <>
                                <span>Entrar al Panel</span>
                                <span className="text-xl">→</span>
                            </>
                        )}
                    </button>

                    <div className="text-center pt-4">
                        <p className="text-stone-400 text-xs italic">
                            Este acceso está restringido a personal autorizado.
                        </p>
                    </div>
                </form>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-fadeIn { animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-shake { animation: shake 0.4s ease-in-out; }
            `}</style>
        </div>
    );
};

export default AdminLogin;
