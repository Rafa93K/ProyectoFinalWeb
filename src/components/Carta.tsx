import React, { useState, useEffect } from 'react';

// Interfaz para definir la estructura de un producto
interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: string;
  subtipo: string;
  imagen: string;
  total_votos?: number;
  media_votos?: number;
  mi_puntuacion?: number | null;
}

const Carta: React.FC = () => {
  // --- Estados de la aplicación ---
  const [pestanaActiva, setPestanaActiva] = useState<'Carta' | 'Vinos' | 'Especial'>('Carta');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarEspeciales, setMostrarEspeciales] = useState(true);
  const [usuario, setUsuario] = useState<{ id_usuario: string, nombre: string } | null>(null);
  const [mostrarBotonArriba, setMostrarBotonArriba] = useState(false);

  // --- Efectos ---
  useEffect(() => {
    // Recuperar sesión del usuario desde el almacenamiento local
    const sesionRaw = localStorage.getItem('usuarioSesion');
    let userId = null;
    if (sesionRaw) {
      try {
        const u = JSON.parse(sesionRaw);
        setUsuario(u);
        userId = u.id_usuario;
      } catch (e) {
        console.error('Error al parsear sesión');
      }
    }
    
    // Cargar productos y configuración inicial
    obtenerProductos(pestanaActiva, userId);
    obtenerConfiguracion();

    // Gestor de desplazamiento para mostrar/ocultar el botón de "subir"
    const manejarDesplazamiento = () => {
      setMostrarBotonArriba(window.scrollY > 400);
    };

    window.addEventListener('scroll', manejarDesplazamiento);
    return () => window.removeEventListener('scroll', manejarDesplazamiento);
  }, [pestanaActiva]);

  // --- Funciones de utilidad ---

  // Desplaza la ventana hacia la parte superior suavemente
  const irHaciaArriba = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Obtiene la configuración del administrador (ej. si se muestran los especiales)
  const obtenerConfiguracion = async () => {
    try {
      const respuesta = await fetch('https://rafa.cicloflorenciopintado.es/getAdminConfig.php');
      const datos = await respuesta.json();
      if (datos.success) {
        setMostrarEspeciales(datos.especials === 1 || datos.especials === true);
      }
    } catch (error) {
      console.error('Error al obtener la configuración:', error);
    }
  };

  // Obtiene la lista de productos según el tipo seleccionado
  const obtenerProductos = async (tipo: string, userId?: string | null, mostrarCarga: boolean = true) => {
    if (mostrarCarga) setCargando(true);
    try {
      const id_u = userId || usuario?.id_usuario || '';
      const url = `https://rafa.cicloflorenciopintado.es/getProductos.php?tipo=${tipo}${id_u ? `&id_usuario=${id_u}` : ''}`;
      const respuesta = await fetch(url);
      const datos = await respuesta.json();
      setProductos(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      setProductos([]);
    } finally {
      if (mostrarCarga) setCargando(false);
    }
  };

  // Maneja la votación de un producto por parte del usuario
  const manejarVoto = async (id_producto: number, puntuacion: number) => {
    if (!usuario) {
      alert('Debes iniciar sesión para puntuar');
      return;
    }

    if (!usuario.id_usuario) {
      alert('Tu sesión no tiene un ID de usuario válido. Por favor, cierra sesión y vuelve a entrar.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('id_usuario', usuario.id_usuario);
      formData.append('id_producto', id_producto.toString());
      formData.append('puntuacion', puntuacion.toString());

      const respuesta = await fetch('https://rafa.cicloflorenciopintado.es/votar.php', {
        method: 'POST',
        body: formData
      });
      
      const datos = await respuesta.json();
      
      if (datos.success) {
        // Recargar productos silenciosamente para actualizar las medias de votos
        obtenerProductos(pestanaActiva, null, false);
      }
    } catch (error) {
      console.error('Error al votar:', error);
    }
  };

  // Construye la URL completa de la imagen del producto
  const obtenerRutaImagen = (imagen: string) => {
    if (!imagen) return '/Img/default.jpg';
    if (imagen.startsWith('https')) return imagen;

    return `https://rafa.cicloflorenciopintado.es/Img/${imagen}`;
  };

  // Agrupa los productos por su subtipo (ej. entrantes, carnes, etc.)
  const agruparPorTipo = () => {
    if (pestanaActiva === 'Especial') return { 'Nuestros Especiales': productos };

    const grupos: { [key: string]: Producto[] } = {};
    productos.forEach(p => {
      const nombreGrupo = p.subtipo || 'General';
      if (!grupos[nombreGrupo]) grupos[nombreGrupo] = [];
      grupos[nombreGrupo].push(p);
    });
    return grupos;
  };

  const productosAgrupados = agruparPorTipo();

  return (
    <div className="flex-1 bg-[#D3CCBC] py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-[#30312E] text-center mb-12 font-serif">Nuestra Selección</h1>

        {/* --- Pestañas de Navegación --- */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-12 md:mb-16">
          {(['Carta', 'Vinos', 'Especial'] as const)
            .filter(tab => tab !== 'Especial' || mostrarEspeciales)
            .map((tab) => (
              <button
                key={tab}
                onClick={() => setPestanaActiva(tab)}
                className={`px-6 py-2 md:px-8 md:py-3 rounded-full font-bold text-lg md:text-xl transition-all duration-300 transform hover:scale-105 shadow-md ${pestanaActiva === tab
                  ? 'bg-[#30312E] text-[#D3CCBC]'
                  : 'bg-white/50 text-[#30312E] hover:bg-white'
                  }`}
              >
                {tab}
              </button>
            ))}
        </div>

        {/* --- Contenido Principal --- */}
        {cargando ? (
          // Indicador de carga
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#30312E]"></div>
          </div>
        ) : Object.keys(productosAgrupados).length === 0 ? (
          // Mensaje cuando no hay resultados
          <div className="text-center py-20">
            <p className="text-2xl text-[#30312E]/60 italic">No se han encontrado productos en esta categoría.</p>
          </div>
        ) : (
          // Listado de productos agrupados
          <div className="space-y-16">
            {Object.entries(productosAgrupados).map(([subtipo, items]) => (
              <div key={subtipo} className="animate-fadeIn">
                <h2 className="text-3xl font-serif font-bold text-[#30312E] mb-8 border-b-2 border-[#30312E]/20 pb-2 capitalize">
                  {subtipo}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {items.map((item) => (
                    <div key={item.id_producto} className="flex gap-4 bg-white/40 p-4 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all group overflow-hidden">
                      {/* Imagen del producto */}
                      <div className="w-20 h-20 md:w-32 md:h-32 shrink-0 overflow-hidden rounded-xl bg-white/20">
                        <img
                          src={obtenerRutaImagen(item.imagen)}
                          alt={item.nombre}
                          className="w-full h-full object-cover"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/Img/default.jpg'; }}
                        />
                      </div>
                      {/* Información del producto */}
                      <div className="flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-[#30312E] leading-tight">{item.nombre}</h3>
                          <span className="text-lg font-bold text-[#30312E] ml-4">
                            {typeof item.precio === 'string' ? parseFloat(item.precio).toFixed(2) : item.precio}€
                          </span>
                        </div>
                        <p className="text-[#30312E]/70 text-xs md:text-sm leading-relaxed mb-4 line-clamp-2 md:line-clamp-none">
                          {item.descripcion}
                        </p>
                        
                        {/* Sección de Puntuación (Estrellas) */}
                        <div className="mt-auto flex flex-col md:flex-row md:items-center justify-between gap-2 border-t border-[#30312E]/5 pt-3">
                          <div className="flex items-center gap-1.5">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((estrella) => (
                                <button
                                  key={estrella}
                                  onClick={() => manejarVoto(item.id_producto, estrella)}
                                  disabled={!usuario}
                                  className={`text-lg md:text-xl transition-all duration-200 transform ${
                                    usuario ? 'hover:scale-125 active:scale-95' : 'cursor-default'
                                  } ${
                                    (item.mi_puntuacion && estrella <= (item.mi_puntuacion as number))
                                    ? 'text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.3)]'
                                    : 'text-stone-300'
                                  }`}
                                  title={usuario ? `Puntuar con ${estrella} estrellas` : 'Inicia sesión para puntuar'}
                                >
                                  ★
                                </button>
                              ))}
                            </div>
                            <span className="text-[10px] md:text-xs font-bold text-[#30312E]/50 uppercase tracking-widest ml-1">
                              {item.media_votos || '0.0'} ({item.total_votos || 0})
                            </span>
                          </div>
                          
                          {!usuario && (
                            <span className="text-[9px] uppercase tracking-tighter font-bold text-[#30312E]/30">Accede para puntuar</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- Botón Flotante para Volver Arriba --- */}
      <button
        onClick={irHaciaArriba}
        className={`fixed bottom-8 right-8 z-50 p-4 rounded-full bg-[#30312E] text-[#D3CCBC] shadow-2xl transition-all duration-500 transform hover:scale-110 hover:bg-[#4a4b46] active:scale-95 ${
          mostrarBotonArriba ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
        aria-label="Volver arriba"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 md:h-8 md:w-8" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Estilos específicos para animaciones */}
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

export default Carta;
