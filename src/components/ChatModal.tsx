import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, User, Bike } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import type { User as UserType, Message } from '@/types';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: UserType | null;
  currentUser: UserType;
  messages: Message[];
  onSendMessage: (message: string) => void;
}

const ROLE_BG_COLORS = {
  passenger: 'bg-emerald-500',
  driver: 'bg-amber-500'
};

const ROLE_ICONS = {
  passenger: User,
  driver: Bike
};

export function ChatModal({ 
  isOpen, 
  onClose, 
  targetUser, 
  currentUser, 
  messages, 
  onSendMessage 
}: ChatModalProps) {
  const [messageText, setMessageText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (!targetUser) return null;

  const Icon = ROLE_ICONS[targetUser.role];

  const handleSend = () => {
    if (!messageText.trim()) return;
    onSendMessage(messageText);
    setMessageText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md h-[80vh] p-0 flex flex-col">
        <DialogHeader className="p-4 border-b border-zinc-800 flex-shrink-0">
          <DialogTitle className="text-white flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={targetUser.avatar_url} />
              <AvatarFallback className={`${ROLE_BG_COLORS[targetUser.role]} text-black`}>
                <Icon className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-white">{targetUser.name}</p>
              <p className="text-xs text-zinc-400 capitalize">
                {targetUser.role === 'passenger' ? 'Pasajero' : 'Conductor'}
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages */}
        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-3">
            {messages.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <p className="text-sm">No hay mensajes aún</p>
                <p className="text-xs mt-1">¡Saluda a {targetUser.name}!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender_id === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                        isOwn
                          ? 'bg-emerald-500 text-black rounded-br-none'
                          : 'bg-zinc-700 text-white rounded-bl-none'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 border-t border-zinc-800 flex-shrink-0">
          <div className="flex gap-2">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe un mensaje..."
              className="flex-1 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
            />
            <Button
              onClick={handleSend}
              size="icon"
              className="bg-emerald-500 hover:bg-emerald-600 text-black rounded-full w-10 h-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
