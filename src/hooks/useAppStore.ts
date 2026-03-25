import { useState, useCallback } from 'react';
import type { User, Message, Review } from '@/types';

// API Base URL - En Cloudflare Pages las funciones están en /api
const API_BASE = '/api';

export function useAppStore() {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [chatTarget, setChatTarget] = useState<User | null>(null);
  const [notificationUser, setNotificationUser] = useState<User | null>(null);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);

  // Auth functions
  const checkUser = useCallback(async (phone: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API_BASE}/check-user?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      return data.found ? data.user : null;
    } catch (e) {
      console.error('Error checking user:', e);
      return null;
    }
  }, []);

  const registerUser = useCallback(async (userData: Omit<User, 'id' | 'status'>): Promise<User> => {
    const newUser: User = {
      ...userData,
      id: `user_${Date.now()}`,
      status: 'online'
    };
    
    try {
      await fetch(`${API_BASE}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
      });
    } catch (e) {
      console.error('Error registering user:', e);
    }
    
    setUser(newUser);
    return newUser;
  }, []);

  const updateProfile = useCallback(async (id: string, bio: string, avatar_url: string): Promise<void> => {
    try {
      await fetch(`${API_BASE}/update-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, bio, avatar_url })
      });
    } catch (e) {
      console.error('Error updating profile:', e);
    }
  }, []);

  // Location functions
  const updateLocation = useCallback(async (userId: string, lat: number, lng: number): Promise<void> => {
    if (!user) return;
    
    try {
      await fetch(`${API_BASE}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...user, lat, lng, status: 'online' })
      });
    } catch (e) {
      console.error('Error updating location:', e);
    }
  }, [user]);

  // Chat functions
  const sendMessage = useCallback(async (senderId: string, receiverId: string, message: string): Promise<void> => {
    try {
      await fetch(`${API_BASE}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sender_id: senderId, receiver_id: receiverId, message })
      });
    } catch (e) {
      console.error('Error sending message:', e);
    }
  }, []);

  const getMessages = useCallback(async (userId1: string, userId2: string): Promise<Message[]> => {
    try {
      const res = await fetch(`${API_BASE}/messages/${userId2}?me=${userId1}`);
      const data = await res.json();
      return data || [];
    } catch (e) {
      console.error('Error getting messages:', e);
      return [];
    }
  }, []);

  const markAsRead = useCallback(async (myId: string, otherId: string): Promise<void> => {
    try {
      await fetch(`${API_BASE}/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ myId, otherId })
      });
    } catch (e) {
      console.error('Error marking as read:', e);
    }
  }, []);

  const getUnreadCount = useCallback(async (userId: string): Promise<number> => {
    try {
      const res = await fetch(`${API_BASE}/unread-count?user_id=${userId}`);
      const data = await res.json();
      return data.count || 0;
    } catch (e) {
      console.error('Error getting unread count:', e);
      return 0;
    }
  }, []);

  const checkNotifications = useCallback(async (userId: string): Promise<Message[]> => {
    try {
      const res = await fetch(`${API_BASE}/check-notifications?user_id=${userId}`);
      const data = await res.json();
      return data || [];
    } catch (e) {
      console.error('Error checking notifications:', e);
      return [];
    }
  }, []);

  // Review functions
  const submitReview = useCallback(async (targetId: string, author: string, stars: number, comment: string): Promise<void> => {
    try {
      await fetch(`${API_BASE}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetId, author, stars, comment })
      });
    } catch (e) {
      console.error('Error submitting review:', e);
    }
  }, []);

  const getReviews = useCallback(async (targetId: string): Promise<Review[]> => {
    try {
      const res = await fetch(`${API_BASE}/reviews/${targetId}`);
      const data = await res.json();
      return data || [];
    } catch (e) {
      console.error('Error getting reviews:', e);
      return [];
    }
  }, []);

  // Sync functions
  const syncUsers = useCallback(async (): Promise<User[]> => {
    try {
      const res = await fetch(`${API_BASE}/users`);
      const data = await res.json();
      const activeUsers = data || [];
      setUsers(activeUsers);
      return activeUsers;
    } catch (e) {
      console.error('Error syncing users:', e);
      return [];
    }
  }, []);

  return {
    // State
    user,
    users,
    chatTarget,
    notificationUser,
    lastMessageId,
    
    // Setters
    setUser,
    setChatTarget,
    setNotificationUser,
    setLastMessageId,
    
    // Auth
    checkUser,
    registerUser,
    updateProfile,
    
    // Location
    updateLocation,
    
    // Chat
    sendMessage,
    getMessages,
    markAsRead,
    getUnreadCount,
    checkNotifications,
    
    // Reviews
    submitReview,
    getReviews,
    
    // Sync
    syncUsers
  };
}
