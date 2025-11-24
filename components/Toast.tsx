import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle size={18} className="text-green-400" />,
    error: <AlertCircle size={18} className="text-red-400" />,
    info: <Info size={18} className="text-blue-400" />
  };

  const borders = {
    success: 'border-green-500/20',
    error: 'border-red-500/20',
    info: 'border-blue-500/20'
  };

  return (
    <div className={`
      flex items-center gap-3 p-4 rounded-sm bg-[#1A1A1A] border ${borders[toast.type]} 
      shadow-[0_8px_30px_rgb(0,0,0,0.5)] animate-slide-up min-w-[300px] backdrop-blur-md
    `}>
      {icons[toast.type]}
      <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
      <button 
        onClick={() => onClose(toast.id)}
        className="text-neutral-500 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onClose={removeToast} />
      ))}
    </div>
  );
};