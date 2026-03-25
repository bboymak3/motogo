import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import type { User as UserType } from '@/types';

interface NotificationProps {
  user: UserType | null;
  message: string;
  onAccept: () => void;
  onDismiss: () => void;
}

export function Notification({ user, message, onAccept, onDismiss }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (user) {
      setIsVisible(true);
      // Play notification sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {});
    }
  }, [user]);

  if (!isVisible || !user) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
      <div className="bg-zinc-900 border border-emerald-500/50 rounded-xl p-4 shadow-2xl animate-in slide-in-from-top-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center flex-shrink-0">
            <MessageCircle className="w-5 h-5 text-emerald-400" />
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="font-bold text-emerald-400 text-sm">Nuevo Mensaje</p>
            <p className="text-white font-medium text-sm truncate">{user.name}</p>
            <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{message}</p>
          </div>

          <button
            onClick={onDismiss}
            className="text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            onClick={onDismiss}
            variant="outline"
            size="sm"
            className="flex-1 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
          >
            Ignorar
          </Button>
          <Button
            onClick={onAccept}
            size="sm"
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-medium"
          >
            Ver Chat
          </Button>
        </div>
      </div>
    </div>
  );
}
