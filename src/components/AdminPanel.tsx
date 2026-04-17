import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const [listaProductos, setListaProductos] = useState<Producto[]>([]); // Almacena los productos de la BD
  const [cargando, setCargando] = useState(true); // Controla el indicador de carga
  const [mostrarEspeciales, setMostrarEspeciales] = useState(true); // Estado del toggle de especiales
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null); // Producto que se está editando
  const [modalAbierto, setModalAbierto] = useState(false); // Controla la visibilidad del modal

  // Estado que almacena los valores actuales del formulario
  const [datosFormulario, setDatosFormulario] = useState<Omit<Producto, 'id_producto'>>({
    nombre: '',
    descripcion: '',
    precio: 0,
    tipo: 'carta',
    subtipo: 'carnes',
    imagen: ''
  });

  /**
   * Efecto inicial al montar el componente
   */
  useEffect(() => {
    // Verificar si hay sesión de admin
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

  /**
   * Obtiene la configuración del administrador (visualización de especiales)
   */
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

  /**
   * Función para obtener todos los productos del servidor
   */
  const obtenerProductos = async () => {
    setCargando(true);
    try {
      
      const respuesta = await fetch('https://rafa.cicloflorenciopintado.es/getProductos.php?tipo=all');
      const datos = await respuesta.json();
      setListaProductos(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    } finally {
      setCargando(false); // Quitamos el spinner de carga
    }
  };

  /**
   * Maneja el interruptor para ocultar/mostrar especiales en la carta
   */
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

      if (resultado.success) {
        setMostrarEspeciales(nuevoEstado);
      } else {
        alert('Error al actualizar en la base de datos');
      }
    } catch (error) {
      console.error('Error al sincronizar con el servidor');
    }
  };

  /**
   * Lógica para eliminar un producto por su ID
   */
  const eliminarProducto = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) {
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
        } else {
          alert(resultado.message || 'Error al eliminar el producto');
        }
      } catch (error) {
        console.error('Error al intentar eliminar');
        alert('Error de conexión al eliminar');
      }
    }
  };

  /**
   * Función que se ejecuta al enviar el formulario (Crear o Editar)
   */
  const guardarCambios = async (e: React.SubmitEvent) => {
    e.preventDefault(); 
    try {
      // Determinamos el script a llamar según si estamos editando o creando
      const url = productoEditando 
        ? 'https://rafa.cicloflorenciopintado.es/actualizarProducto.php' 
        : 'https://rafa.cicloflorenciopintado.es/insertarProducto.php';

      const formData = new FormData();
      
      // Si editamos, necesitamos enviar el ID
      if (productoEditando) {
        formData.append('id_producto', productoEditando.id_producto.toString());
      }

      formData.append('nombre', datosFormulario.nombre);
      formData.append('descripcion', datosFormulario.descripcion);
      formData.append('precio', datosFormulario.precio.toString());
      formData.append('tipo', datosFormulario.tipo);
      formData.append('subtipo', datosFormulario.subtipo);
      formData.append('imagen', datosFormulario.imagen); // Enviamos el Base64 o URL

      const respuesta = await fetch(url, {
        method: 'POST',
        body: formData
      });

      const resultado = await respuesta.json();

      if (resultado.success) {
        setModalAbierto(false); 
        setProductoEditando(null); 
        obtenerProductos(); // Recargamos la lista desde el servidor
      } else {
        alert(resultado.message || 'Error al guardar los cambios');
      }
    } catch (error) {
      console.error('Error al guardar cambios:', error);
      alert('Error de conexión al servidor');
    }
  };

  /**
   * Prepara el modal con los datos de un producto existente para editarlo
   */
  const abrirModalEdicion = (producto: Producto) => {
    setProductoEditando(producto);
    setDatosFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      precio: producto.precio,
      tipo: producto.tipo,
      subtipo: producto.subtipo,
      imagen: producto.imagen
    });
    setModalAbierto(true);
  };

  /**
   * Prepara el modal con valores vacíos para crear un producto nuevo
   */
  const abrirModalCreacion = () => {
    setProductoEditando(null);
    setDatosFormulario({
      nombre: '',
      descripcion: '',
      precio: 0,
      tipo: 'carta',
      subtipo: 'carnes',
      imagen: ''
    });
    setModalAbierto(true);
  };

  /**
   * Gestiona la selección de archivos de imagen y genera la previsualización
   */
  const manejarCambioImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]; 
    if (archivo) {
      const lector = new FileReader(); 
      lector.onloadend = () => {
        setDatosFormulario({ ...datosFormulario, imagen: lector.result as string });
      };
      lector.readAsDataURL(archivo); 
    }
  };

  /**
   * Genera las opciones del selector de subcategoría dependiendo de la categoría principal
   */
  const obtenerOpcionesSubtipo = () => {
    if (datosFormulario.tipo === 'carta') {
      return (
        <>
          <option value="carnes">Carnes</option>
          <option value="pescados">Pescados</option>
          <option value="pastas">Pastas</option>
          <option value="postres">Postres</option>
        </>
      );
    } else if (datosFormulario.tipo === 'vinos') {
      return (
        <>
          <option value="tinto">Tinto</option>
          <option value="blanco">Blanco</option>
          <option value="espumoso">Espumoso</option>
        </>
      );
    }
    return <option value="">No requiere subcategoría</option>;
  };

  return (
    <div className="flex-1 bg-[#D3CCBC] min-h-screen p-4 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* CABECERA DEL PANEL */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10 gap-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 w-full lg:w-auto">
            <div className="bg-[#30312E] p-6 rounded-3xl shadow-xl w-full">
              <h1 className="text-3xl font-bold text-[#D3CCBC] font-serif ">Panel de Control</h1>
              <p className="text-[#D3CCBC]/60 text-xs uppercase tracking-widest mt-1">Gestión Administrativa</p>
            </div>
            
            <div className="flex items-center gap-3 bg-[#E2DBC9] px-5 py-3 rounded-2xl border border-[#30312E]/10 shadow-sm">
              <span className="text-xs font-bold text-[#30312E]/50 uppercase tracking-widest">Sesión:</span>
              <span className="text-sm font-bold text-[#30312E]">{adminNombre}</span>
              <button
                onClick={cerrarSesion}
                className="ml-2 text-red-800 hover:text-red-900 font-bold text-xs bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl border border-red-200 transition-all uppercase tracking-tighter"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            {/* CONTROL DE ESPECIALES (TOGGLE) */}
            <div className="flex-1 md:flex-none flex items-center justify-between gap-4 bg-[#E2DBC9] p-4 rounded-3xl shadow-sm border border-[#30312E]/10">
              <span className="text-sm font-bold text-[#30312E] uppercase tracking-tight">Mostrar Especiales:</span>
              <button
                onClick={alternarEspeciales}
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${mostrarEspeciales ? 'bg-green-600' : 'bg-stone-400'}`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${mostrarEspeciales ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>

            <button
              onClick={abrirModalCreacion}
              className="flex-1 md:flex-none bg-[#30312E] text-[#D3CCBC] px-8 py-4 rounded-3xl font-bold hover:bg-[#4a4b46] transition-all shadow-xl flex items-center justify-center gap-2 transform active:scale-95"
            >
              <span className="text-2xl">+</span> AÑADIR PRODUCTO
            </button>
          </div>
        </header>

        {/* LISTADO DE PRODUCTOS (VISTA DE REJILLA) */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="w-12 h-12 border-4 border-[#30312E]/20 border-t-[#30312E] rounded-full animate-spin"></div>
             <p className="text-[#30312E] font-serif italic text-xl">Cargando inventario...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {listaProductos.length > 0 ? (
              listaProductos.map((prod) => (
                <div key={prod.id_producto} className="bg-[#E2DBC9] rounded-4xl overflow-hidden shadow-lg border border-white/40 hover:shadow-2xl transition-all group flex flex-col relative">
                  {/* IMAGEN Y ACCIONES RÁPIDAS */}
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={prod.imagen || '/Img/default.jpg'}
                      alt={prod.nombre}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-[#30312E]/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Botones Flotantes */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 transform translate-x-12 group-hover:translate-x-0 transition-transform duration-300">
                      <button
                        onClick={() => abrirModalEdicion(prod)}
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-[#30312E] hover:text-[#D3CCBC] transition-all"
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => eliminarProducto(prod.id_producto)}
                        className="w-10 h-10 bg-red-100/90 backdrop-blur-sm text-red-600 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:text-white transition-all underline-none"
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Badge de Tipo */}
                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 bg-[#30312E] text-[#D3CCBC] rounded-full text-[10px] font-black uppercase tracking-widest shadow-md">
                        {prod.tipo}
                      </span>
                    </div>
                  </div>

                  {/* INFO DEL PRODUCTO */}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <h3 className="font-bold text-[#30312E] text-xl font-serif leading-tight line-clamp-2">{prod.nombre}</h3>
                      <span className="bg-[#30312E] text-[#D3CCBC] px-3 py-1 rounded-xl font-bold text-sm whitespace-nowrap shadow-sm">
                        {prod.precio}€
                      </span>
                    </div>
                    
                    <p className="text-xs text-[#30312E]/60 mb-6 flex-1 italic line-clamp-3">
                      "{prod.descripcion}"
                    </p>

                    <div className="flex items-center justify-between border-t border-[#30312E]/10 pt-4 mt-auto">
                      <span className="text-[10px] font-black text-[#30312E]/30 uppercase tracking-[0.2em]">
                        {prod.subtipo || 'S/C'}
                      </span>
                      <div className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-[9px] font-bold text-green-700 uppercase">Activo</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full bg-white/10 rounded-[3rem] py-20 text-center border-2 border-dashed border-white/20">
                <span className="text-5xl block mb-6 opacity-30">🍽️</span>
                <p className="text-[#30312E]/40 italic font-serif text-2xl">
                  No hay productos registrados en esta sección.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL EMERGENTE FORMULARIO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#E2DBC9] rounded-3xl w-full max-w-lg shadow-2xl animate-modalEnter origin-center max-h-[90vh] flex flex-col border border-white/20">
            <div className="p-5 border-b border-stone-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-stone-800 font-serif">
                {productoEditando ? 'Modificar Plato' : 'Nuevo Registro'}
              </h2>
              <button onClick={() => setModalAbierto(false)} className="text-stone-400 hover:text-stone-600 text-2xl">×</button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={guardarCambios} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Nombre del Plato</label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none transition-all text-sm bg-[#D4CDBC]"
                      value={datosFormulario.nombre}
                      onChange={(e) => setDatosFormulario({ ...datosFormulario, nombre: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Precio (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none transition-all text-sm bg-[#D4CDBC]"
                      value={datosFormulario.precio}
                      onChange={(e) => setDatosFormulario({ ...datosFormulario, precio: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Descripción de Ingredientes</label>
                  <textarea
                    className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none transition-all h-20 resize-none text-sm bg-[#D4CDBC]"
                    value={datosFormulario.descripcion}
                    onChange={(e) => setDatosFormulario({ ...datosFormulario, descripcion: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Categoría Principal</label>
                    <select
                      className="w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none transition-all text-sm bg-[#D4CDBC]"
                      value={datosFormulario.tipo}
                      onChange={(e) => {
                        const nuevoTipo = e.target.value;
                        let nuevoSubtipo = '';
                        if (nuevoTipo === 'carta') nuevoSubtipo = 'carnes';
                        if (nuevoTipo === 'vinos') nuevoSubtipo = 'tinto';
                        setDatosFormulario({ ...datosFormulario, tipo: nuevoTipo, subtipo: nuevoSubtipo });
                      }}
                    >
                      <option value="carta">Sección Carta</option>
                      <option value="vinos">Bodega Vinos</option>
                      <option value="especial">Plato Especial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Sub-clasificación</label>
                    <select
                      disabled={datosFormulario.tipo === 'especial'}
                      className={`w-full px-3 py-2 rounded-xl border border-stone-200 focus:ring-2 focus:ring-stone-800 outline-none transition-all text-sm bg-[#D4CDBC] ${datosFormulario.tipo === 'especial' ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={datosFormulario.subtipo}
                      onChange={(e) => setDatosFormulario({ ...datosFormulario, subtipo: e.target.value })}
                    >
                      {obtenerOpcionesSubtipo()}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-1 uppercase tracking-wider">Foto del Producto</label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        id="image-upload"
                        onChange={manejarCambioImagen}
                      />
                      <label
                        htmlFor="image-upload"
                        className="flex items-center justify-center w-full h-20 border-2 border-dashed border-stone-300 rounded-xl hover:bg-[#D4CDBC]/50 cursor-pointer transition-all gap-3 bg-[#D4CDBC]/30"
                      >
                        {datosFormulario.imagen ? (
                          <div className="flex items-center gap-2 w-full px-3">
                            <img src={datosFormulario.imagen} className="h-12 w-12 object-cover rounded-lg" alt="Previa" />
                            <span className="text-xs text-stone-500 font-medium truncate">Archivo cargado</span>
                          </div>
                        ) : (
                          <>
                            <span className="text-xl">📁</span>
                            <span className="text-xs text-stone-500 font-semibold">Seleccionar Foto</span>
                          </>
                        )}
                      </label>
                    </div>
                    {datosFormulario.imagen && (
                      <button
                        type="button"
                        onClick={() => setDatosFormulario({ ...datosFormulario, imagen: '' })}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalAbierto(false)}
                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-[#D3CCBC] text-stone-600 hover:bg-stone-300 transition-all text-sm"
                  >
                    Cerrar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 rounded-xl font-bold bg-stone-800 text-white hover:bg-stone-700 transition-all shadow-lg text-sm"
                  >
                    Confirmar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ANIMACIONES CSS */}
      <style>{`
        @keyframes modalEnter {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modalEnter {
          animation: modalEnter 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PanelAdmin;
