import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [nombre, setNombre] = useState('');
    const [password, setPassword] = useState('');
    const navegar = useNavigate();

    /**
     * Maneja el inicio de sesión
     */
    const manejarLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        /* 
           CONEXIÓN CON BASE DE DATOS:
           Aquí harías la petición a login.php enviando nombre y password.
           Ej: const respuesta = await fetch('backend/login.php', { method: 'POST', body: ... });
        */

        console.log('Iniciando sesión con:', { nombre, password });

        // SIMULACIÓN DE SESIÓN: Guardamos el usuario en localStorage
        localStorage.setItem('usuarioSesion', nombre);
        
        alert('Sesión iniciada correctamente (Simulación)');
        navegar('/'); // Redirigir al inicio
        window.location.reload(); // Recargar para actualizar el Nav (en una app real usaríamos Context)
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-[#D3CCBC]/30">
            <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-fadeIn">
                <div className="bg-[#30312E] p-8 text-center">
                    <h2 className="text-3xl font-bold text-[#D3CCBC] font-serif">Bienvenido</h2>
                    <p className="text-[#D3CCBC]/70 text-sm mt-2">Accede a tu cuenta</p>
                </div>

                <form onSubmit={manejarLogin} className="p-8 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-widest">Nombre de Usuario</label>
                        <input 
                            type="text" 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#30312E] outline-none transition-all"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-widest">Contraseña</label>
                        <input 
                            type="password" 
                            required
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#30312E] outline-none transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-[#30312E] text-[#D3CCBC] py-4 rounded-xl font-bold hover:bg-[#4a4b46] transition-all transform hover:scale-[1.02] shadow-lg mt-2"
                    >
                        Entrar
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
