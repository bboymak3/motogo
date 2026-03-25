import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Bike, Users } from 'lucide-react';
import type { User as UserType } from '@/types';

interface HeaderProps {
  user: UserType;
  onOpenProfile: () => void;
  onToggleUserList: () => void;
  unreadCount: number;
}

const ROLE_COLORS = {
  passenger: 'text-emerald-400',
  driver: 'text-amber-400'
};

const ROLE_BG_COLORS = {
  passenger: 'bg-emerald-500',
  driver: 'bg-amber-500'
};

const ROLE_ICONS = {
  passenger: User,
  driver: Bike
};

export function Header({ user, onOpenProfile, onToggleUserList, unreadCount }: HeaderProps) {
  const Icon = ROLE_ICONS[user.role];
  
  return (
    <div className="fixed top-3 left-3 right-3 bg-zinc-900/90 backdrop-blur-md rounded-full px-4 py-2 z-40 flex items-center justify-between shadow-lg border border-zinc-800">
      {/* User Profile */}
      <button
        onClick={onOpenProfile}
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <div className="relative">
          <Avatar className="w-10 h-10 border-2 border-emerald-500">
            <AvatarImage src={user.avatar_url} />
            <AvatarFallback className={`${ROLE_BG_COLORS[user.role]} text-black`}>
              <Icon className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-zinc-900 ${
            user.status === 'online' ? 'bg-emerald-500' : 'bg-zinc-500'
          }`} />
        </div>
        <div className="text-left">
          <p className="font-bold text-white text-sm leading-tight">{user.name}</p>
          <p className={`text-xs ${ROLE_COLORS[user.role]} capitalize`}>
            {user.role === 'passenger' ? 'Pasajero' : 'Conductor'}
          </p>
        </div>
      </button>

      {/* Actions */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleUserList}
        className="relative text-zinc-400 hover:text-white hover:bg-zinc-800"
      >
        <Users className="w-5 h-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] min-w-[18px] h-[18px] flex items-center justify-center p-0">
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
}
