import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Reserva {
    id_reserva: number;
    fecha: string;
    hora: string;
    personas: number;
    mensaje: string;
}

const PanelUsuario: React.FC = () => {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [cargando, setCargando] = useState(true);
    const [usuario, setUsuario] = useState<{ nombre: string, telefono: string } | null>(null);
    const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
    const [confirmando, setConfirmando] = useState(false);
    
    // Estados para la MODIFICACIÓN
    const [reservaEditando, setReservaEditando] = useState<Reserva | null>(null);
    const [formModificar, setFormModificar] = useState({
        fecha: '',
        hora: '',
        personas: 2,
        mensaje: ''
    });
    const [slotsModificar, setSlotsModificar] = useState<string[]>([]);
    const [guardandoModificacion, setGuardandoModificacion] = useState(false);
    
    const navegar = useNavigate();

    useEffect(() => {
        const sesionRaw = localStorage.getItem('usuarioSesion');
        if (!sesionRaw) {
            navegar('/login');
            return;
        }

        try {
            const parsed = JSON.parse(sesionRaw);
            setUsuario(parsed);
            obtenerReservas(parsed.telefono);
        } catch (e) {
            localStorage.removeItem('usuarioSesion');
            navegar('/login');
        }
    }, [navegar]);

    // Lógica de cálculo de horarios para el formulario de modificación (Clonada de Reservar.tsx)
    useEffect(() => {
        if (!formModificar.fecha) {
            setSlotsModificar([]);
            return;
        }

        const [year, month, day] = formModificar.fecha.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();

        if (dayOfWeek === 2) {
            setSlotsModificar(['CERRADO']);
            if (formModificar.hora) setFormModificar(prev => ({ ...prev, hora: '' }));
            return;
        }

        const slots: string[] = [];
        for (let h = 13; h <= 15; h++) {
            for (let m = 0; m < 60; m += 15) {
                const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                if (time >= "13:30" && time <= "15:45") slots.push(time);
            }
        }

        if (dayOfWeek === 5 || dayOfWeek === 6) {
            for (let h = 20; h <= 22; h++) {
                for (let m = 0; m < 60; m += 15) {
                    const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    if (time >= "20:30" && time <= "22:45") slots.push(time);
                }
            }
        }

        setSlotsModificar(slots);
        if (formModificar.hora && !slots.includes(formModificar.hora)) {
            setFormModificar(prev => ({ ...prev, hora: '' }));
        }
    }, [formModificar.fecha]);

    const obtenerReservas = async (telefono: string) => {
        setCargando(true);
        try {
            const response = await fetch(`https://rafa.cicloflorenciopintado.es/getReservas.php?telefono=${telefono}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setReservas(data);
            } else {
                setReservas([]);
            }
        } catch (error) {
            console.error('Error al obtener reservas:', error);
        } finally {
            setCargando(false);
        }
    };

    const eliminarReserva = (id: number) => {
        setIdAEliminar(id);
    };

    const confirmarEliminacion = async () => {
        if (!idAEliminar) return;
        setConfirmando(true);

        try {
            const formData = new FormData();
            formData.append('id_reserva', idAEliminar.toString());

            const response = await fetch('https://rafa.cicloflorenciopintado.es/eliminarReserva.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                setReservas(reservas.filter(r => r.id_reserva !== idAEliminar));
                // Opcional: podrías poner una notificación bonita aquí en lugar de alert
            } else {
                alert(result.message || 'Error al eliminar');
            }
        } catch (error) {
            console.error('Error al eliminar reserva:', error);
        } finally {
            setConfirmando(false);
            setIdAEliminar(null);
        }
    };

    const abrirModificacion = (reserva: Reserva) => {
        setReservaEditando(reserva);
        setFormModificar({
            fecha: reserva.fecha,
            hora: reserva.hora.substring(0, 5),
            personas: reserva.personas,
            mensaje: reserva.mensaje || ''
        });
    };

    const handleActualizar = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reservaEditando) return;
        setGuardandoModificacion(true);

        try {
            const data = new FormData();
            data.append('id_reserva', reservaEditando.id_reserva.toString());
            data.append('fecha', formModificar.fecha);
            data.append('hora', formModificar.hora);
            data.append('personas', formModificar.personas.toString());
            data.append('mensaje', formModificar.mensaje);

            const response = await fetch('https://rafa.cicloflorenciopintado.es/actualizarReserva.php', {
                method: 'POST',
                body: data
            });

            const result = await response.json();
            if (result.success) {
                alert('Reserva actualizada correctamente');
                setReservaEditando(null);
                if (usuario) obtenerReservas(usuario.telefono); // Recargar lista
            } else {
                alert(result.message || 'Error al actualizar');
            }
        } catch (error) {
            alert('Error de conexión al actualizar');
        } finally {
            setGuardandoModificacion(false);
        }
    };

    if (cargando) {
        return (
            <div className="flex-1 flex items-center justify-center p-12 bg-stone-50">
                <div className="text-xl italic text-stone-500 animate-pulse">Cargando tus reservas...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 bg-[#D3CCBC] p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-stone-800 mb-2 font-serif">Mis Reservas</h1>
                    <p className="text-stone-500">Hola, <span className="font-bold text-[#30312E]">{usuario?.nombre}</span>. Aquí puedes gestionar tus próximas visitas.</p>
                </header>

                {reservas.length === 0 ? (
                    <div className="bg-[#e2dbc9] rounded-3xl p-12 text-center shadow-sm border border-stone-200">
                        <img src="/calendar.svg" alt="Calendario" className="w-20 h-20 mx-auto mb-6 opacity-80" />
                        <h3 className="text-xl font-bold text-stone-700 mb-2">No tienes reservas activas</h3>
                        <p className="text-stone-500 mb-6">¿Te apetece disfrutar de nuestra cocina hoy?</p>
                        <button
                            onClick={() => navegar('/reservar')}
                            className="bg-[#30312E] text-[#D3CCBC] px-8 py-3 rounded-full font-bold hover:bg-[#4a4b46] transition-all"
                        >
                            Hacer una Reserva
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {reservas.map(reserva => (
                            <div key={reserva.id_reserva} className="bg-[#E2DBC9] rounded-2xl p-6 shadow-md border border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="bg-[#D3CCBC] p-4 rounded-xl text-center min-w-[80px]">
                                        <div className="text-xs font-bold text-stone-400 uppercase tracking-tighter">Personas</div>
                                        <div className="text-2xl font-bold text-stone-800">{reserva.personas}</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                            <span>📅 {new Date(reserva.fecha).toLocaleDateString()}</span>
                                            <span className="text-stone-300">|</span>
                                            <span>🕒 {reserva.hora.substring(0, 5)}</span>
                                        </div>
                                        {reserva.mensaje && (
                                            <p className="text-sm text-stone-500 mt-1 italic">"{reserva.mensaje}"</p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        className="px-4 py-2 rounded-xl text-[#30312E] font-bold hover:bg-[#D3CCBC]/50 transition-colors border border-[#30312E]/10"
                                        onClick={() => abrirModificacion(reserva)}
                                    >
                                        ✏️ Modificar
                                    </button>
                                    <button
                                        onClick={() => eliminarReserva(reserva.id_reserva)}
                                        className="px-4 py-2 rounded-xl text-red-800 font-bold hover:bg-red-50 transition-colors border border-red-100"
                                    >
                                        🗑️ Cancelar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Modificación */}
            {reservaEditando && (
                <div className="fixed inset-0 bg-[#30312E]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-[#E2DBC9] rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-[#D3CCBC] transform animate-popIn overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-[#30312E] font-serif">Modificar Reserva</h3>
                            <button onClick={() => setReservaEditando(null)} className="text-[#30312E]/50 hover:text-[#30312E] text-2xl">×</button>
                        </div>

                        <form onSubmit={handleActualizar} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase font-bold text-stone-500 mb-1 block">Fecha</label>
                                    <input 
                                        type="date" 
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                        value={formModificar.fecha}
                                        onChange={(e) => setFormModificar({...formModificar, fecha: e.target.value})}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-[#D4CDBC] focus:ring-2 focus:ring-[#30312E]/10 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-stone-500 mb-1 block">Hora</label>
                                    <select 
                                        required
                                        value={formModificar.hora}
                                        onChange={(e) => setFormModificar({...formModificar, hora: e.target.value})}
                                        disabled={!formModificar.fecha || slotsModificar[0] === 'CERRADO'}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-[#D4CDBC] outline-none"
                                    >
                                        <option value="">Elegir...</option>
                                        {slotsModificar.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="text-xs uppercase font-bold text-stone-500 mb-1 block">Comensales</label>
                                <input 
                                    type="number" min="1" max="50" required
                                    value={formModificar.personas}
                                    onChange={(e) => setFormModificar({...formModificar, personas: parseInt(e.target.value)})}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-[#D4CDBC]"
                                />
                            </div>

                            <div>
                                <label className="text-xs uppercase font-bold text-stone-500 mb-1 block">Observaciones</label>
                                <textarea 
                                    value={formModificar.mensaje}
                                    onChange={(e) => setFormModificar({...formModificar, mensaje: e.target.value})}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-[#D4CDBC] resize-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setReservaEditando(null)}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-[#D3CCBC] text-[#30312E] hover:bg-[#c5bdab] transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={guardandoModificacion}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-[#30312E] text-[#D3CCBC] hover:bg-[#3d3e3a] shadow-lg transition-all flex items-center justify-center"
                                >
                                    {guardandoModificacion ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Confirmación Personalizado */}
            {idAEliminar !== null && (
                <div className="fixed inset-0 bg-[#30312E]/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-[#E2DBC9] rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-[#D3CCBC] transform animate-popIn">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                                ⚠️
                            </div>
                            <h3 className="text-2xl font-bold text-[#30312E] mb-2 font-serif">¿Cancelar Reserva?</h3>
                            <p className="text-[#30312E]/70 mb-8">
                                Esta acción no se puede deshacer. ¿Estás seguro de que deseas cancelar tu visita?
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setIdAEliminar(null)}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-[#D3CCBC] text-[#30312E] hover:bg-[#c5bdab] transition-all"
                                    disabled={confirmando}
                                >
                                    No, volver
                                </button>
                                <button
                                    onClick={confirmarEliminacion}
                                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-800 text-white hover:bg-red-900 shadow-lg transition-all flex items-center justify-center gap-2"
                                    disabled={confirmando}
                                >
                                    {confirmando ? (
                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    ) : (
                                        'Sí, cancelar'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.9) translateY(10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-popIn { animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
            `}</style>
        </div>
    );
};

export default PanelUsuario;
