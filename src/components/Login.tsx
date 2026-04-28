import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from './Notification';

const Login: React.FC = () => {
    const [telefono, setTelefono] = useState('');
    const [password, setPassword] = useState('');
    const navegar = useNavigate();

    /**
     * Maneja el inicio de sesión
     */
    const manejarLogin = async (e: React.SubmitEvent) => {
        e.preventDefault();

        try {
            const formData = new FormData();
            formData.append('telefono', telefono);
            formData.append('contrasena', password);

            const response = await fetch('https://rafa.cicloflorenciopintado.es/loginUsuario.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                // Guardamos el objeto usuario limpio en localStorage
                const usuarioData = {
                    id_usuario: result.id_usuario,
                    nombre: typeof result.nombre === 'object' ? result.nombre.nombre : result.nombre,
                    telefono: telefono
                };
                localStorage.setItem('usuarioSesion', JSON.stringify(usuarioData));

                navegar('/home'); // Redirigir al inicio
                window.location.reload(); // Recargar para actualizar el Nav
            } else {
                showNotification(result.message || 'Error al iniciar sesión', 'error');
            }
        } catch (error) {
            console.error('Error en el login:', error);
            showNotification('Hubo un error al conectar con el servidor', 'error');
        }
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-[#D3CCBC]/30">
            <div className="w-full max-w-sm bg-[#E2DBC9] rounded-3xl shadow-2xl overflow-hidden border border-white/20 animate-fadeIn">
                <div className="bg-[#30312E] p-8 text-center">
                    <h2 className="text-3xl font-bold text-[#D3CCBC] font-serif">Bienvenido</h2>
                    <p className="text-[#D3CCBC]/70 text-sm mt-2">Accede a tu cuenta</p>
                </div>

                <form onSubmit={manejarLogin} className="p-8 space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-widest">Nº Teléfono</label>
                        <input
                            type="text"
                            required
                            minLength={9}
                            maxLength={9}
                            placeholder="600000000"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#30312E] outline-none transition-all bg-[#D4CDBC]"
                            value={telefono}
                            onChange={(e) => setTelefono(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-widest">Contraseña</label>
                        <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#30312E] outline-none transition-all bg-[#D4CDBC]"
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
