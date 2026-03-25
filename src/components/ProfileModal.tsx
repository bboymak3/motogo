import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { User, Bike, Star, MapPin, Clock, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import type { User as UserType, Review } from '@/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType | null;
  currentUser: UserType;
  reviews: Review[];
  distance: number;
  onOpenChat: () => void;
  onSubmitReview: (stars: number, comment: string) => void;
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

export function ProfileModal({ 
  isOpen, 
  onClose, 
  user, 
  currentUser, 
  reviews, 
  distance, 
  onOpenChat, 
  onSubmitReview 
}: ProfileModalProps) {
  const [reviewText, setReviewText] = useState('');
  const [reviewStars, setReviewStars] = useState(5);

  if (!user) return null;

  const Icon = ROLE_ICONS[user.role];
  const isOwnProfile = user.id === currentUser.id;
  const estimatedTime = Math.round(distance / 80); // ~80m per minute on motorcycle

  const handleSubmitReview = () => {
    if (!reviewText.trim()) return;
    onSubmitReview(reviewStars, reviewText);
    setReviewText('');
    setReviewStars(5);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-zinc-800">
          <DialogTitle className="text-white flex items-center justify-between">
            <span>Perfil</span>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-60px)]">
          <div className="p-4 space-y-4">
            {/* Profile Header */}
            <div className="text-center space-y-3">
              <Avatar className="w-24 h-24 mx-auto border-4 border-zinc-800">
                <AvatarImage src={user.avatar_url} />
                <AvatarFallback className={`${ROLE_BG_COLORS[user.role]} text-black text-3xl`}>
                  <Icon className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-xl font-bold text-white">{user.name}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <Badge className={ROLE_COLORS[user.role]}>
                    {user.role === 'passenger' ? 'Pasajero' : 'Conductor'}
                  </Badge>
                  <Badge variant="outline" className={user.status === 'online' ? 'text-emerald-400 border-emerald-500/50' : 'text-zinc-500 border-zinc-600'}>
                    {user.status === 'online' ? '● En Línea' : '○ Desconectado'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <MapPin className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-zinc-400">Distancia</p>
                <p className="font-bold text-white">
                  {distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(1)} km`}
                </p>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3 text-center">
                <Clock className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-zinc-400">Tiempo Est.</p>
                <p className="font-bold text-white">{estimatedTime} min</p>
              </div>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="bg-zinc-800/50 rounded-lg p-3">
                <p className="text-sm text-zinc-300 italic">"{user.bio}"</p>
              </div>
            )}

            {/* Vehicle Details (for drivers) */}
            {user.role === 'driver' && user.details && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <p className="text-xs text-amber-400 font-medium mb-1">Vehículo</p>
                <p className="text-sm text-white">{user.details}</p>
              </div>
            )}

            {/* Rating Summary */}
            {user.rating && (
              <div className="flex items-center justify-center gap-2 bg-zinc-800 rounded-lg p-3">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <span className="text-2xl font-bold text-white">{user.rating}</span>
                <span className="text-zinc-400 text-sm">/ 5</span>
                {user.tripCount && (
                  <span className="text-zinc-500 text-sm ml-2">({user.tripCount} viajes)</span>
                )}
              </div>
            )}

            {/* Contact Button */}
            {!isOwnProfile && (
              <Button
                onClick={onOpenChat}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Contactar
              </Button>
            )}

            {/* Reviews Section */}
            <div className="border-t border-zinc-800 pt-4">
              <h3 className="font-bold text-white mb-3">Reseñas</h3>
              
              {/* Review List */}
              <div className="space-y-2 mb-4">
                {reviews.length === 0 ? (
                  <p className="text-zinc-500 text-sm text-center py-4">Sin reseñas aún</p>
                ) : (
                  reviews.map((review) => (
                    <div key={review.id} className="bg-zinc-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-white text-sm">{review.author_name}</span>
                        <span className="flex text-amber-400 text-xs">
                          {Array(review.stars).fill(null).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400" />
                          ))}
                        </span>
                      </div>
                      <p className="text-zinc-400 text-sm">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Review */}
              {!isOwnProfile && (
                <div className="space-y-2">
                  <Label className="text-zinc-300 text-sm">Agregar Reseña</Label>
                  <div className="flex gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewStars(star)}
                        className="p-1"
                      >
                        <Star 
                          className={`w-5 h-5 ${star <= reviewStars ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} 
                        />
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Escribe tu comentario..."
                      className="flex-1 bg-zinc-800 border-zinc-700 text-white text-sm"
                    />
                    <Button
                      onClick={handleSubmitReview}
                      size="sm"
                      className="bg-emerald-500 hover:bg-emerald-600 text-black"
                    >
                      Enviar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
