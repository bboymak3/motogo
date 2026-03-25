import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Bike, Star, MapPin } from 'lucide-react';
import type { User as UserType } from '@/types';

interface UserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  users: UserType[];
  currentUser: UserType;
  onUserClick: (user: UserType) => void;
}

const ROLE_COLORS = {
  passenger: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  driver: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
};

const ROLE_BG_COLORS = {
  passenger: 'bg-emerald-500',
  driver: 'bg-amber-500'
};

const ROLE_ICONS = {
  passenger: User,
  driver: Bike
};

export function UserDrawer({ isOpen, onClose, users, currentUser, onUserClick }: UserDrawerProps) {
  // Filter users based on role - passengers see drivers and vice versa
  const relevantUsers = users.filter(u => 
    u.id !== currentUser.id && u.status === 'online'
  );

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-[300px] bg-zinc-900 border-zinc-800 p-0">
        <SheetHeader className="p-4 border-b border-zinc-800">
          <SheetTitle className="text-white flex items-center justify-between">
            <span>En Línea</span>
            <Badge variant="outline" className="text-emerald-400 border-emerald-500/50">
              {relevantUsers.length}
            </Badge>
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-2 space-y-1">
            {relevantUsers.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No hay usuarios cercanos</p>
              </div>
            ) : (
              relevantUsers.map((user) => {
                const Icon = ROLE_ICONS[user.role];
                return (
                  <button
                    key={user.id}
                    onClick={() => onUserClick(user)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-800 transition-colors text-left"
                  >
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar_url} />
                        <AvatarFallback className={`${ROLE_BG_COLORS[user.role]} text-black`}>
                          <Icon className="w-5 h-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 bg-emerald-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm truncate">{user.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${ROLE_COLORS[user.role]}`}>
                          {user.role === 'passenger' ? 'Pasajero' : 'Conductor'}
                        </span>
                        {user.rating && (
                          <span className="flex items-center gap-0.5 text-amber-400 text-xs">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {user.rating}
                          </span>
                        )}
                      </div>
                      {user.details && (
                        <p className="text-zinc-500 text-xs truncate mt-0.5">{user.details}</p>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
