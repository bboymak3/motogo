import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Phone, MapPin, X } from 'lucide-react';

export function SOSButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleSOS = () => {
    setIsActive(true);
    setIsOpen(false);
    
    // Simulate SOS alert
    setTimeout(() => {
      alert('¡Alerta de emergencia enviada! Los contactos de emergencia han sido notificados.');
    }, 100);
  };

  return (
    <>
      {/* SOS Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-24 left-5 w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center z-40 shadow-lg transition-all hover:scale-110 ${
          isActive ? 'animate-pulse' : ''
        }`}
        style={{
          boxShadow: '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)'
        }}
      >
        <AlertTriangle className="w-6 h-6" />
        
        {/* Pulse rings */}
        {!isActive && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" style={{ animationDuration: '2s' }} />
            <span className="absolute -inset-2 rounded-full bg-red-500/20 animate-ping opacity-20" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
          </>
        )}
      </button>

      {/* SOS Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900 border-red-500/50 max-w-sm">
          <DialogHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-2xl text-red-400 font-bold">
              ¡EMERGENCIA!
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              ¿Estás en peligro? Esta alerta notificará a tus contactos de emergencia y autoridades cercanas.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            <div className="bg-zinc-800 rounded-lg p-3 flex items-center gap-3">
              <MapPin className="w-5 h-5 text-red-400" />
              <div>
                <p className="text-xs text-zinc-400">Tu ubicación será compartida</p>
                <p className="text-sm text-white">GPS activo</p>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-lg p-3 flex items-center gap-3">
              <Phone className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-zinc-400">Llamada de emergencia</p>
                <p className="text-sm text-white">911</p>
              </div>
            </div>

            <Button
              onClick={handleSOS}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-6"
            >
              <AlertTriangle className="w-5 h-5 mr-2" />
              ACTIVAR ALERTA SOS
            </Button>

            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="w-full border-zinc-700 text-zinc-400 hover:bg-zinc-800"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
