import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Home } from './components/Home';
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
import PasswordOlvido from './components/PasswordOlvido';
import PasswordReset from './components/PasswordReset';
import PanelUsuario from './components/PanelUsuario';
import { Reservar } from './components/Reservar';
import { NotificationManager } from './components/Notification';
/**
 * Componente Principal App
 * Gestiona el enrutamiento y la estructura base del sitio.
 */
function App() {
  const ubicacion = useLocation();
  // Comprobar si estamos en la zona de administración
  const esAdmin = ubicacion.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-[#D3CCBC] flex flex-col font-serif overflow-x-hidden">
      <NotificationManager />
      <Header />
      {/* Mostrar la navegación de login si no estamos en admin */}
      {!esAdmin && <LoginNav />}
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/carta" element={<Carta />} />
        <Route path="/reservar" element={<Reservar />} />
        <Route path="/conocenos" element={<Conocenos />} />
        <Route path="/mis-reservas" element={<PanelUsuario />} />
        <Route path="/aviso-legal" element={<AvisoLegal />} />
        <Route path="/privacidad" element={<Privacidad />} />
        <Route path="/cookies" element={<Cookies />} />
        {/* Rutas de Administración */}
        <Route path="/adminF" element={
          localStorage.getItem('adminSesion') ? <PanelAdmin /> : <AdminLogin />
        } />
        <Route path="/adminF/login" element={<AdminLogin />} />
        {/* Rutas de Usuario */}
        <Route path="/registro" element={<Registro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recuperar-password" element={<PasswordOlvido />} />
        <Route path="/reset-password/:token" element={<PasswordReset />} />
        {/* Redirección para rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      <Footer />
    </div>
  )
}
export default App
