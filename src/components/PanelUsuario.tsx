import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from './Notification';

interface Reserva {
    id_reserva: number;
    fecha: string;
    hora: string;
    personas: number;
    mensaje: string;
}

interface ProductoVotado {
    id_producto: number;
    nombre: string;
    imagen: string;
    mi_puntuacion: number;
    media_votos: string;
    tipo: string;
    subtipo: string;
}

const PanelUsuario: React.FC = () => {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [cargando, setCargando] = useState(true);
    const [usuario, setUsuario] = useState<{ nombre: string, telefono: string } | null>(null);
    const [idAEliminar, setIdAEliminar] = useState<number | null>(null);
    const [confirmando, setConfirmando] = useState(false);

    // Estados para PRODUCTOS VOTADOS
    const [votos, setVotos] = useState<ProductoVotado[]>([]);
    const [cargandoVotos, setCargandoVotos] = useState(false);

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
            obtenerVotos(parsed.id_usuario);
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
                if (time >= "13:30" && time <= "15:30") slots.push(time);
            }
        }

        if (dayOfWeek === 5 || dayOfWeek === 6) {
            for (let h = 20; h <= 22; h++) {
                for (let m = 0; m < 60; m += 15) {
                    const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    if (time >= "20:30" && time <= "22:30") slots.push(time);
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

    const obtenerVotos = async (idUsuario: number) => {
        setCargandoVotos(true);
        try {
            // Usamos getProductos.php que ya devuelve 'mi_puntuacion' si pasamos el id_usuario
            const response = await fetch(`https://rafa.cicloflorenciopintado.es/getProductos.php?tipo=all&id_usuario=${idUsuario}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                // Filtramos solo los que el usuario ha votado
                const filtrados = data.filter((p: any) => p.mi_puntuacion !== null);
                // Ordenamos por puntuación del usuario descendente
                filtrados.sort((a, b) => (b.mi_puntuacion || 0) - (a.mi_puntuacion || 0));
                setVotos(filtrados);
            }
        } catch (error) {
            console.error('Error al obtener votos:', error);
        } finally {
            setCargandoVotos(false);
        }
    };

    const getImagePath = (imagen: string) => {
        let nombreArchivo = imagen;
        if (!nombreArchivo || nombreArchivo === '') {
            nombreArchivo = 'default.jpg';
        } else {
            if (nombreArchivo.startsWith('http') || nombreArchivo.startsWith('data:')) return nombreArchivo;
            if (nombreArchivo.startsWith('/')) nombreArchivo = nombreArchivo.substring(1);
            if (nombreArchivo.startsWith('Img/')) nombreArchivo = nombreArchivo.substring(4);
            if (nombreArchivo.startsWith('img/')) nombreArchivo = nombreArchivo.substring(4);
        }
        return `https://rafa.cicloflorenciopintado.es/Img/${nombreArchivo}`;
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
                showNotification('Reserva cancelada correctamente', 'success');
            } else {
                showNotification(result.message || 'Error al eliminar', 'error');
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

    const handleActualizar = async (e: React.SubmitEvent) => {
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
                showNotification('Reserva actualizada correctamente', 'success');
                setReservaEditando(null);
                if (usuario) obtenerReservas(usuario.telefono); // Recargar lista
            } else {
                showNotification(result.message || 'Error al actualizar', 'error');
            }
        } catch (error) {
            showNotification('Error de conexión al actualizar', 'error');
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
        <div className="flex-1 bg-[#D3CCBC] p-3 md:p-12">
            <div className="max-w-5xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-2xl md:text-4xl font-bold text-stone-800 mb-2 font-serif">Mi Panel Personal</h1>
                    <p className="text-sm text-stone-500">Hola, <span className="font-bold text-[#30312E]">{usuario?.nombre}</span>. Aquí puedes gestionar tus reservas y ver tus platos favoritos.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
                    {/* COLUMNA IZQUIERDA: RESERVAS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-[#30312E] p-2 rounded-xl shadow-lg">
                                <img src="/calendar.svg" alt="" className="w-6 h-6 invert opacity-80" />
                            </div>
                            <h2 className="text-xl font-bold text-[#30312E] font-serif uppercase tracking-wider">Mis Reservas</h2>
                        </div>

                        {reservas.length === 0 ? (
                            <div className="bg-[#e2dbc9] rounded-3xl p-8 text-center shadow-sm border border-stone-200">
                                <h3 className="text-lg font-bold text-stone-700 mb-2">No tienes reservas activas</h3>
                                <p className="text-sm text-stone-500 mb-6">¿Te apetece disfrutar de nuestra cocina hoy?</p>
                                <button
                                    onClick={() => navegar('/reservar')}
                                    className="bg-[#30312E] text-[#D3CCBC] px-6 py-3 rounded-full text-sm font-bold hover:bg-[#4a4b46] transition-all"
                                >
                                    Hacer una Reserva
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {reservas.map(reserva => (
                                    <div key={reserva.id_reserva} className="bg-[#E2DBC9] rounded-2xl p-4 shadow-md border border-stone-100 flex flex-col justify-between gap-4 hover:shadow-lg transition-all group">
                                        <div className="flex-1 w-full flex flex-col gap-3">
                                            <div className="flex flex-row justify-between items-center bg-[#D3CCBC]  p-3 rounded-xl">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-[#30312E]/40 uppercase">Fecha</span>
                                                    <span className="font-bold text-stone-800">{new Date(reserva.fecha).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] font-black text-[#30312E]/40 uppercase">Hora</span>
                                                    <span className="font-bold text-stone-800">{reserva.hora.substring(0, 5)}</span>
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-[10px] font-black text-[#30312E]/40 uppercase">Pax</span>
                                                    <span className="font-bold text-stone-800">{reserva.personas} pers.</span>
                                                </div>
                                            </div>

                                            {reserva.mensaje && (
                                                <div className="px-1">
                                                    <p className="text-xs text-stone-500 italic leading-relaxed">"{reserva.mensaje}"</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 pt-2 border-t border-stone-800/5">
                                            <button
                                                className="flex-1 px-4 py-2 rounded-xl text-[#30312E] text-xs font-bold hover:bg-white/50 transition-colors border border-[#30312E]/10 flex items-center justify-center gap-2"
                                                onClick={() => abrirModificacion(reserva)}
                                            >
                                                ✏️ Modificar
                                            </button>
                                            <button
                                                onClick={() => eliminarReserva(reserva.id_reserva)}
                                                className="flex-1 px-4 py-2 rounded-xl text-red-800 text-xs font-bold hover:bg-red-50 transition-colors border border-red-100 flex items-center justify-center gap-2"
                                                title="Cancelar Reserva"
                                            >
                                                🗑️ Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* COLUMNA DERECHA: RANKING DE VOTOS */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-[#30312E] p-2 rounded-xl shadow-lg">
                                <span className="text-xl">⭐</span>
                            </div>
                            <h2 className="text-xl font-bold text-[#30312E] font-serif uppercase tracking-wider">Mi Ranking</h2>
                        </div>

                        {cargandoVotos ? (
                            <div className="text-center py-10 italic text-stone-400 animate-pulse">Cargando tus votos...</div>
                        ) : votos.length === 0 ? (
                            <div className="bg-[#e2dbc9]/60 rounded-3xl p-8 text-center border-2 border-dashed border-[#30312E]/10">
                                <p className="text-stone-500 text-sm italic mb-4">Aún no has votado ningún producto.</p>
                                <button
                                    onClick={() => navegar('/carta')}
                                    className="text-[#30312E] font-bold text-sm underline hover:opacity-70"
                                >
                                    Ir a la Carta
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {votos.map((voto, index) => (
                                    <div key={voto.id_producto} className="bg-[#E2DBC9] rounded-xl p-2 shadow-sm border border-stone-100 flex items-center gap-3 group hover:shadow-md transition-all">
                                        <div className="relative w-12 h-12 shrink-0">
                                            <img 
                                                src={getImagePath(voto.imagen)} 
                                                alt={voto.nombre} 
                                                className="w-full h-full object-cover rounded-lg shadow-sm group-hover:scale-105 transition-transform" 
                                            />
                                            <div className="absolute -top-1 -left-1 bg-[#30312E] text-[#D3CCBC] w-5 h-5 rounded-md flex items-center justify-center text-[8px] font-black shadow-lg">
                                                #{index + 1}
                                            </div>
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-[#30312E] text-xs truncate">{voto.nombre}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex text-yellow-600 text-[10px]">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i}>{i < voto.mi_puntuacion ? '★' : '☆'}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/40 px-2 py-1 rounded-lg text-center min-w-[35px]">
                                            <span className="text-sm font-black text-[#30312E] leading-none">{voto.mi_puntuacion}</span>
                                        </div>
                                    </div>
                                ))}
                                <p className="text-[10px] text-stone-400 italic text-center pt-2">Productos ordenados por tu puntuación personal.</p>
                            </div>
                        )}
                    </div>
                </div>
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
                                        onChange={(e) => setFormModificar({ ...formModificar, fecha: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-[#D4CDBC] focus:ring-2 focus:ring-[#30312E]/10 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs uppercase font-bold text-stone-500 mb-1 block">Hora</label>
                                    <select
                                        required
                                        value={formModificar.hora}
                                        onChange={(e) => setFormModificar({ ...formModificar, hora: e.target.value })}
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
                                    onChange={(e) => setFormModificar({ ...formModificar, personas: parseInt(e.target.value) })}
                                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-[#D4CDBC]"
                                />
                            </div>

                            <div>
                                <label className="text-xs uppercase font-bold text-stone-500 mb-1 block">Observaciones</label>
                                <textarea
                                    value={formModificar.mensaje}
                                    onChange={(e) => setFormModificar({ ...formModificar, mensaje: e.target.value })}
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
