import React, { useState, useEffect } from 'react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 500); 
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-[#30312E]',
    error: 'bg-red-900',
    info: 'bg-stone-700'
  };

  const textColors = {
    success: 'text-[#D3CCBC]',
    error: 'text-white',
    info: 'text-[#D3CCBC]'
  };

  return (
    <div className={`fixed top-6 right-6 z-[9999] transform transition-all duration-500 ease-out ${isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
      <div className={`${bgColors[type]} ${textColors[type]} px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10 min-w-[300px]`}>
        <div className="flex-1">
          <p className="font-bold text-sm uppercase tracking-widest mb-1">
            {type === 'success' ? '¡Éxito!' : type === 'error' ? 'Error' : 'Aviso'}
          </p>
          <p className="text-sm font-medium opacity-90">{message}</p>
        </div>
        <button 
          onClick={() => { setIsExiting(true); setTimeout(onClose, 500); }}
          className="text-white/40 hover:text-white transition-colors text-xl font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

export const NotificationManager = () => {
  const [notification, setNotification] = useState<{ message: string, type: NotificationType } | null>(null);

  useEffect(() => {
    const handleNotify = (e: any) => {
      setNotification({ message: e.detail.message, type: e.detail.type });
    };

    window.addEventListener('app-notify', handleNotify);
    return () => window.removeEventListener('app-notify', handleNotify);
  }, []);

  if (!notification) return null;

  return (
    <Notification 
      message={notification.message} 
      type={notification.type} 
      onClose={() => setNotification(null)} 
    />
  );
};

export const showNotification = (message: string, type: NotificationType = 'info') => {
  const event = new CustomEvent('app-notify', { detail: { message, type } });
  window.dispatchEvent(event);
};
