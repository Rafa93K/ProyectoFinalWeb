// src/components/Conocenos.tsx

export const Conocenos = () => {
  return (
    <main className="flex-1 bg-[#D3CCBC]">
      {/* Hero de la página con imagen de fondo */}
      <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
        <img
          src="/Img/patio.jpg"
          alt="Nuestro Patio"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#30312E]/60 backdrop-blur-[2px]"></div>
        <h1 className="relative text-5xl md:text-7xl font-bold text-[#D3CCBC] italic drop-shadow-2xl">
          Conócenos
        </h1>
      </section>

      {/* Contenido Principal */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div className="space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold text-[#30312E] border-l-4 border-[#30312E] pl-6">
              Gastro-Bar Fogón
            </h2>
            <p className="text-xl text-[#30312E]/90 leading-relaxed font-light">
              Tradición, sabor y calidad desde <span className="font-bold">2019</span>.
              Te invitamos a nuestro rincón gastronómico, donde la cocina casera y los
              productos frescos de proximidad son los verdaderos protagonistas.
            </p>
            <div className="rounded-2xl overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <img src="/Img/patio2.jpg" alt="Detalle Patio" className="w-full h-64 object-cover" />
            </div>
          </div>

          {/* Bloque Horario */}
          <div className="bg-[#30312E] text-[#D3CCBC] p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Decoración sutil */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#D3CCBC]/10 rounded-full"></div>

            <h3 className="text-2xl font-bold mb-8 border-b border-[#D3CCBC]/20 pb-4 flex items-center gap-3">
              <span className="text-3xl">🕒</span> Horario de Experiencias
            </h3>
            <div className="space-y-4 text-lg">
              <div className="flex justify-between border-b border-[#D3CCBC]/10 pb-2">
                <span>Lunes, Miércoles, Jueves</span>
                <span className="font-bold">13:30 - 16:00</span>
              </div>
              <div className="flex justify-between border-b border-[#D3CCBC]/10 pb-2 text-red-400">
                <span>Martes</span>
                <span className="font-bold uppercase tracking-widest">Cerrado</span>
              </div>
              <div className="flex justify-between border-b border-[#D3CCBC]/10 pb-2">
                <span>Viernes y Sábados</span>
                <div className="text-right">
                  <p>13:30 - 16:00</p>
                  <p>20:30 - 23:00</p>
                </div>
              </div>
              <div className="flex justify-between border-b border-[#D3CCBC]/10 pb-2">
                <span>Domingo</span>
                <span className="font-bold">13:30 - 16:00</span>
              </div>
              {/* Teléfono mejorado */}
              <div className="relative group bg-[#D3CCBC]/5 p-3 rounded-2xl border border-[#D3CCBC]/20 text-center transition-all ">
                <p className="text-sm uppercase tracking-widest opacity-60 mb-0">Teléfono de Contacto</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <svg
                    xmlns="http://w3.org"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                  <span className="text-2xl font-medium">957 94 11 14</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sección Mapa - Full Width dentro del contenedor */}
        <div className="space-y-8 text-center">
          <h2 className="text-3xl font-bold text-[#30312E]">¿Dónde encontrarnos?</h2>
          <p className="text-lg text-[#30312E]/80 m-0 mb-4">C. Peñas Rojas, 80, 14200 Peñarroya-Pueblonuevo, Córdoba</p>
          <div className="w-full h-[400px] overflow-hidden relative">
            {/* El contenedor corta lo que sobresale */}
            <iframe
              src="https://www.google.com/maps/d/embed?mid=1cmzj9sj2tEzT3Rx8O0gMnGjH4AnpWzc&ehbc=2E312F&noprof=1"
              className="absolute top-[-60px] left-0 w-full h-[calc(100%+50px)] grayscale-[0.3] border-0"
              title="Ubicación Fogón"
            ></iframe>
          </div>
          <p className="text-2xl text-[#30312E] font-semibold italic mt-8 tracking-wide drop-shadow-sm">"Te esperamos con las brasas encendidas."</p>
        </div>
      </section>

    </main>
  );
};
