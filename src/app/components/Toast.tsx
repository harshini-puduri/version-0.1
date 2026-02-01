import { useEffect, useState } from 'react';
import { X, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
  type?: 'success' | 'error' | 'info' | 'warning';
}

export function Toast({ message, onClose, duration = 5000, type = 'info' }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'error':
        return 'bg-red-500/15';
      case 'success':
        return 'bg-green-500/15';
      case 'warning':
        return 'bg-amber-500/15';
      default:
        return 'bg-primary/15';
    }
  };

  return (
    <div
      className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div className="bg-card/95 backdrop-blur-xl rounded-[20px] px-6 py-4 shadow-2xl border border-primary/20 flex items-center gap-3 min-w-[320px]">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getBackgroundColor()} flex items-center justify-center`}>
          {getIcon()}
        </div>
        <p className="flex-1 text-foreground/90 text-sm font-medium">{message}</p>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="flex-shrink-0 p-1 rounded-full hover:bg-background/60 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground/60" />
        </button>
      </div>
    </div>
  );
}
