export const Header =() =>{
    return (
        <header className="flex items-center justify-between px-8 py-4 bg-[#30312E] shadow-md">
            <div className="w-32">
                <a href="/">
                    <img src="/Img/fogone_clarito.png" alt="Logo" className="w-full h-auto"/>
                </a>
            </div>
             {/* Navegación */}
            <nav className="flex gap-6">
                <a href="/carta" className="text-[#D3CCBC] hover:text-gray-300 font-semibold transition-colors">
                Carta
                </a>
                <a href="/reservar" className="text-[#D3CCBC] hover:text-gray-300 font-semibold transition-colors">
                Reservar
                </a>
                <a href="/conocenos" className="text-[#D3CCBC] hover:text-gray-300 font-semibold transition-colors">
                Conócenos
                </a>
            </nav>
        </header>
    )
}