import { useState, useEffect } from 'react';
import { backendMode } from '@/services/storageMode';
import { Card } from './ui/card';
import { Globe, Laptop } from 'lucide-react';

export default function BackendToggle() {
  const [mode, setMode] = useState(backendMode.get());

  useEffect(() => {
    const handleModeChange = (e: CustomEvent) => {
      setMode(e.detail);
    };

    window.addEventListener('backendModeChanged', handleModeChange as EventListener);
    return () => {
      window.removeEventListener('backendModeChanged', handleModeChange as EventListener);
    };
  }, []);

  const handleToggle = () => {
    const newMode = backendMode.toggle();
    setMode(newMode);
    // Force reload to apply changes
    window.location.reload();
  };

  return (
    <Card className="p-5 bg-gradient-to-br from-primary/5 to-transparent border border-primary/10">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-foreground/90 font-medium flex items-center gap-2">
            {mode === 'localhost' ? <Laptop className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
            Backend: {mode === 'localhost' ? 'Localhost' : 'Production'}
          </h3>
          <p className="text-xs text-muted-foreground/60 mt-1">
            {backendMode.getUrl()}
          </p>
        </div>
        <button
          onClick={handleToggle}
          className="px-4 py-2 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-[12px] text-sm text-primary font-medium transition-all"
        >
          Switch to {mode === 'localhost' ? 'Production' : 'Localhost'}
        </button>
      </div>
      
      <div className="text-xs text-muted-foreground/60">
        💡 Toggle between local development and production backend
      </div>
    </Card>
  );
}
