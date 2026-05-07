import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from './Notification';
/**
 * Componente Reservar: Gestiona el formulario de reservas del restaurante.
 * Permite a los usuarios elegir fecha, hora (validada dinámicamente) y número de comensales.
 */
export const Reservar: React.FC = () => {
    const navegar = useNavigate();
    const [datosFormulario, setDatosFormulario] = useState({
        nombre_cliente: '',
        telefono: '',
        fecha: '',
        hora: '',
        personas: 2,
        mensaje: ''
    });
    const [enviando, setEnviando] = useState(false);
    const [completado, setCompletado] = useState(false);
    const [horariosDisponibles, setHorariosDisponibles] = useState<string[]>([]);

    useEffect(() => {
        // Cargar datos de usuario si existe sesión
        const sesionLocal = localStorage.getItem('usuarioSesion');
        if (sesionLocal) {
            try {
                const usuario = JSON.parse(sesionLocal);
                setDatosFormulario(prev => ({
                    ...prev,
                    nombre_cliente: usuario.nombre || '',
                    telefono: usuario.telefono || ''
                }));
            } catch (e) {
                console.error("Error al leer la sesión", e);
            }
        }
    }, []);

    // Cálculo dinámico de horarios disponibles
    useEffect(() => {
        if (!datosFormulario.fecha) {
            setHorariosDisponibles([]);
            return;
        }

        const [anio, mes, dia] = datosFormulario.fecha.split('-').map(Number);
        const fechaObj = new Date(anio, mes - 1, dia);
        const diaSemana = fechaObj.getDay(); // 0: Dom, 1: Lun, 2: Mar, 3: Mie, 4: Jue, 5: Vie, 6: Sab

        // Martes Cerrado
        if (diaSemana === 2) {
            setHorariosDisponibles(['CERRADO']);
            if (datosFormulario.hora) setDatosFormulario(prev => ({ ...prev, hora: '' }));
            return;
        }

        const turnos: string[] = [];
        
        // Turno Mediodía: 13:30 - 15:30 (Todos los días excepto Martes)
        for (let h = 13; h <= 15; h++) {
            for (let m = 0; m < 60; m += 15) {
                const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                if (hora >= "13:30" && hora <= "15:30") {
                    turnos.push(hora);
                }
            }
        }

        // Turno Noche: 20:30 - 22:30 (Solo Viernes [5] y Sábado [6])
        if (diaSemana === 5 || diaSemana === 6) {
            for (let h = 20; h <= 22; h++) {
                for (let m = 0; m < 60; m += 15) {
                    const hora = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    if (hora >= "20:30" && hora <= "22:30") {
                        turnos.push(hora);
                    }
                }
            }
        }

        setHorariosDisponibles(turnos);
        
        // Resetear hora si la seleccionada ya no es válida para el nuevo día
        if (datosFormulario.hora && !turnos.includes(datosFormulario.hora)) {
            setDatosFormulario(prev => ({ ...prev, hora: '' }));
        }
    }, [datosFormulario.fecha]);

    const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDatosFormulario(prev => ({ ...prev, [name]: value }));
    };

    const manejarEnvio = async (e: React.FormEvent) => {
        e.preventDefault();

        if (datosFormulario.telefono.length !== 9) {
            showNotification('El número de teléfono debe tener exactamente 9 dígitos', 'error');
            return;
        }

        setEnviando(true);

        try {
            const datosParaEnviar = new FormData();
            Object.entries(datosFormulario).forEach(([llave, valor]) => {
                datosParaEnviar.append(llave, valor.toString());
            });

            // Adjuntar IDs de sesión si existen
            const sesionUsuario = localStorage.getItem('usuarioSesion');
            if (sesionUsuario) {
                try {
                    const usuario = JSON.parse(sesionUsuario);
                    if (usuario.id) datosParaEnviar.append('id_usuario', usuario.id);
                } catch(e) {}
            }

            const sesionAdmin = localStorage.getItem('adminSesion');
            if (sesionAdmin) {
                try {
                    const admin = JSON.parse(sesionAdmin);
                    if (admin.id) datosParaEnviar.append('id_admin', admin.id || admin.id_admin);
                } catch(e) {}
            }

            const respuesta = await fetch('https://rafa.cicloflorenciopintado.es/guardarReserva.php', {
                method: 'POST',
                body: datosParaEnviar
            });

            const resultado = await respuesta.json();
            if (resultado.success) {
                setCompletado(true);
                showNotification('Reserva confirmada correctamente', 'success');
                // Redirigir tras un breve retraso
                setTimeout(() => navegar('/mis-reservas'), 3000);
            } else {
                showNotification(resultado.message || 'Hubo un error al procesar tu reserva. Inténtalo de nuevo.', 'error');
            }
        } catch (error) {
            showNotification('No se pudo conectar con el servidor.', 'error');
        } finally {
            setEnviando(false);
        }
    };

    if (completado) {
        return (
            <div className="flex-1 bg-[#D3CCBC] flex items-center justify-center p-6">
                <div className="bg-[#D3CCBC] p-12 rounded-3xl shadow-2xl text-center max-w-lg w-full animate-fadeIn">
                    <h2 className="text-3xl font-serif font-bold text-[#30312E] mb-4">¡Reserva Confirmada!</h2>
                    <p className="text-stone-500 mb-8">Gracias, <span className="font-bold">{datosFormulario.nombre_cliente}</span>. Hemos recibido tu solicitud correctamente.</p>
                    <p className="text-sm text-stone-500 italic">Redirigiéndote a tu panel...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#D3CCBC] py-12 px-4 md:py-20">
            <div className="max-w-2xl mx-auto">
                <div className="bg-[#E2DBC9] rounded-4xl shadow-2xl overflow-hidden border border-white/20">
                    {/* Header del Formulario */}
                    <div className="bg-[#30312E] p-10 text-center">
                        <h1 className="text-4xl font-serif font-bold text-[#D3CCBC] mb-2">Reserva tu Mesa</h1>
                        <p className="text-[#D3CCBC]/60 font-medium tracking-wide">VIVE UNA EXPERIENCIA GASTRONÓMICA ÚNICA</p>
                    </div>
                    
                    <form onSubmit={manejarEnvio} className="p-8 md:p-14 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Nombre */}
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest font-bold text-stone-500 block ml-1">Nombre y Apellido</label>
                                <input 
                                    required
                                    type="text" 
                                    name="nombre_cliente"
                                    value={datosFormulario.nombre_cliente}
                                    onChange={manejarCambio}
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
                                    minLength={9}
                                    maxLength={9}
                                    value={datosFormulario.telefono}
                                    onChange={manejarCambio}
                                    className="w-full px-5 py-4 rounded-2xl border border-stone-100 focus:border-[#30312E] focus:ring-2 focus:ring-[#30312E]/10 outline-none transition-all bg-[#d4cdbc] text-stone-800"
                                    placeholder="600000000"
                                />
                            </div>

                            {/* Fecha */}
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest font-bold text-stone-500 block ml-1">Fecha de la Cita</label>
                                <input 
                                    required
                                    type="date" 
                                    name="fecha"
                                    value={datosFormulario.fecha}
                                    onChange={manejarCambio}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="w-full px-5 py-4 rounded-2xl border border-stone-100 focus:border-[#30312E] focus:ring-2 focus:ring-[#30312E]/10 outline-none transition-all bg-[#d4cdbc] text-stone-800"
                                />
                            </div>

                            {/* Hora */}
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest font-bold text-stone-500 block ml-1">Hora Preferida</label>
                                <select 
                                    required
                                    name="hora"
                                    value={datosFormulario.hora}
                                    onChange={manejarCambio}
                                    disabled={!datosFormulario.fecha || horariosDisponibles[0] === 'CERRADO'}
                                    className={`w-full px-5 py-4 rounded-2xl border border-stone-100 focus:border-[#30312E] focus:ring-2 focus:ring-[#30312E]/10 outline-none transition-all bg-[#d4cdbc] text-stone-800 cursor-pointer ${
                                        (!datosFormulario.fecha || horariosDisponibles[0] === 'CERRADO') ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {!datosFormulario.fecha ? (
                                        <option value="">Selecciona fecha primero</option>
                                    ) : horariosDisponibles[0] === 'CERRADO' ? (
                                        <option value="">MARTES CERRADO</option>
                                    ) : (
                                        <>
                                            <option value="">-- Elige una hora --</option>
                                            {horariosDisponibles.map(slot => (
                                                <option key={slot} value={slot}>{slot}</option>
                                            ))}
                                        </>
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personas */}
                            <div className="space-y-2">
                                <label className="text-sm uppercase tracking-widest font-bold text-stone-500 block ml-1">Comensales</label>
                                <input 
                                    type="number"
                                    name="personas"
                                    min="1"
                                    max="50"
                                    value={datosFormulario.personas}
                                    onChange={manejarCambio}
                                    className="w-full px-5 py-4 rounded-2xl border border-stone-100 focus:border-[#30312E] focus:ring-2 focus:ring-[#30312E]/10 outline-none transition-all bg-[#d4cdbc] text-stone-800"
                                    placeholder="2"
                                    required
                                />
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
                                value={datosFormulario.mensaje}
                                onChange={manejarCambio}
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
