import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const LoginNav = () => {
  const [usuario, setUsuario] = useState<string | null>(null);
  const navegar = useNavigate();

  useEffect(() => {
    // Comprobamos si hay una sesión activa al cargar
    const sesion = localStorage.getItem('usuarioSesion');
    setUsuario(sesion);
  }, []);

  const cerrarSesion = () => {
    localStorage.removeItem('usuarioSesion');
    setUsuario(null);
    alert('Sesión cerrada');
    navegar('/');
  };

  return (
    <nav className="bg-[#D3CCBC] py-2 px-6 md:px-12 border-b border-[#30312E]/10 flex justify-end items-center gap-6 shadow-sm">
      {usuario ? (
        <>
          <span className="text-[#30312E]/60 text-sm italic">
            Hola, <span className="font-bold text-[#30312E]">{usuario}</span>
          </span>
          <button 
            onClick={cerrarSesion}
            className="text-red-700 hover:text-red-900 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50"
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
            <span>👤</span> Iniciar Sesión
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

