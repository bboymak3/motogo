import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bike, Camera } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { User as UserType } from '@/types';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onSave: (bio: string, avatarUrl: string) => void;
}

const ROLE_BG_COLORS = {
  passenger: 'bg-emerald-500',
  driver: 'bg-amber-500'
};

const ROLE_ICONS = {
  passenger: User,
  driver: Bike
};

export function EditProfileModal({ isOpen, onClose, user, onSave }: EditProfileModalProps) {
  const [bio, setBio] = useState(user.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user.avatar_url || '');

  useEffect(() => {
    if (isOpen) {
      setBio(user.bio || '');
      setAvatarUrl(user.avatar_url || '');
    }
  }, [isOpen, user]);

  const Icon = ROLE_ICONS[user.role];

  const handleSave = () => {
    onSave(bio, avatarUrl);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Editar Perfil</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Avatar Preview */}
          <div className="text-center">
            <div className="relative inline-block">
              <Avatar className="w-24 h-24 border-4 border-zinc-800">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback className={`${ROLE_BG_COLORS[user.role]} text-black text-3xl`}>
                  <Icon className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-zinc-700 rounded-full flex items-center justify-center border-2 border-zinc-900">
                <Camera className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
          </div>

          {/* Avatar URL Input */}
          <div className="space-y-2">
            <Label className="text-zinc-300">URL de Foto de Perfil</Label>
            <Input
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          {/* Bio Input */}
          <div className="space-y-2">
            <Label className="text-zinc-300">Biografía</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cuéntanos sobre ti..."
              rows={3}
              className="bg-zinc-800 border-zinc-700 text-white resize-none"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
          >
            Guardar Cambios
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
