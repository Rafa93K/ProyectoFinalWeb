// src/components/Privacidad.tsx

export const Privacidad = () => {
  return (
    <main className="flex-1 bg-[#D3CCBC] text-[#30312E] py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white/40 p-8 md:p-12 rounded-3xl shadow-xl border border-[#30312E]/10">
        <h1 className="text-4xl font-bold mb-8 italic border-b border-[#30312E]/10 pb-4">Política de Privacidad</h1>
        
        <section className="space-y-6 text-lg leading-relaxed font-light">
          <div>
            <h2 className="text-xl font-bold mb-2">1. Responsable del Tratamiento</h2>
            <p>El responsable del tratamiento de los datos recogidos a través de este sitio web es Gastro-Bar Fogón, con domicilio en C. Peñas Rojas, 80, 14200 Peñarroya-Pueblonuevo, Córdoba.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">2. Finalidad del Tratamiento</h2>
            <p>Los datos personales recogidos se tratarán con las siguientes finalidades:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Gestionar las solicitudes de información y contacto recibidas.</li>
              <li>Gestionar y confirmar las reservas realizadas por los usuarios.</li>
              <li>Mantener una relación comercial e informar de novedades, promociones y eventos relacionados con nuestro restaurante (siempre que se haya dado el consentimiento previo).</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">3. Legitimación</h2>
            <p>La base legal para el tratamiento de sus datos es el consentimiento que se le solicita al enviar el formulario de contacto o realizar una reserva.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">4. Derechos del Usuario</h2>
            <p>Cualquier persona tiene derecho a obtener confirmación sobre si en Gastro-Bar Fogón estamos tratando datos personales que les conciernan, o no. Los interesados tienen derecho a acceder a sus datos personales, así como a solicitar la rectificación de los datos inexactos o, en su caso, solicitar su supresión cuando, entre otros motivos, los datos ya no sean necesarios para los fines que fueron recogidos.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">5. Conservación de Datos</h2>
            <p>Los datos personales proporcionados se conservarán mientras se mantenga la relación comercial o durante los años necesarios para cumplir con las obligaciones legales.</p>
          </div>
        </section>
      </div>
    </main>
  );
};
