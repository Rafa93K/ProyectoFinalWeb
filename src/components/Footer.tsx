import { Link } from 'react-router-dom';

/**
 * Componente Footer
 * Contiene los enlaces legales y el acceso a redes sociales.
 */
export const Footer = () => {
  return (
    <footer className="bg-[#30312E] text-[#D3CCBC] py-3 px-6 border-t border-[#D3CCBC]/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">

        {/* --- Sección de Enlaces Legales --- */}
        <nav className="flex flex-wrap justify-center gap-3 md:gap-6 text-[11px] md:text-sm">
          <Link 
            to="/aviso-legal" 
            className="hover:text-gray-300 transition-colors"
            // Al pulsar, sube al inicio de la página suavemente
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Aviso Legal
          </Link>
          <Link 
            to="/privacidad" 
            className="hover:text-gray-300 transition-colors"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Política de Privacidad
          </Link>
          <Link 
            to="/cookies" 
            className="hover:text-gray-300 transition-colors" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            Política de Cookies
          </Link>
        </nav>

        {/* --- Sección de Redes Sociales y Copyright --- */}
        <a
          id="insta"
          href="https://www.instagram.com/fogonpya/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/Img/insta.png" alt="Instagram" className="w-5 h-5 md:w-6 md:h-6" />
          <span className="font-medium text-xs md:text-base">&copy;Gastro-Bar Fogón</span>
        </a>
      </div>
    </footer>
  );
};
