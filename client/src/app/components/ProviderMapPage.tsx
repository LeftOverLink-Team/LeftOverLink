import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { X, MapPin, Navigation, ScanLine } from 'lucide-react';
import { Button } from './ui/button';
import api from '../api/axios';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

type MapPost = {
  id: string;
  foodType: string;
  providerName: string;
  quantity: number;
  location: { lat: number; lng: number; address: string };
};

function ProviderMapButtons({ posts }: { posts: MapPost[] }) {
  const map = useMap();
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLng, setUserLng] = useState<number | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLng(pos.coords.longitude);
      },
      async () => {
        // Fallback to settings from MongoDB
        try {
          const res = await api.get('/auth/settings');
          if (res.data && res.data.lat && res.data.lng) {
            setUserLat(res.data.lat);
            setUserLng(res.data.lng);
          }
        } catch { }
      }
    );
  }, []);

  const myLocationIcon = L.divIcon({
    className: "custom-map-marker",
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <div class="absolute inset-0 rounded-full animate-ping opacity-75" style="background-color: #22c55e; animation-duration: 2s;"></div>
        <div class="relative z-10 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg" style="background-color: #22c55e; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
        <div class="absolute -bottom-1 w-2 h-2 rotate-45 border-r-2 border-b-2 border-white shadow-sm z-0" style="background-color: #22c55e;"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });

  return (
    <>
      {/* Pulsing green "My Location" marker */}
      {userLat != null && userLng != null && (
        <Marker position={[userLat, userLng]} icon={myLocationIcon}>
          <Popup>
            <div className="text-sm font-bold text-green-600 p-1 text-center">You are here</div>
          </Popup>
        </Marker>
      )}

      {/* Action Buttons */}
      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-4">
        {posts.length > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              const bounds = L.latLngBounds(posts.map(p => [p.location.lat, p.location.lng] as [number, number]));
              map.flyToBounds(bounds, { padding: [50, 50], animate: true, duration: 1.5 });
            }}
            className="relative flex items-center justify-center p-3.5 bg-background border-2 border-purple-500/80 rounded-2xl shadow-xl hover:bg-purple-50 dark:hover:bg-purple-950/30 transition-all group scale-100 active:scale-95"
            aria-label="View All Listings"
          >
            <ScanLine className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
            <span className="absolute right-full mr-4 whitespace-nowrap bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-bold px-3 py-2 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
              View All Listings
              <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-zinc-900 dark:border-l-zinc-100" />
            </span>
          </button>
        )}

        {userLat != null && userLng != null && (
          <button
            onClick={(e) => {
              e.preventDefault();
              map.flyTo([userLat, userLng], 15, { animate: true, duration: 1.5 });
            }}
            className="relative flex items-center justify-center p-3.5 bg-background border-2 border-green-500/80 rounded-2xl shadow-xl hover:bg-green-50 dark:hover:bg-green-950/30 transition-all group scale-100 active:scale-95"
            aria-label="My Location"
          >
            <Navigation className="w-5 h-5 text-green-600 group-hover:scale-110 transition-transform" />
            <span className="absolute right-full mr-4 whitespace-nowrap bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-bold px-3 py-2 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
              My Location
              <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-zinc-900 dark:border-l-zinc-100" />
            </span>
          </button>
        )}
      </div>
    </>
  );
}

export function ProviderMapPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<MapPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFood = async () => {
      try {
        const res = await api.get('/food');
        const data = res.data || [];
        const now = new Date();
        const mapped = data
          .filter((f: any) => f.location?.lat && f.location?.lng)
          .filter((f: any) => {
            if (f.status !== 'available') return false;
            if (!f.expiry) return true;
            return new Date(f.expiry) > now;
          })
          .map((f: any) => ({
            id: f._id || f.id,
            foodType: f.title || f.foodType || 'Food',
            providerName: f.provider?.name || 'Provider',
            quantity: f.quantity || 0,
            location: {
              lat: f.location.lat,
              lng: f.location.lng,
              address: f.location.address || 'Unknown',
            },
          }));
        setPosts(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFood();

    // Auto-refetch every 5 seconds to catch new posts
    const interval = setInterval(() => {
      console.log('Auto-refetching map data...');
      fetchFood();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const center: [number, number] =
    posts.length > 0
      ? [posts[0].location.lat, posts[0].location.lng]
      : [17.385, 78.4867];

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <Button
        onClick={() => navigate('/provider')}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-[1000] h-12 w-12 rounded-full bg-white/95 shadow-lg hover:bg-white dark:bg-zinc-900/95 dark:hover:bg-zinc-800"
        aria-label="Close map"
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="absolute left-1/2 top-4 z-[1000] -translate-x-1/2 rounded-xl bg-white/95 px-4 py-2 shadow-lg dark:bg-zinc-900/95">
        <p className="text-sm font-bold text-green-700 dark:text-green-400">
          {posts.length} provider{posts.length !== 1 ? 's' : ''} on map
        </p>
      </div>

      {loading ? (
        <div className="flex h-full items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={12}
          className="h-full w-full"
          style={{ minHeight: '100vh' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {posts.map((post) => (
            <Marker
              key={post.id}
              position={[post.location.lat, post.location.lng]}
            >
              <Popup>
                <div className="min-w-[180px] space-y-1">
                  <div className="font-bold text-green-700">{post.foodType}</div>
                  <div className="text-sm text-muted-foreground">
                    {post.providerName}
                  </div>
                  <div className="text-xs">Feeds ~{post.quantity} people</div>
                  <div className="text-xs text-muted-foreground">
                    {post.location.address}
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
          <ProviderMapButtons posts={posts} />
        </MapContainer>
      )}
    </div>
  );
}
