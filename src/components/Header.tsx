import { Link } from 'react-router-dom';

export const Header =() =>{
    return (
        <header className="flex flex-col md:flex-row items-center justify-between px-4 md:px-12 py-6 md:py-4 bg-[#30312E] shadow-xl border-b border-[#D3CCBC]/10 gap-6 md:gap-0">
            <div className="w-40 md:w-48 transition-transform duration-300 hover:scale-110">
                <Link to="/">
                    <img src="/Img/fogone_clarito.png" alt="Logo" className="w-full h-auto drop-shadow-lg"/>
                </Link>
            </div>
             {/* Navegación */}
            <nav className="flex flex-wrap justify-center gap-6 md:gap-12 items-center md:me-12">
                <Link to="/carta" className="group relative text-[#D3CCBC] hover:text-gray-300 text-lg md:text-xl font-semibold transition-all duration-300">
                    Carta
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-300 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/reservar" className="group relative text-[#D3CCBC] hover:text-gray-300 text-lg md:text-xl font-semibold transition-all duration-300">
                    Reservar
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-300 transition-all duration-300 group-hover:w-full"></span>
                </Link>
                <Link to="/conocenos" className="group relative text-[#D3CCBC] hover:text-gray-300 text-lg md:text-xl font-semibold transition-all duration-300">
                    Conócenos
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-300 transition-all duration-300 group-hover:w-full"></span>
                </Link>
            </nav>
        </header>
    )
}