import React, { useState, useEffect } from 'react';

interface Producto {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  tipo: string;
  subtipo: string;
  imagen: string;
}

const Carta: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'carta' | 'vinos' | 'especial'>('carta');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarEspeciales, setMostrarEspeciales] = useState(true);

  useEffect(() => {
    fetchProductos(activeTab);
    fetchConfig();
  }, [activeTab]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('https://rafa.cicloflorenciopintado.es/getAdminConfig.php');
      const data = await response.json();
      if (data.success) {
        setMostrarEspeciales(data.especials === 1 || data.especials === true);
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const fetchProductos = async (tipo: string) => {
    setLoading(true);
    try {
      const response = await fetch(`https://rafa.cicloflorenciopintado.es/getProductos.php?tipo=${tipo}`);
      const data = await response.json();
      console.log('Productos cargados:', data);
      setProductos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching productos:', error);
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para obtener la ruta correcta de la imagen
  const getImagePath = (imagen: string) => {
    if (!imagen) return '/Img/default.jpg';
    // Si ya es una URL completa, la dejamos tal cual
    if (imagen.startsWith('https')) return imagen;
    
    return `https://rafa.cicloflorenciopintado.es/Img/${imagen}`;
  };

  const groupByType = () => {
    if (activeTab === 'especial') return { 'Nuestros Especiales': productos };
    
    const groups: { [key: string]: Producto[] } = {};
    productos.forEach(p => {
      const groupName = p.subtipo || 'General';
      if (!groups[groupName]) groups[groupName] = [];
      groups[groupName].push(p);
    });
    return groups;
  };

  const groupedProductos = groupByType();

  return (
    <div className="flex-1 bg-[#D3CCBC] py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold text-[#30312E] text-center mb-12 font-serif">Nuestra Selección</h1>
        
        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-16">
          {(['carta', 'vinos', 'especial'] as const)
            .filter(tab => {
              if (tab === 'especial') {
                return mostrarEspeciales;
              }
              return true;
            })
            .map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-md ${
                activeTab === tab 
                ? 'bg-[#30312E] text-[#D3CCBC]' 
                : 'bg-white/50 text-[#30312E] hover:bg-white'
              }`}
            >
              {tab.charAt(0) + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#30312E]"></div>
          </div>
        ) : Object.keys(groupedProductos).length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl text-[#30312E]/60 italic">No se han encontrado productos en esta categoría.</p>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(groupedProductos).map(([subtipo, items]) => (
              <div key={subtipo} className="animate-fadeIn">
                <h2 className="text-3xl font-serif font-bold text-[#30312E] mb-8 border-b-2 border-[#30312E]/20 pb-2 capitalize">
                  {subtipo}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {items.map((item) => (
                    <div key={item.id_producto} className="flex gap-4 md:gap-6 bg-white/40 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 overflow-hidden rounded-xl bg-white/20">
                        <img 
                          src={getImagePath(item.imagen)} 
                          alt={item.nombre} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                              (e.target as HTMLImageElement).src = '/Img/default.jpg';
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-[#30312E] leading-tight">{item.nombre}</h3>
                          <span className="text-lg font-bold text-[#30312E] ml-4">
                            {typeof item.precio === 'string' ? parseFloat(item.precio).toFixed(2) : item.precio}€
                          </span>
                        </div>
                        <p className="text-[#30312E]/70 text-sm md:text-base leading-relaxed">
                          {item.descripcion}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
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
