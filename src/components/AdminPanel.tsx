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
    navegar('/admin/login');
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
    <div className="flex-1 bg-stone-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* CABECERA DEL PANEL */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold text-stone-800">Panel de Control Admin</h1>
              <p className="text-stone-500">Gestión de inventario y visibilidad de la carta</p>
            </div>
            <div className="flex items-center gap-3 bg-stone-200/50 px-4 py-2 rounded-2xl border border-stone-300">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Sesión:</span>
              <span className="text-sm font-bold text-stone-800">{adminNombre}</span>
              <button
                onClick={cerrarSesion}
                className="ml-2 text-red-600 hover:text-red-700 font-bold text-xs bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition-all"
              >
                Salir 🚪
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* CONTROL DE ESPECIALES (TOGGLE) */}
            <div className="flex items-center gap-3 bg-white p-3 rounded-2xl shadow-sm border border-stone-200">
              <span className="text-sm font-semibold text-stone-600">Especiales:</span>
              <button
                onClick={alternarEspeciales}
                className={`w-14 h-7 flex items-center rounded-full p-1 transition-colors duration-300 ${mostrarEspeciales ? 'bg-green-500' : 'bg-stone-300'}`}
              >
                <div className={`bg-white w-5 h-5 rounded-full shadow-md transform transition-transform duration-300 ${mostrarEspeciales ? 'translate-x-7' : 'translate-x-0'}`} />
              </button>
            </div>

            <button
              onClick={abrirModalCreacion}
              className="bg-stone-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-700 transition-all shadow-md flex items-center gap-2"
            >
              <span className="text-xl">+</span> Añadir Producto
            </button>
          </div>
        </header>

        {/* LISTADO DE PRODUCTOS */}
        {cargando ? (
          <div className="flex justify-center py-20 text-stone-800 italic">Cargando productos...</div>
        ) : (
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-stone-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="px-6 py-4 text-stone-600 font-bold uppercase text-xs">Producto</th>
                    <th className="px-6 py-4 text-stone-600 font-bold uppercase text-xs">Tipo / Subtipo</th>
                    <th className="px-6 py-4 text-stone-600 font-bold uppercase text-xs">Precio</th>
                    <th className="px-6 py-4 text-stone-600 font-bold uppercase text-xs text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {listaProductos.map((prod) => (
                    <tr key={prod.id_producto} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={prod.imagen || '/Img/default.jpg'}
                            alt={prod.nombre}
                            className="w-12 h-12 rounded-lg object-cover border border-stone-100"
                          />
                          <div>
                            <div className="font-bold text-stone-800">{prod.nombre}</div>
                            <div className="text-xs text-stone-400 truncate max-w-[200px]">{prod.descripcion}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-stone-600">
                        <span className="px-2 py-1 bg-stone-100 rounded text-xs font-semibold mr-2 capitalize">{prod.tipo}</span>
                        <span className="text-xs italic capitalize">{prod.subtipo}</span>
                      </td>
                      <td className="px-6 py-4 font-bold text-stone-800">{prod.precio}€</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => abrirModalEdicion(prod)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => eliminarProducto(prod.id_producto)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
