import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginNav = () => {
  const [usuario, setUsuario] = useState<{ nombre: string, telefono: string } | null>(null);
  const navegar = useNavigate();

  useEffect(() => {
    // Comprobamos si hay una sesión activa al cargar
    const sesionRaw = localStorage.getItem('usuarioSesion');
    if (sesionRaw) {
      try {
        let sesion = JSON.parse(sesionRaw);

        // Saneamiento: Si por algún error 'nombre' es un objeto, extraemos el string
        if (sesion && typeof sesion.nombre === 'object' && sesion.nombre !== null) {
          sesion.nombre = sesion.nombre.nombre || JSON.stringify(sesion.nombre);
        }

        // Saneamiento: Si 'nombre' es un string que parece JSON, intentamos parsearlo
        if (sesion && typeof sesion.nombre === 'string' && sesion.nombre.trim().startsWith('{')) {
          try {
            const nombreObj = JSON.parse(sesion.nombre);
            if (nombreObj.nombre) sesion.nombre = nombreObj.nombre;
          } catch (e) {
            // No es JSON válido o no tiene campo nombre, lo dejamos como está
          }
        }

        setUsuario(sesion);
      } catch (e) {
        localStorage.removeItem('usuarioSesion');
      }
    }
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioSesion');
    setUsuario(null);
    navegar('/');
  };

  return (
    <nav className="bg-[#D3CCBC] py-3 px-6 md:px-12 border-b border-[#30312E]/10 flex justify-end items-center gap-6 shadow-sm">
      {usuario ? (
        <>
          <span className="text-[#30312E]/60 text-sm italic">
            Hola, <span className="font-bold text-[#30312E]">{usuario.nombre}</span>
          </span>
          <Link
            to="/mis-reservas"
            className="text-[#30312E] hover:text-[#30312E]/70 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 border border-[#30312E]/20 px-3 py-1 rounded-lg hover:bg-stone-50"
          >
            📋 Ver mis reservas
          </Link>
          <button
            onClick={cerrarSesion}
            className="text-red-800 hover:text-red-900 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50"
          >
            Cerrar Sesión ↩
          </button>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className="text-[#30312E] hover:text-[#30312E]/70 text-sm font-bold uppercase tracking-widest transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Iniciar Sesión
          </Link>
          <Link
            to="/registro"
            className="bg-[#30312E] text-[#D3CCBC] px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest hover:bg-[#4a4b46] transition-all transform hover:scale-105 shadow-md"
          >
            Registrarse
          </Link>
        </>
      )}
    </nav>
  );
};

export default LoginNav;

