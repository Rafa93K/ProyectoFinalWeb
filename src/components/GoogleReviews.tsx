import { useEffect } from 'react';

export const GoogleReviews = () => {
  useEffect(() => {
    // Esto carga el script de Elfsight solo cuando el componente se monta
    const script = document.createElement('script');
    script.src = "https://elfsightcdn.com/platform.js";
    script.async = true;
    document.body.appendChild(script);

    // Limpieza al desmontar el componente
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section className="py-12 bg-[#D3CCBC]/10">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-[#30312E] mb-8 text-center">
          Opiniones de nuestros clientes
        </h2>
        {/* Este es el div que Elfsight usará para renderizar el widget */}
        <div 
          className="elfsight-app-870b40ef-01a4-437c-9d17-4bde259880a2" 
          data-elfsight-app-lazy
        ></div>
      </div>
    </section>
  );
};