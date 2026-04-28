import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { showNotification } from './Notification';

/**
 * Interfaz que define la estructura de un Producto
 */
interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: string;
  subtipo: string;
  imagen: string;
}

const PanelAdmin: React.FC = () => {
  const navegar = useNavigate();
  const [adminNombre, setAdminNombre] = useState('Admin');

  // --- ESTADOS DEL COMPONENTE ---
  const [listaProductos, setListaProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarEspeciales, setMostrarEspeciales] = useState(true);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [filtroActivo, setFiltroActivo] = useState('todos');
  
  // Estados para Reservas
  const [vistaActual, setVistaActual] = useState<'productos' | 'reservas'>('productos');
  const [listaReservas, setListaReservas] = useState<any[]>([]);
  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split('T')[0]);
  const [cargandoReservas, setCargandoReservas] = useState(false);
  const [reservaEditando, setReservaEditando] = useState<any>(null);
  const [modalReservaAbierto, setModalReservaAbierto] = useState(false);
  const [datosReservaForm, setDatosReservaForm] = useState({
    nombre_cliente: '',
    telefono: '',
    personas: 1,
    fecha: '',
    hora: '',
    mensaje: ''
  });

  const [datosFormulario, setDatosFormulario] = useState<Omit<Producto, 'id_producto'>>({
    nombre: '',
    descripcion: '',
    precio: 0,
    tipo: 'carta',
    subtipo: 'carnes',
    imagen: ''
  });
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null);

  const subtiposPorTipo: Record<string, string[]> = {
    carta: ['entrantes', 'carnes', 'pescados','pastas', 'postres'],
    vinos: ['tintos', 'blancos', 'rosados', 'espumosos'],
    especial: ['sugerencias', 'temporada']
  };

  // --- LÓGICA DE RESERVAS ---
  const obtenerReservas = async (fechaSeleccionada: string) => {
    setCargandoReservas(true);
    try {
      const respuesta = await fetch(`https://rafa.cicloflorenciopintado.es/getReservasAdmin.php?fecha=${fechaSeleccionada}`);
      const datos = await respuesta.json();
      setListaReservas(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error('Error al cargar reservas:', error);
    } finally {
      setCargandoReservas(false);
    }
  };

  const eliminarReserva = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
      try {
        const formData = new FormData();
        formData.append('id_reserva', id.toString());
        const respuesta = await fetch('https://rafa.cicloflorenciopintado.es/eliminarReserva.php', {
          method: 'POST',
          body: formData
        });
        const resultado = await respuesta.json();
        if (resultado.success) {
          obtenerReservas(filtroFecha);
        }
      } catch (error) {
        console.error('Error al eliminar reserva');
      }
    }
  };

  const abrirModalReserva = (reserva: any) => {
    setReservaEditando(reserva);
    setDatosReservaForm({
      nombre_cliente: reserva.nombre_cliente,
      telefono: reserva.telefono,
      personas: reserva.personas,
      fecha: reserva.fecha,
      hora: reserva.hora,
      mensaje: reserva.mensaje || ''
    });
    setModalReservaAbierto(true);
  };

  const guardarCambiosReserva = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (datosReservaForm.telefono.length !== 9) {
        showNotification('El número de teléfono debe tener exactamente 9 dígitos', 'error');
        return;
      }

      const formData = new FormData();
      formData.append('id_reserva', reservaEditando.id_reserva.toString());
      formData.append('nombre_cliente', datosReservaForm.nombre_cliente);
      formData.append('telefono', datosReservaForm.telefono);
      formData.append('personas', datosReservaForm.personas.toString());
      formData.append('fecha', datosReservaForm.fecha);
      formData.append('hora', datosReservaForm.hora);
      formData.append('mensaje', datosReservaForm.mensaje);

      const respuesta = await fetch('https://rafa.cicloflorenciopintado.es/actualizarReserva.php', {
        method: 'POST',
        body: formData
      });
      const resultado = await respuesta.json();

      if (resultado.success) {
        setModalReservaAbierto(false);
        obtenerReservas(filtroFecha);
        showNotification('Reserva actualizada', 'success');
      } else {
        showNotification(resultado.message, 'error');
      }
    } catch (error) {
      console.error('Error al guardar reserva');
    }
  };

  useEffect(() => {
    if (vistaActual === 'reservas') {
      obtenerReservas(filtroFecha);
    }
  }, [filtroFecha, vistaActual]);

  // --- LÓGICA DE PRODUCTOS ---
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

  useEffect(() => {
    const sesion = localStorage.getItem('adminSesion');
    if (!sesion) {
      navegar('/admin/login');
      return;
    }
    const datosSesion = JSON.parse(sesion);
    setAdminNombre(datosSesion.nombre);
    obtenerProductos();
    obtenerConfigAdmin();
  }, [navegar]);

  const obtenerConfigAdmin = async () => {
    try {
      const respuesta = await fetch('https://rafa.cicloflorenciopintado.es/getAdminConfig.php');
      const datos = await respuesta.json();
      if (datos.success) {
        setMostrarEspeciales(datos.especials === 1 || datos.especials === true);
      }
    } catch (error) {
      console.error('Error al obtener configuración:', error);
    }
  };

  const cerrarSesion = () => {
    localStorage.removeItem('adminSesion');
    navegar('/');
    window.location.reload();
  };

  const obtenerProductos = async () => {
    setCargando(true);
    try {
      const respuesta = await fetch('https://rafa.cicloflorenciopintado.es/getProductos.php?tipo=all');
      const datos = await respuesta.json();
      setListaProductos(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false);
    }
  };

  const alternarEspeciales = async () => {
    const nuevoEstado = !mostrarEspeciales;
    try {
      const formData = new FormData();
      formData.append('especials', nuevoEstado ? '1' : '0');
      const respuesta = await fetch('https://rafa.cicloflorenciopintado.es/actualizarConfigAdmin.php', {
        method: 'POST',
        body: formData
      });
      const resultado = await respuesta.json();
      if (resultado.success) setMostrarEspeciales(nuevoEstado);
    } catch (error) {
      console.error('Error al sincronizar con el servidor');
    }
  };

  const eliminarProducto = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      try {
        const formData = new FormData();
        formData.append('id_producto', id.toString());
        const respuesta = await fetch('https://rafa.cicloflorenciopintado.es/eliminarProducto.php', {
          method: 'POST',
          body: formData
        });
        const resultado = await respuesta.json();
        if (resultado.success) {
          setListaProductos(listaProductos.filter(p => p.id_producto !== id));
        }
      } catch (error) {
        console.error('Error al eliminar');
      }
    }
  };

   const guardarCambios = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const url = productoEditando 
      ? 'https://rafa.cicloflorenciopintado.es/actualizarProducto.php' 
      : 'https://rafa.cicloflorenciopintado.es/insertarProducto.php';

    const formData = new FormData();
    if (productoEditando) formData.append('id_producto', productoEditando.id_producto.toString());
    
    formData.append('nombre', datosFormulario.nombre);
    formData.append('descripcion', datosFormulario.descripcion);
    formData.append('precio', datosFormulario.precio.toString());
    formData.append('tipo', datosFormulario.tipo);
    formData.append('subtipo', datosFormulario.subtipo);
    
    // --- LÓGICA CLAVE ---
    if (archivoImagen) {
      // Si el usuario seleccionó un archivo nuevo, enviamos el archivo real (binario)
      formData.append('imagen', archivoImagen);
    } else {
      // Si no seleccionó nada (es una edición y mantiene la anterior), enviamos el nombre actual
      formData.append('imagen_actual', datosFormulario.imagen);
    }

    const respuesta = await fetch(url, { method: 'POST', body: formData });
    const resultado = await respuesta.json();

    if (resultado.success) {
      setModalAbierto(false);
      obtenerProductos();
      showNotification('Producto guardado', 'success');
    } else {
      showNotification(resultado.message, 'error');
    }
  } catch (error) {
    console.error('Error al guardar:', error);
  }
};
 
  const abrirModalEdicion = (producto: Producto) => {
    setProductoEditando(producto);
    setDatosFormulario({ ...producto });
    setArchivoImagen(null);
    setModalAbierto(true);
  };

  const abrirModalCreacion = () => {
    setProductoEditando(null);
    setDatosFormulario({ nombre: '', descripcion: '', precio: 0, tipo: 'carta', subtipo: 'carnes', imagen: '' });
    setArchivoImagen(null);
    setModalAbierto(true);
  };

  const manejarCambioImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0];
    if (archivo) {
      setArchivoImagen(archivo);
      const lector = new FileReader();
      lector.onloadend = () => setDatosFormulario({ ...datosFormulario, imagen: lector.result as string });
      lector.readAsDataURL(archivo);
    }
  };

  const productosVisibles = filtroActivo === 'todos' 
    ? listaProductos 
    : listaProductos.filter(p => p.tipo === filtroActivo);

  return (
    <div className="flex-1 bg-[#D3CCBC] min-h-screen p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* CABECERA */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full lg:w-auto">
            <div className="bg-[#30312E] p-6 rounded-3xl shadow-xl w-full">
              <h1 className="text-3xl font-bold text-[#D3CCBC] font-serif">Panel de Control</h1>
              <p className="text-[#D3CCBC]/60 text-xs uppercase tracking-widest mt-1">Gestión Administrativa</p>
            </div>
            
            <div className="flex items-center gap-3 bg-[#E2DBC9] px-5 py-3 rounded-2xl border border-[#30312E]/10 shadow-sm">
              <span className="text-sm font-bold text-[#30312E]">{adminNombre}</span>
              <button onClick={cerrarSesion} className="ml-2 text-red-800 hover:text-red-900 font-bold text-xs bg-red-50 px-4 py-2 rounded-xl transition-all uppercase">
                Cerrar Sesión
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* TOGGLE ESPECIALES SOLO VISIBLE EN VISTA PRODUCTOS */}
            {vistaActual === 'productos' && (
              <div className="flex items-center gap-4 bg-[#E2DBC9] p-4 rounded-3xl shadow-sm border border-[#30312E]/10">
                <span className="text-sm font-bold text-[#30312E] uppercase">Especiales:</span>
                <button
                  onClick={alternarEspeciales}
                  className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors ${mostrarEspeciales ? 'bg-green-600' : 'bg-stone-400'}`}
                >
                  <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform ${mostrarEspeciales ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
            )}

            <button
              onClick={abrirModalCreacion}
              className="bg-[#30312E] text-[#D3CCBC] px-8 py-4 rounded-3xl font-bold hover:bg-[#4a4b46] transition-all shadow-xl flex items-center gap-2"
            >
              <span className="text-2xl">+</span> AÑADIR PRODUCTO
            </button>
          </div>
        </header>

        {/* NAVEGACIÓN DE VISTAS (TABS) */}
        <div className="flex gap-4 mb-8 border-b border-[#30312E]/10 pb-4">
          <button 
            onClick={() => setVistaActual('productos')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${vistaActual === 'productos' ? 'bg-[#30312E] text-[#D3CCBC]' : 'text-[#30312E]/60 hover:bg-white/40'}`}
          >
            Productos
          </button>
          <button 
            onClick={() => setVistaActual('reservas')}
            className={`px-6 py-2 rounded-xl font-bold transition-all ${vistaActual === 'reservas' ? 'bg-[#30312E] text-[#D3CCBC]' : 'text-[#30312E]/60 hover:bg-white/40'}`}
          >
            Reservas
          </button>
        </div>

        {/* CONTENIDO DINÁMICO */}
        {vistaActual === 'productos' ? (
          <>
            {/* FILTROS DE PRODUCTOS */}
            <div className="flex flex-wrap gap-3 mb-10">
              {(['todos', 'carta', 'vinos', 'especial'] as const).map((tipo) => (
                <button
                  key={tipo}
                  onClick={() => setFiltroActivo(tipo)}
                  className={`px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${
                    filtroActivo === tipo ? 'bg-[#30312E] text-[#D3CCBC] shadow-lg' : 'bg-[#E2DBC9] text-[#30312E]/60 hover:bg-white'
                  }`}
                >
                  {tipo === 'todos' ? 'Ver Todo' : tipo}
                </button>
              ))}
            </div>

            {/* GRID DE PRODUCTOS */}
            {cargando ? (
              <div className="text-center py-32 italic">Cargando inventario...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {productosVisibles.map((prod) => (
                  <div key={prod.id_producto} className="bg-[#E2DBC9] rounded-4xl overflow-hidden shadow-lg border border-white/40 group flex flex-col relative">
                    <div className="relative h-56 overflow-hidden">
                      <img src={getImagePath(prod.imagen)} alt={prod.nombre} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      <div className="absolute top-4 right-4 flex flex-col gap-2">
                        <button onClick={() => abrirModalEdicion(prod)} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-[#30312E] hover:text-[#D3CCBC]">✏️</button>
                        <button onClick={() => eliminarProducto(prod.id_producto)} className="w-10 h-10 bg-red-100/90 text-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:text-white">🗑️</button>
                      </div>
                    </div>
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-[#30312E] text-xl font-serif">{prod.nombre}</h3>
                        <span className="bg-[#30312E] text-[#D3CCBC] px-3 py-1 rounded-xl font-bold text-sm">{prod.precio}€</span>
                      </div>
                      <p className="text-xs text-[#30312E]/60 italic mb-6">{prod.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* VISTA DE RESERVAS */
          <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#E2DBC9] p-6 rounded-3xl shadow-sm border border-white/20 flex flex-col md:flex-row items-center gap-6">
              <div className="flex items-center gap-4">
                <span className="font-bold text-[#30312E] uppercase text-sm">Filtrar por día:</span>
                <input 
                  type="date" 
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="bg-[#D3CCBC] border-none px-4 py-2 rounded-xl font-bold text-[#30312E] outline-none ring-2 ring-[#30312E]/10"
                />
              </div>
              <div className="text-stone-500 italic text-sm">
                Mostrando reservas para el {new Date(filtroFecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {cargandoReservas ? (
              <div className="text-center py-20 italic">Buscando mesa...</div>
            ) : listaReservas.length > 0 ? (
              <div className="grid gap-4">
                {listaReservas.map((res: any) => (
                  <div key={res.id_reserva} className="bg-[#E2DBC9] p-6 rounded-3xl shadow-md border hover:border-[#30312E]/30 transition-all flex flex-col md:flex-row justify-between items-center gap-4">
                     <div className="flex items-center gap-6">
                        <div className="bg-[#30312E] text-[#D3CCBC] w-16 h-16 rounded-2xl flex flex-col items-center justify-center shadow-lg">
                          <span className="text-xs font-bold opacity-60">HORA</span>
                          <span className="text-xl font-black">{res.hora.substring(0, 5)}</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-[#30312E] font-serif">{res.nombre_cliente}</h4>
                          <p className="text-stone-500 font-medium">📞 {res.telefono}</p>
                        </div>
                     </div>
                     
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-8">
                           <div className="text-center">
                             <span className="block text-[10px] font-black text-stone-400 uppercase tracking-widest">Comensales</span>
                             <span className="text-2xl font-bold text-[#30312E]">{res.personas} pers.</span>
                           </div>
                           {res.mensaje && (
                             <div className="max-w-[200px] text-xs italic text-stone-500 bg-white/30 p-3 rounded-xl">
                               "{res.mensaje}"
                             </div>
                           )}
                        </div>
                        
                        <div className="flex gap-2">
                           <button onClick={() => abrirModalReserva(res)} className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:bg-[#30312E] hover:text-[#D3CCBC] transition-all border border-[#30312E]/10">✏️</button>
                           <button onClick={() => eliminarReserva(res.id_reserva)} className="w-10 h-10 bg-red-100/90 text-red-600 rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 hover:text-white transition-all border border-red-200">🗑️</button>
                        </div>
                      </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/10 rounded-[3rem] py-20 text-center border-2 border-dashed border-white/20">
                 <p className="text-2xl text-stone-400 italic font-serif">No hay reservas para este día aún.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-[#E2DBC9] rounded-3xl w-full max-w-lg shadow-2xl p-6">
              <h2 className="text-xl font-bold mb-4 font-serif">{productoEditando ? 'Editar' : 'Nuevo'} Producto</h2>
              <form onSubmit={guardarCambios} className="space-y-4">
                 <input type="text" placeholder="Nombre" className="w-full p-2 rounded-lg bg-[#D3CCBC]" value={datosFormulario.nombre} onChange={e => setDatosFormulario({...datosFormulario, nombre: e.target.value})} required />
                 <input type="number" placeholder="Precio" className="w-full p-2 rounded-lg bg-[#D3CCBC]" value={datosFormulario.precio} onChange={e => setDatosFormulario({...datosFormulario, precio: parseFloat(e.target.value)})} required />
                 <textarea placeholder="Descripción" className="w-full p-2 rounded-lg bg-[#D3CCBC]" value={datosFormulario.descripcion} onChange={e => setDatosFormulario({...datosFormulario, descripcion: e.target.value})} />
                 
                 <div className="flex gap-4">
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-[#30312E] uppercase mb-1">Tipo</label>
                     <select 
                       className="w-full p-2 rounded-lg bg-[#D3CCBC] font-bold" 
                       value={datosFormulario.tipo} 
                       onChange={e => {
                         const nuevoTipo = e.target.value;
                         const primerSubtipo = subtiposPorTipo[nuevoTipo as keyof typeof subtiposPorTipo][0];
                         setDatosFormulario({...datosFormulario, tipo: nuevoTipo, subtipo: primerSubtipo});
                       }}
                     >
                       <option value="carta">Carta</option>
                       <option value="vinos">Vinos</option>
                       <option value="especial">Especial</option>
                     </select>
                   </div>
                   <div className="flex-1">
                     <label className="block text-xs font-bold text-[#30312E] uppercase mb-1">Subtipo</label>
                     <select 
                       className="w-full p-2 rounded-lg bg-[#D3CCBC] font-bold" 
                       value={datosFormulario.subtipo} 
                       onChange={e => setDatosFormulario({...datosFormulario, subtipo: e.target.value})}
                     >
                       {subtiposPorTipo[datosFormulario.tipo as keyof typeof subtiposPorTipo]?.map(sub => (
                         <option key={sub} value={sub}>{sub.charAt(0).toUpperCase() + sub.slice(1)}</option>
                       ))}
                     </select>
                   </div>
                 </div>

                 <div>
                   <label className="block text-xs font-bold text-[#30312E] uppercase mb-2">Imagen del Producto</label>
                   <div className="flex items-center gap-4">
                     {datosFormulario.imagen && (
                       <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#30312E]/20">
                         <img 
                           src={getImagePath(datosFormulario.imagen)} 
                           alt="Vista previa" 
                           className="w-full h-full object-cover" 
                         />
                       </div>
                     )}
                     <input 
                       type="file" 
                       accept="image/*" 
                       onChange={manejarCambioImagen}
                       className="hidden" 
                       id="input-imagen"
                     />
                     <label 
                       htmlFor="input-imagen" 
                       className="bg-white/50 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer hover:bg-white transition-all border-2 border-dashed border-[#30312E]/20 flex-1 text-center"
                     >
                       {datosFormulario.imagen ? 'Cambiar Imagen' : 'Seleccionar Imagen'}
                     </label>
                   </div>
                 </div>

                 <div className="flex gap-2 pt-4">
                   <button type="button" onClick={() => setModalAbierto(false)} className="flex-1 py-3 bg-stone-400 text-white rounded-xl font-bold">Cancelar</button>
                   <button type="submit" className="flex-1 py-3 bg-[#30312E] text-[#D3CCBC] rounded-xl font-bold shadow-lg hover:bg-[#4a4b46] transition-all">Guardar</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* MODAL RESERVAS */}
      {modalReservaAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
           <div className="bg-[#E2DBC9] rounded-3xl w-full max-w-lg shadow-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold mb-6 font-serif text-[#30312E]">Modificar Reserva</h2>
              <form onSubmit={guardarCambiosReserva} className="space-y-5">
                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Cliente</label>
                     <input type="text" className="w-full p-3 rounded-2xl bg-[#D3CCBC] font-bold border-none outline-none focus:ring-2 focus:ring-[#30312E]/20" value={datosReservaForm.nombre_cliente} onChange={e => setDatosReservaForm({...datosReservaForm, nombre_cliente: e.target.value})} required />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Teléfono</label>
                     <input type="text" minLength={9} maxLength={9} className="w-full p-3 rounded-2xl bg-[#D3CCBC] font-bold border-none outline-none focus:ring-2 focus:ring-[#30312E]/20" value={datosReservaForm.telefono} onChange={e => setDatosReservaForm({...datosReservaForm, telefono: e.target.value})} required />
                   </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4">
                   <div>
                     <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Fecha</label>
                     <input type="date" className="w-full p-3 rounded-2xl bg-[#D3CCBC] font-bold border-none outline-none focus:ring-2 focus:ring-[#30312E]/20 text-sm" value={datosReservaForm.fecha} onChange={e => setDatosReservaForm({...datosReservaForm, fecha: e.target.value})} required />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Hora</label>
                     <input type="time" className="w-full p-3 rounded-2xl bg-[#D3CCBC] font-bold border-none outline-none focus:ring-2 focus:ring-[#30312E]/20 text-sm" value={datosReservaForm.hora} onChange={e => setDatosReservaForm({...datosReservaForm, hora: e.target.value})} required />
                   </div>
                   <div>
                     <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Personas</label>
                     <input type="number" className="w-full p-3 rounded-2xl bg-[#D3CCBC] font-bold border-none outline-none focus:ring-2 focus:ring-[#30312E]/20" value={datosReservaForm.personas} onChange={e => setDatosReservaForm({...datosReservaForm, personas: parseInt(e.target.value)})} required />
                   </div>
                 </div>

                 <div>
                   <label className="block text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1 ml-1">Mensaje/Observaciones</label>
                   <textarea className="w-full p-3 rounded-2xl bg-[#D3CCBC] font-bold border-none outline-none focus:ring-2 focus:ring-[#30312E]/20 h-24" value={datosReservaForm.mensaje} onChange={e => setDatosReservaForm({...datosReservaForm, mensaje: e.target.value})} />
                 </div>

                 <div className="flex gap-3 pt-4">
                   <button type="button" onClick={() => setModalReservaAbierto(false)} className="flex-1 py-4 bg-stone-300 text-stone-700 rounded-3xl font-bold hover:bg-stone-400 transition-all uppercase text-xs tracking-widest">Cancelar</button>
                   <button type="submit" className="flex-1 py-4 bg-[#30312E] text-[#D3CCBC] rounded-3xl font-bold shadow-xl hover:bg-[#4a4b46] transition-all uppercase text-xs tracking-widest">Guardar Cambios</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default PanelAdmin;