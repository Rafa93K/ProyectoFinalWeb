// src/components/Cookies.tsx

export const Cookies = () => {
  return (
    <main className="flex-1 bg-[#D3CCBC] text-[#30312E] py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white/40 p-8 md:p-12 rounded-3xl shadow-xl border border-[#30312E]/10">
        <h1 className="text-4xl font-bold mb-8 italic border-b border-[#30312E]/10 pb-4">Política de Cookies</h1>
        
        <section className="space-y-6 text-lg leading-relaxed font-light">
          <div>
            <h2 className="text-xl font-bold mb-2">1. ¿Qué son las Cookies?</h2>
            <p>Este sitio web utiliza cookies y/o tecnologías similares que almacenan y recuperan información cuando navegas. En general, estas tecnologías pueden servir para finalidades muy diversas, como, por ejemplo, reconocerte como usuario, obtener información sobre tus hábitos de navegación, o personalizar la forma en que se muestra el contenido.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">2. Tipos de Cookies que Utilizamos</h2>
            <ul className="list-disc pl-6 mt-2 space-y-3">
              <li><strong>Cookies técnicas:</strong> Aquellas que permiten al usuario la navegación a través de una página web, plataforma o aplicación y la utilización de las diferentes opciones o servicios que en ella existan.</li>
              <li><strong>Cookies de personalización:</strong> Permiten recordar información para que el usuario acceda al servicio con determinadas características que pueden diferenciar su experiencia de la de otros usuarios.</li>
              <li><strong>Cookies de análisis:</strong> Aquellas que, tratadas por nosotros o por terceros, nos permiten cuantificar el número de usuarios y así realizar la medición y análisis estadístico de la utilización que hacen los usuarios del servicio ofertado.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">3. Configuración y Desactivación</h2>
            <p>Usted puede permitir, bloquear o eliminar las cookies instaladas en su equipo mediante la configuración de las opciones del navegador instalado en su ordenador:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Chrome</li>
              <li>Safari</li>
              <li>Firefox</li>
              <li>Internet Explorer/Edge</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">4. Actualizaciones</h2>
            <p>Es posible que actualicemos la Política de Cookies de nuestro Sitio Web, por ello le recomendamos revisar esta política cada vez que acceda a nuestro Sitio Web con el objetivo de estar adecuadamente informado sobre cómo y para qué usamos las cookies.</p>
          </div>
        </section>
      </div>
    </main>
  );
};
