// src/components/AvisoLegal.tsx

export const AvisoLegal = () => {
  return (
    <main className="flex-1 bg-[#D3CCBC] text-[#30312E] py-16 px-6">
      <div className="max-w-4xl mx-auto bg-white/40 p-8 md:p-12 rounded-3xl shadow-xl border border-[#30312E]/10">
        <h1 className="text-4xl font-bold mb-8 italic border-b border-[#30312E]/10 pb-4">Aviso Legal</h1>
        
        <section className="space-y-6 text-lg leading-relaxed font-light">
          <div>
            <h2 className="text-xl font-bold mb-2">1. Datos Identificativos</h2>
            <p>En cumplimiento con el deber de información recogido en artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE), se reflejan los siguientes datos:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Titular:</strong> Gastro-Bar Fogón</li>
              <li><strong>CIF:</strong> B14889146</li>
              <li><strong>Dirección:</strong> C. Peñas Rojas, 80, 14200 Peñarroya-Pueblonuevo, Córdoba</li>
              <li><strong>Teléfono:</strong> 957 94 11 14</li>
              <li><strong>Email:</strong> fogon@gmail.com</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">2. Usuarios</h2>
            <p>El acceso y/o uso de este portal de Gastro-Bar Fogón atribuye la condición de USUARIO, que acepta, desde dicho acceso y/o uso, las Condiciones Generales de Uso aquí reflejadas.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">3. Uso del Portal</h2>
            <p>Este sitio web proporciona el acceso a multitud de informaciones, servicios, programas o datos en Internet pertenecientes a Gastro-Bar Fogón o a sus licenciantes a los que el USUARIO pueda tener acceso.</p>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-2">4. Propiedad Intelectual</h2>
            <p>Gastro-Bar Fogón por sí o como cesionaria, es titular de todos los derechos de propiedad intelectual e industrial de su página web, así como de los elementos contenidos en la misma (a título enunciativo, imágenes, sonido, audio, vídeo, software o textos; marcas o logotipos, combinaciones de colores, estructura y diseño, selección de materiales usados, etc.).</p>
          </div>
        </section>
      </div>
    </main>
  );
};
