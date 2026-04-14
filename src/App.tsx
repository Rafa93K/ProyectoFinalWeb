import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Routes, Route, Link } from 'react-router-dom';
import { Conocenos } from './components/Conocenos';
import { AvisoLegal } from './components/AvisoLegal';
import { Privacidad } from './components/Privacidad';
import { Cookies } from './components/Cookies';
import Carta from './components/Carta';
import PanelAdmin from './components/AdminPanel';
import AdminLogin from './components/AdminLogin';
import LoginNav from './components/LoginNav';
import Registro from './components/Registro';
import Login from './components/Login';
import PanelUsuario from './components/PanelUsuario';




const Home = () => {
  return (
    <main className="flex-1">
      {/* Sección Hero: El Salón */}
      <section className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <img 
          src="/Img/salon.jpg" 
          alt="Nuestro Salón" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center p-4">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
            Bienvenido a El Fogón
          </h1>
          <p className="text-xl md:text-2xl text-white/90 font-medium italic">
            Donde cada plato cuenta una historia
          </p>
        </div>
      </section>

      {/* Sección Experiencia: La Puerta */}
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 order-2 md:order-1">
          <h2 className="text-3xl md:text-4xl font-bold text-[#30312E] mb-6">
            Una entrada a la gastronomía auténtica
          </h2>
          <p className="text-lg text-[#30312E]/80 leading-relaxed mb-8">
            En Gastro-Bar Fogón, cada detalle está pensado para que vivas una experiencia inolvidable. Desde el momento en que cruzas nuestra puerta, te sumerges en un ambiente cálido donde la tradición y la innovación se encuentran en cada bocado.
          </p>
          <Link to="/carta">
            <button className="bg-[#30312E] text-[#D3CCBC] px-8 py-3 rounded-full font-bold hover:bg-[#4a4b46] transition-all transform hover:scale-105 shadow-lg">
              Ver la Carta
            </button>
          </Link>
        </div>
        <div className="flex-1 order-1 md:order-2">
          <div className="rounded-2xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
            <img 
              src="/Img/puerta.jpg" 
              alt="Nuestra Entrada" 
              className="w-full h-auto object-cover"
            />
          </div>
        </div>
      </section>

      {/* Cita Final o Separador */}
      <section className="bg-[#30312E] py-8 text-center text-[#D3CCBC]">
        <p className="text-2xl italic">"Más que un restaurante, un fogón compartido"</p>
      </section>
    </main>
  );
};

// Componentes temporales para las demás páginas
const Reservar = () => <div className="flex-1 flex items-center justify-center text-4xl text-[#30312E]">Página de Reservas (En construcción)</div>;

function App() {
  return (
    <div className="min-h-screen bg-[#D3CCBC] flex flex-col font-serif">
      <Header />
      <LoginNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/carta" element={<Carta />} />
        <Route path="/reservar" element={<Reservar />} />
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/mis-reservas" element={<PanelUsuario />} />
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/admin" element={
          localStorage.getItem('adminSesion') ? <PanelAdmin /> : <AdminLogin />
        } />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
      </Routes>
      <Footer />
    </div>
  )
}

export default App
