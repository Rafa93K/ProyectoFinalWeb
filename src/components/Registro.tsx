import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Registro: React.FC = () => {
    // Estado para el formulario de registro
    const [datos, setDatos] = useState({
        nombre: '',
        telefono: '',
        password: ''
    });

    /**
     * Maneja el envío del formulario
     */
    const manejarRegistro = async (e: React.FormEvent) => {
        e.preventDefault();
        /* 
           CONEXIÓN CON BASE DE DATOS:
           Aquí harías el POST a tu servidor PHP (ej: registroUsuarios.php)
           para insertar los datos en la tabla de usuarios.
        */
        console.log('Registrando usuario:', datos);
        alert('Registro completado (Simulación)');
    };

    return (
        <div className="flex-1 flex items-center justify-center p-6 bg-[#D3CCBC]/30">
            <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-fadeIn">
                {/* Cabecera del Formulario */}
                <div className="bg-[#30312E] p-8 text-center">
                    <h2 className="text-3xl font-bold text-[#D3CCBC] mb-2 font-serif">Crear Cuenta</h2>
                    <p className="text-[#D3CCBC]/70 text-sm">Únete a la familia de El Fogón</p>
                </div>

                {/* Cuerpo del Formulario */}
                <form onSubmit={manejarRegistro} className="p-8 space-y-6">
                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-widest">Nombre Completo</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Ej: Juan Pérez"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#30312E] outline-none transition-all"
                            value={datos.nombre}
                            onChange={(e) => setDatos({...datos, nombre: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-widest">Teléfono de Contacto</label>
                        <input 
                            type="tel" 
                            required
                            placeholder="600 000 000"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#30312E] outline-none transition-all"
                            value={datos.telefono}
                            onChange={(e) => setDatos({...datos, telefono: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-stone-500 mb-2 uppercase tracking-widest">Contraseña</label>
                        <input 
                            type="password" 
                            required
                            placeholder="••••••••"
                            className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:ring-2 focus:ring-[#30312E] outline-none transition-all"
                            value={datos.password}
                            onChange={(e) => setDatos({...datos, password: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-[#30312E] text-[#D3CCBC] py-4 rounded-xl font-bold text-lg hover:bg-[#4a4b46] transition-all transform hover:scale-[1.02] shadow-lg mt-4"
                    >
                        Completar Registro
                    </button>

                    <p className="text-center text-stone-500 text-sm mt-6">
                        ¿Ya tienes cuenta?{' '}
                        <Link to="/login" className="text-[#30312E] font-bold hover:underline">
                            Inicia sesión aquí
                        </Link>
                    </p>
                </form>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.8s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Registro;
