import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { User } from '@/types';

// Fix Leaflet default icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
  user: User;
  users: User[];
  onUserClick: (user: User) => void;
  onLocationUpdate: (lat: number, lng: number) => void;
}

const ROLE_COLORS = {
  passenger: '#10b981', // emerald-500
  driver: '#f59e0b'     // amber-500
};

export function MapView({ user, users, onUserClick, onLocationUpdate }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const initializedRef = useRef(false);

  // Initialize map
  useEffect(() => {
    if (initializedRef.current) return;
    
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([user.lat || 10.5, user.lng || -66.9], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    mapRef.current = map;
    initializedRef.current = true;

    // Get user location
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          onLocationUpdate(latitude, longitude);
          
          if (mapRef.current) {
            mapRef.current.panTo([latitude, longitude]);
          }
        },
        null,
        { enableHighAccuracy: true }
      );
    }

    return () => {
      map.remove();
      initializedRef.current = false;
    };
  }, []);

  // Update user marker
  useEffect(() => {
    if (!mapRef.current || !user.lat || !user.lng) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([user.lat, user.lng]);
    } else {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            width: 40px;
            height: 40px;
            background: ${ROLE_COLORS[user.role]};
            border-radius: 50%;
            border: 3px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 15px ${ROLE_COLORS[user.role]};
            animation: pulse 2s infinite;
          ">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${user.role === 'passenger' 
                ? '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
                : '<path d="M10 17l4-4-4-4"/><path d="M14 17l-4-4 4-4"/><circle cx="5" cy="12" r="3"/><circle cx="19" cy="12" r="3"/>'
              }
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });

      userMarkerRef.current = L.marker([user.lat, user.lng], { icon: customIcon })
        .addTo(mapRef.current)
        .bindPopup('Tú estás aquí');
    }
  }, [user.lat, user.lng, user.role]);

  // Update other users markers
  useEffect(() => {
    if (!mapRef.current) return;

    const activeIds = new Set(users.map(u => u.id));

    // Remove inactive markers
    markersRef.current.forEach((marker, id) => {
      if (!activeIds.has(id) && id !== user.id) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    users.forEach(u => {
      if (u.id === user.id) return;

      const marker = markersRef.current.get(u.id);
      
      if (marker) {
        marker.setLatLng([u.lat, u.lng]);
      } else {
        const customIcon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div style="
              width: 35px;
              height: 35px;
              background: ${ROLE_COLORS[u.role]};
              border-radius: 50%;
              border: 3px solid white;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 0 10px ${ROLE_COLORS[u.role]};
              cursor: pointer;
            ">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                ${u.role === 'passenger' 
                  ? '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'
                  : '<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>'
                }
              </svg>
            </div>
          `,
          iconSize: [35, 35],
          iconAnchor: [17.5, 17.5]
        });

        const newMarker = L.marker([u.lat, u.lng], { icon: customIcon })
          .addTo(mapRef.current!)
          .bindPopup(u.name);

        newMarker.on('click', () => onUserClick(u));
        markersRef.current.set(u.id, newMarker);
      }
    });
  }, [users, user.id, onUserClick]);

  return (
    <div 
      id="map" 
      className="absolute inset-0 z-0"
      style={{ height: '100vh', width: '100vw' }}
    />
  );
}
