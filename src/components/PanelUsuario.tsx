import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Reserva {
    id_reserva: number;
    fecha: string;
    hora: string;
    personas: number;
    observaciones: string;
}

const PanelUsuario: React.FC = () => {
    const [reservas, setReservas] = useState<Reserva[]>([]);
    const [cargando, setCargando] = useState(true);
    const [usuario, setUsuario] = useState<{ nombre: string, telefono: string } | null>(null);
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

    const eliminarReserva = async (id: number) => {
        if (!window.confirm('¿Estás seguro de que deseas cancelar esta reserva?')) return;

        try {
            const formData = new FormData();
            formData.append('id_reserva', id.toString());

            const response = await fetch('https://rafa.cicloflorenciopintado.es/eliminarReserva.php', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            if (result.success) {
                setReservas(reservas.filter(r => r.id_reserva !== id));
                alert('Reserva cancelada correctamente');
            } else {
                alert(result.message || 'Error al eliminar');
            }
        } catch (error) {
            console.error('Error al eliminar reserva:', error);
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
                            <div key={reserva.id_reserva} className="bg-white rounded-2xl p-6 shadow-md border border-stone-100 flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className="bg-stone-100 p-4 rounded-xl text-center min-w-[80px]">
                                        <div className="text-xs font-bold text-stone-400 uppercase tracking-tighter">Personas</div>
                                        <div className="text-2xl font-bold text-stone-800">{reserva.personas}</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold text-stone-800 flex items-center gap-2">
                                            <span>📅 {new Date(reserva.fecha).toLocaleDateString()}</span>
                                            <span className="text-stone-300">|</span>
                                            <span>🕒 {reserva.hora.substring(0, 5)}</span>
                                        </div>
                                        {reserva.observaciones && (
                                            <p className="text-sm text-stone-500 mt-1 italic">"{reserva.observaciones}"</p>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex gap-2">
                                    {/* Modificar (simulado o redirigiendo a /reservar con ID) */}
                                    <button 
                                        className="px-4 py-2 rounded-xl text-blue-600 font-bold hover:bg-blue-50 transition-colors border border-blue-100"
                                        onClick={() => alert('Función de modificación próximamente')}
                                    >
                                        ✏️ Modificar
                                    </button>
                                    <button 
                                        onClick={() => eliminarReserva(reserva.id_reserva)}
                                        className="px-4 py-2 rounded-xl text-red-600 font-bold hover:bg-red-50 transition-colors border border-red-100"
                                    >
                                        🗑️ Cancelar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PanelUsuario;
