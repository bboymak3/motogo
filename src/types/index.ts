export type UserRole = 'passenger' | 'driver';

export interface User {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  lat: number;
  lng: number;
  details?: string;
  bio?: string;
  avatar_url?: string;
  status: 'online' | 'offline';
  last_seen?: string;
  rating?: number;
  tripCount?: number;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  is_read?: boolean;
  sender_name?: string;
}

export interface Review {
  id: string;
  target_id: string;
  author_name: string;
  stars: number;
  comment: string;
  created_at: string;
}

export interface AppState {
  user: User | null;
  users: User[];
  messages: Message[];
  reviews: Review[];
  chatTarget: User | null;
  unreadCount: number;
  notificationUser: User | null;
  lastMessageId: string | null;
}
