import { useState, useEffect, useCallback, useRef } from 'react';
import { AuthScreen } from '@/components/AuthScreen';
import { Header } from '@/components/Header';
import { MapView } from '@/components/MapView';
import { UserDrawer } from '@/components/UserDrawer';
import { ProfileModal } from '@/components/ProfileModal';
import { ChatModal } from '@/components/ChatModal';
import { EditProfileModal } from '@/components/EditProfileModal';
import { Notification } from '@/components/Notification';
import { SOSButton } from '@/components/SOSButton';
import { useAppStore } from '@/hooks/useAppStore';
import type { User, Message, Review } from '@/types';
import './App.css';

function App() {
  const {
    user,
    users,
    setUser,
    setChatTarget,
    chatTarget,
    setNotificationUser,
    lastMessageId,
    setLastMessageId,
    checkUser,
    registerUser,
    updateProfile,
    updateLocation,
    sendMessage,
    getMessages,
    markAsRead,
    getUnreadCount,
    checkNotifications,
    submitReview,
    getReviews,
    syncUsers
  } = useAppStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [distance, setDistance] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notification, setNotification] = useState<{ user: User | null; message: string }>({ user: null, message: '' });
  
  const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const notifIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c * 1000;
  };

  // Handle login
  const handleLogin = useCallback(async (userData: User) => {
    setUser(userData);
  }, [setUser]);

  // Handle register
  const handleRegister = useCallback(async (userData: Omit<User, 'id' | 'status'>) => {
    const newUser = await registerUser(userData);
    setUser(newUser);
  }, [registerUser, setUser]);

  // Handle location update
  const handleLocationUpdate = useCallback(async (lat: number, lng: number) => {
    if (user) {
      await updateLocation(user.id, lat, lng);
      setUser({ ...user, lat, lng });
    }
  }, [user, updateLocation, setUser]);

  // Handle user click from map or drawer
  const handleUserClick = useCallback(async (clickedUser: User) => {
    setSelectedUser(clickedUser);
    
    // Load reviews asynchronously
    const userReviews = await getReviews(clickedUser.id);
    setReviews(userReviews);
    
    if (user) {
      const dist = calculateDistance(user.lat, user.lng, clickedUser.lat, clickedUser.lng);
      setDistance(dist);
    }
    
    setIsProfileOpen(true);
    setIsDrawerOpen(false);
  }, [user, getReviews]);

  // Handle open chat
  const handleOpenChat = useCallback(async () => {
    if (selectedUser && user) {
      setChatTarget(selectedUser);
      const msgs = await getMessages(user.id, selectedUser.id);
      setMessages(msgs);
      await markAsRead(user.id, selectedUser.id);
      setIsChatOpen(true);
      setIsProfileOpen(false);
    }
  }, [selectedUser, user, setChatTarget, getMessages, markAsRead]);

  // Handle send message
  const handleSendMessage = useCallback(async (message: string) => {
    if (user && chatTarget) {
      await sendMessage(user.id, chatTarget.id, message);
      const msgs = await getMessages(user.id, chatTarget.id);
      setMessages(msgs);
    }
  }, [user, chatTarget, sendMessage, getMessages]);

  // Handle submit review
  const handleSubmitReview = useCallback(async (stars: number, comment: string) => {
    if (selectedUser && user) {
      await submitReview(selectedUser.id, user.name, stars, comment);
      const userReviews = await getReviews(selectedUser.id);
      setReviews(userReviews);
    }
  }, [selectedUser, user, submitReview, getReviews]);

  // Handle save profile
  const handleSaveProfile = useCallback(async (bio: string, avatarUrl: string) => {
    if (user) {
      await updateProfile(user.id, bio, avatarUrl);
      setUser({ ...user, bio, avatar_url: avatarUrl });
    }
  }, [user, updateProfile, setUser]);

  // Handle notification accept
  const handleNotificationAccept = useCallback(async () => {
    if (notification.user && user) {
      setSelectedUser(notification.user);
      setChatTarget(notification.user);
      const msgs = await getMessages(user.id, notification.user.id);
      setMessages(msgs);
      await markAsRead(user.id, notification.user.id);
      setIsChatOpen(true);
    }
    setNotification({ user: null, message: '' });
  }, [notification.user, user, setChatTarget, getMessages, markAsRead]);

  // Handle notification dismiss
  const handleNotificationDismiss = useCallback(() => {
    setNotification({ user: null, message: '' });
  }, []);

  // Sync loop
  useEffect(() => {
    if (!user) return;

    const sync = async () => {
      await syncUsers();
      const count = await getUnreadCount(user.id);
      setUnreadCount(count);
    };

    sync();
    syncIntervalRef.current = setInterval(sync, 5000);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [user, syncUsers, getUnreadCount]);

  // Notification checker
  useEffect(() => {
    if (!user || isChatOpen) return;

    const check = async () => {
      const notifs = await checkNotifications(user.id);
      if (notifs.length > 0 && notifs[0].id !== lastMessageId) {
        setLastMessageId(notifs[0].id);
        const sender = users.find(u => u.id === notifs[0].sender_id);
        if (sender) {
          setNotificationUser(sender);
          setNotification({ user: sender, message: notifs[0].message });
        }
      }
    };

    notifIntervalRef.current = setInterval(check, 5000);

    return () => {
      if (notifIntervalRef.current) {
        clearInterval(notifIntervalRef.current);
      }
    };
  }, [user, isChatOpen, lastMessageId, users, checkNotifications, setLastMessageId, setNotificationUser]);

  // Update messages when chat is open
  useEffect(() => {
    if (!isChatOpen || !user || !chatTarget) return;

    const loadMessages = async () => {
      const msgs = await getMessages(user.id, chatTarget.id);
      setMessages(msgs);
    };

    loadMessages();
    const interval = setInterval(loadMessages, 2000);
    return () => clearInterval(interval);
  }, [isChatOpen, user, chatTarget, getMessages]);

  if (!user) {
    return (
      <AuthScreen
        onLogin={handleLogin}
        onRegister={handleRegister}
        checkUser={checkUser}
      />
    );
  }

  return (
    <div className="relative w-full h-screen bg-zinc-950 overflow-hidden">
      {/* Header */}
      <Header
        user={user}
        onOpenProfile={() => setIsEditProfileOpen(true)}
        onToggleUserList={() => setIsDrawerOpen(true)}
        unreadCount={unreadCount}
      />

      {/* Map */}
      <MapView
        user={user}
        users={users}
        onUserClick={handleUserClick}
        onLocationUpdate={handleLocationUpdate}
      />

      {/* SOS Button */}
      <SOSButton />

      {/* User Drawer */}
      <UserDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        users={users}
        currentUser={user}
        onUserClick={handleUserClick}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={selectedUser}
        currentUser={user}
        reviews={reviews}
        distance={distance}
        onOpenChat={handleOpenChat}
        onSubmitReview={handleSubmitReview}
      />

      {/* Chat Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          if (chatTarget) {
            markAsRead(user.id, chatTarget.id);
          }
        }}
        targetUser={chatTarget}
        currentUser={user}
        messages={messages}
        onSendMessage={handleSendMessage}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        user={user}
        onSave={handleSaveProfile}
      />

      {/* Notification */}
      <Notification
        user={notification.user}
        message={notification.message}
        onAccept={handleNotificationAccept}
        onDismiss={handleNotificationDismiss}
      />
    </div>
  );
}

export default App;
