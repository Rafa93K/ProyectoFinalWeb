import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const Reservar: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nombre_cliente: '',
        telefono: '',
        fecha: '',
        hora: '',
        personas: 2,
        mensaje: ''
    });
    const [enviando, setEnviando] = useState(false);
    const [completado, setCompletado] = useState(false);

    useEffect(() => {
        // Cargar datos de usuario si existe sesión
        const sesionRaw = localStorage.getItem('usuarioSesion');
        if (sesionRaw) {
            try {
                const user = JSON.parse(sesionRaw);
                setFormData(prev => ({
                    ...prev,
                    nombre_cliente: user.nombre || '',
                    telefono: user.telefono || ''
                }));
            } catch (e) {
                console.error("Error al leer la sesión", e);
            }
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        e.preventDefault();
        setEnviando(true);

        try {
            const data = new FormData();
            Object.entries(formData).forEach(([key, value]) => {
                data.append(key, value.toString());
            });

            // Adjuntar IDs de sesión si existen
            const userSesion = localStorage.getItem('usuarioSesion');
            if (userSesion) {
                try {
                    const user = JSON.parse(userSesion);
                    if (user.id) data.append('id_usuario', user.id);
                } catch(e) {}
            }

            const adminSesion = localStorage.getItem('adminSesion');
            if (adminSesion) {
                try {
                    const admin = JSON.parse(adminSesion);
                    if (admin.id) data.append('id_admin', admin.id || admin.id_admin);
                } catch(e) {}
            }

            // Asumimos que el endpoint es guardarReserva.php siguiendo el patrón del proyecto
            const response = await fetch('https://rafa.cicloflorenciopintado.es/guardarReserva.php', {
                method: 'POST',
                body: data
            });

            const result = await response.json();
            if (result.success) {
                setCompletado(true);
                // Redirigir al panel de usuario tras un breve retraso
                setTimeout(() => navigate('/panel-usuario'), 3000);
            } else {
                alert(result.message || 'Hubo un error al procesar tu reserva. Inténtalo de nuevo.');
            }
        } catch (error) {
            console.error('Error al enviar reserva:', error);
            alert('No se pudo conectar con el servidor.');
        } finally {
            setEnviando(false);
        }
    };

    if (completado) {
        return (
            <div className="flex-1 bg-[#D3CCBC] flex items-center justify-center p-6">
                <div className="bg-white p-12 rounded-3xl shadow-2xl text-center max-w-lg w-full animate-fadeIn">
                    <div className="text-6xl mb-6">✨</div>
                    <h2 className="text-3xl font-serif font-bold text-[#30312E] mb-4">¡Reserva Confirmada!</h2>
                    <p className="text-stone-500 mb-8">Gracias, <span className="font-bold">{formData.nombre_cliente}</span>. Hemos recibido tu solicitud correctamente.</p>
                    <p className="text-sm text-stone-500 italic">Redirigiéndote a tu panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#D3CCBC] py-12 px-4 md:py-20">
            <div className="max-w-2xl mx-auto">
                <div className="bg-[#E2DBC9] rounded-[2rem] shadow-2xl overflow-hidden border border-white/20">
                    {/* Header del Formulario */}
                    <div className="bg-[#30312E] p-10 text-center">
                        <h1 className="text-4xl font-serif font-bold text-[#D3CCBC] mb-2">Reserva tu Mesa</h1>
                        <p className="text-[#D3CCBC]/60 font-medium tracking-wide">VIVE UNA EXPERIENCIA GASTRONÓMICA ÚNICA</p>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-8 md:p-14 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Nombre */}
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest font-bold text-stone-500 block ml-1">Nombre y Apellido</label>
                                <input 
                                    required
                                    type="text" 
                                    name="nombre_cliente"
                                    value={formData.nombre_cliente}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-2xl border border-stone-100 focus:border-[#30312E] focus:ring-2 focus:ring-[#30312E]/10 outline-none transition-all bg-[#d4cdbc] text-stone-800"
                                    placeholder="Ej: Rafael García"
                                />
                            </div>

                            {/* Teléfono */}
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest font-bold text-stone-500 block ml-1">Teléfono de Contacto</label>
                                <input 
                                    required
                                    type="tel" 
                                    name="telefono"
                                    value={formData.telefono}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-2xl border border-stone-100 focus:border-[#30312E] focus:ring-2 focus:ring-[#30312E]/10 outline-none transition-all bg-[#d4cdbc] text-stone-800"
                                    placeholder="600 000 000"
                                />
                            </div>

                            {/* Fecha */}
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest font-bold text-stone-500 block ml-1">Fecha de la Cita</label>
                                <input 
                                    required
                                    type="date" 
                                    name="fecha"
                                    value={formData.fecha}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-5 py-4 rounded-2xl border border-stone-100 focus:border-[#30312E] focus:ring-2 focus:ring-[#30312E]/10 outline-none transition-all bg-[#d4cdbc] text-stone-800"
                                />
                            </div>

                            {/* Hora */}
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest font-bold text-stone-500 block ml-1">Hora Preferida</label>
                                <input 
                                    required
                                    type="time" 
                                    name="hora"
                                    value={formData.hora}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-2xl border border-stone-100 focus:border-[#30312E] focus:ring-2 focus:ring-[#30312E]/10 outline-none transition-all bg-[#d4cdbc] text-stone-800"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personas */}
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest font-bold text-stone-500 block ml-1">Comensales</label>
                                <select 
                                    name="personas"
                                    value={formData.personas}
                                    onChange={handleChange}
                                    className="w-full px-5 py-4 rounded-2xl border border-stone-100 focus:border-[#30312E] focus:ring-2 focus:ring-[#30312E]/10 outline-none transition-all bg-[#d4cdbc] text-stone-800 appearance-none cursor-pointer"
                                >
                                    {[1,2,3,4,5,6,7,8,9,10].map(n => (
                                        <option key={n} value={n}>{n} {n === 1 ? 'persona' : 'personas'}</option>
                                    ))}
                                    <option value="11">+10 (Llamar al local)</option>
                                </select>
                            </div>

                            {/* Observaciones placeholder */}
                            <div className="flex items-end pb-1">
                                <p className="text-sm text-stone-500 italic">Para eventos especiales, por favor contáctenos directamente.</p>
                            </div>
                        </div>

                        {/* Mensaje */}
                        <div className="space-y-2">
                            <label className="text-sm uppercase tracking-widest font-bold text-stone-500 block ml-1">Mensaje o Peticiones Especiales</label>
                            <textarea 
                                name="mensaje"
                                value={formData.mensaje}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-5 py-4 rounded-2xl border border-stone-300 focus:border-[#30312E] focus:ring-2 focus:ring-[#30312E]/10 outline-none transition-all bg-[#d4cdbc] text-stone-800"
                                placeholder="Alergias, mesa en ventana, silla de bebé..."
                            ></textarea>
                        </div>

                        <button 
                            type="submit"
                            disabled={enviando}
                            className={`w-full py-5 rounded-2xl font-bold text-xl transition-all transform active:scale-[0.98] shadow-2xl ${
                                enviando 
                                ? 'bg-stone-300 cursor-not-allowed text-stone-500' 
                                : 'bg-[#30312E] text-[#D3CCBC] hover:bg-[#3d3e3a] hover:-translate-y-1'
                            }`}
                        >
                            {enviando ? 'PROCESANDO SOLICITUD...' : 'CONFIRMAR RESERVA'}
                        </button>
                    </form>
                </div>
            </div>
            
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                input[type="date"]::-webkit-calendar-picker-indicator,
                input[type="time"]::-webkit-calendar-picker-indicator {
                    cursor: pointer;
                    filter: invert(15%) sepia(5%) saturate(1000%) hue-rotate(20deg);
                }
            `}</style>
        </div>
    );
};
