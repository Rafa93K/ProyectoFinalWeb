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
      /* 
         CONEXIÓN CON BASE DE DATOS:
         Aquí iría la llamada a tu API PHP para obtener todos los productos.
         Ej: const respuesta = await fetch('http://localhost/proyectoWeb/backend/getProductos.php?tipo=all');
      */

      // Realizamos la petición (sustituir URL por la real en producción)
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
        alert(`Sección de Especiales: ${nuevoEstado ? 'Visible' : 'Oculta'} (Actualizado en BD)`);
      } else {
        alert('Error al actualizar en la base de datos');
      }
    } catch (error) {
      console.error('Error al sincronizar con el servidor:', error);
      alert('Error de conexión');
    }
  };

  /**
   * Lógica para eliminar un producto por su ID
   */
  const eliminarProducto = async (id: number) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este producto permanentemente?')) {
      try {
        /* 
           CONEXIÓN CON BASE DE DATOS:
           Ej: await fetch(`http://localhost/proyectoWeb/backend/eliminarProducto.php?id=${id}`, { method: 'DELETE' });
        */
        console.log('Eliminando producto con ID:', id);

        // Actualizamos la lista local eliminando el producto para efecto inmediato
        setListaProductos(listaProductos.filter(p => p.id_producto !== id));
      } catch (error) {
        console.error('Error al intentar eliminar:', error);
      }
    }
  };

  /**
   * Función que se ejecuta al enviar el formulario (Crear o Editar)
   */
  const guardarCambios = async (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue
    try {
      if (productoEditando) {
        /* 
           MODIFICAR PRODUCTO EXISTENTE:
           Aquí harías un POST a tu backend con los datos actualizados y el ID.
        */
        console.log('Actualizando producto con ID:', productoEditando.id_producto, datosFormulario);
      } else {
        /* 
           CREAR NUEVO PRODUCTO:
           Aquí harías un POST a tu backend para insertar el nuevo producto.
        */
        console.log('Insertando nuevo producto:', datosFormulario);
      }

      setModalAbierto(false); // Cerramos el modal
      setProductoEditando(null); // Limpiamos el producto en edición
      obtenerProductos(); // Refrescamos la tabla con los datos del servidor
    } catch (error) {
      console.error('Error al guardar cambios:', error);
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
    const archivo = e.target.files?.[0]; // Obtenemos el primer archivo seleccionado
    if (archivo) {
      const lector = new FileReader(); // Objeto para leer archivos
      lector.onloadend = () => {
        // Guardamos el contenido de la imagen en base64 para la previsualización
        setDatosFormulario({ ...datosFormulario, imagen: lector.result as string });
      };
      lector.readAsDataURL(archivo); // Iniciamos la lectura
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

        {/* LISTADO DE PRODUCTOS */}
        {cargando ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
             <div className="w-12 h-12 border-4 border-[#30312E]/20 border-t-[#30312E] rounded-full animate-spin"></div>
             <p className="text-[#30312E] font-serif italic text-xl">Cargando inventario...</p>
          </div>
        ) : (
          <div className="bg-[#E2DBC9] rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#30312E] text-[#D3CCBC]">
                    <th className="px-8 py-6 font-bold uppercase text-xs tracking-widest">Plato / Descripción</th>
                    <th className="px-8 py-6 font-bold uppercase text-xs tracking-widest">Categorización</th>
                    <th className="px-8 py-6 font-bold uppercase text-xs tracking-widest">Precio</th>
                    <th className="px-8 py-6 font-bold uppercase text-xs tracking-widest text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30312E]/5">
                  {listaProductos.length > 0 ? (
                    listaProductos.map((prod) => (
                      <tr key={prod.id_producto} className="hover:bg-white/30 transition-colors group">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="relative">
                              <img
                                src={prod.imagen || '/Img/default.jpg'}
                                alt={prod.nombre}
                                className="w-16 h-16 rounded-2xl object-cover shadow-lg border-2 border-white/50 group-hover:scale-110 transition-transform duration-300"
                              />
                              {prod.tipo === 'especial' && (
                                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-[10px] font-black px-2 py-1 rounded-full shadow-md animate-pulse">🌟</span>
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-[#30312E] text-lg font-serif">{prod.nombre}</div>
                              <div className="text-xs text-[#30312E]/60 mt-1 max-w-[300px] line-clamp-2 md:line-clamp-none">{prod.descripcion}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="px-3 py-1 bg-[#30312E] text-[#D3CCBC] rounded-lg text-[10px] font-black uppercase tracking-wider w-fit">{prod.tipo}</span>
                            <span className="text-xs font-bold text-[#30312E]/40 italic ml-1">{prod.subtipo}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-xl font-bold text-[#30312E]">{prod.precio}<small className="text-sm ml-0.5">€</small></span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => abrirModalEdicion(prod)}
                              className="w-12 h-12 flex items-center justify-center bg-white/50 text-[#30312E] hover:bg-[#30312E] hover:text-[#D3CCBC] rounded-2xl transition-all shadow-sm border border-white/80"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => eliminarProducto(prod.id_producto)}
                              className="w-12 h-12 flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all shadow-sm border border-red-100"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-8 py-20 text-center text-[#30312E]/40 italic font-serif text-xl">
                        No hay productos registrados en esta sección.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
