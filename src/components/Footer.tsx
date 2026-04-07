import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#30312E] text-[#D3CCBC] py-3 px-6 border-t border-[#D3CCBC]/10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        
        {/* Enlaces Legales */}
        <nav className="flex flex-wrap justify-center gap-3 md:gap-6 text-[11px] md:text-sm">
          <Link to="/privacidad" className="hover:text-gray-300 transition-colors">
            Política de Privacidad
          </Link>
          <Link to="/cookies" className="hover:text-gray-300 transition-colors">
            Política de Cookies
          </Link>
          <Link to="/terminos" className="hover:text-gray-300 transition-colors">
            Términos y Condiciones
          </Link>
        </nav>

        {/* Instagram y Copyright */}
        <a 
          id="insta" 
          href="https://www.instagram.com/fogonpya/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img src="/Img/insta.png" alt="Instagram" className="w-5 h-5 md:w-6 md:h-6" />
          <span className="font-medium text-xs md:text-base">&copy; 2019 Gastro-Bar Fogón</span>
        </a>
      </div>
    </footer>
  );
};
