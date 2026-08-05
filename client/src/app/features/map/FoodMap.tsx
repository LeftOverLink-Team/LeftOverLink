import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "next-themes";
import { MapPin, Navigation, ScanLine, Users } from "lucide-react";

// Fix for default marker icon issue in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom Premium Icon Generator
const getMarkerIcon = (type: 'receiver' | 'veg' | 'non-veg' | 'vegan' | 'mixed') => {
  let color = '#ef4444'; // default red for receiver
  let shadowColor = 'rgba(239, 68, 68, 0.4)';

  if (type === 'veg') { color = '#22c55e'; shadowColor = 'rgba(34, 197, 94, 0.4)'; }
  else if (type === 'non-veg') { color = '#f97316'; shadowColor = 'rgba(249, 115, 22, 0.4)'; }
  else if (type === 'vegan') { color = '#10b981'; shadowColor = 'rgba(16, 185, 129, 0.4)'; }
  else if (type === 'mixed') { color = '#8b5cf6'; shadowColor = 'rgba(139, 92, 246, 0.4)'; }

  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div class="relative flex items-center justify-center w-8 h-8 group">
        <!-- Pulsing background ring (only for providers, not receiver) -->
        ${type !== 'receiver' ? `<div class="absolute inset-0 rounded-full animate-ping opacity-75" style="background-color: ${color}; animation-duration: 2s;"></div>` : ''}
        <!-- Main Marker -->
        <div class="relative z-10 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:scale-125" style="background-color: ${color}; box-shadow: 0 4px 12px ${shadowColor};">
          <div class="w-2 h-2 rounded-full bg-white"></div>
        </div>
        <!-- Pointer tail -->
        <div class="absolute -bottom-1 w-2 h-2 rotate-45 border-r-2 border-b-2 border-white shadow-sm z-0" style="background-color: ${color};"></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });
};

type MapPost = {
  id: string;
  foodType: string;
  providerName: string;
  quantity?: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  distance?: number | null;
};

type FoodMapProps = {
  centerLat: number | null | undefined;
  centerLng: number | null | undefined;
  posts: MapPost[];
  receiverLat?: number | null;
  receiverLng?: number | null;
  receiverName?: string;
  onSelectPost?: (post: MapPost) => void;
  fullScreen?: boolean;
};

function MapActionButtons({
  userLat, userLng, providerLat, providerLng, posts
}: {
  userLat?: number | null, userLng?: number | null,
  providerLat?: number | null, providerLng?: number | null,
  posts?: MapPost[]
}) {
  const map = useMap();

  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-4">
      {providerLat != null && providerLng != null && (
        <button
          onClick={(e) => {
            e.preventDefault();
            map.flyTo([providerLat, providerLng], 15, { animate: true, duration: 1.5 });
          }}
          className="relative flex items-center justify-center p-3.5 bg-background border-2 border-red-500/80 rounded-2xl shadow-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-all group scale-100 active:scale-95"
          aria-label={userLat != null && userLng != null ? "Food Location" : "Your Location"}
        >
          <MapPin className="w-5 h-5 text-red-600 group-hover:scale-110 transition-transform" />
          <span className="absolute right-full mr-4 whitespace-nowrap bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-bold px-3 py-2 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
            {userLat != null && userLng != null ? "Food Location" : "Your Location"}
            <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-[5px] border-transparent border-l-zinc-900 dark:border-l-zinc-100" />
          </span>
        </button>
      )}

      {providerLat != null && providerLng != null && userLat != null && userLng != null && (
        <button
          onClick={(e) => {
            e.preventDefault();
            map.flyToBounds([
              [userLat, userLng],
              [providerLat, providerLng]
            ], { padding: [50, 50], animate: true, duration: 1.5 });
          }}
          className="relative flex items-center justify-center p-3.5 bg-background border-2 border-blue-500/80 rounded-2xl shadow-xl hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all group scale-100 active:scale-95"
          aria-label="Fit Both Locations"
        >
          <ScanLine className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
          <span className="absolute right-full mr-4 whitespace-nowrap bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 text-xs font-bold px-3 py-2 rounded-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity shadow-lg">
            Fit Both Locations
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
  );
}

export function FoodMap({
  centerLat,
  centerLng,
  posts,
  receiverLat,
  receiverLng,
  receiverName,
  onSelectPost,
  fullScreen,
}: FoodMapProps) {
  const { theme } = useTheme();
  const hasReceiver =
    typeof receiverLat === "number" &&
    typeof receiverLng === "number" &&
    receiverLat !== 0 &&
    receiverLng !== 0 &&
    !isNaN(receiverLat) &&
    !isNaN(receiverLng);

  const hasValidCenter =
    typeof centerLat === "number" &&
    typeof centerLng === "number" &&
    centerLat !== 0 &&
    centerLng !== 0 &&
    !isNaN(centerLat) &&
    !isNaN(centerLng);

  // Filter out posts with invalid locations
  const validPosts = posts.filter(post =>
    post.location &&
    typeof post.location.lat === 'number' &&
    typeof post.location.lng === 'number' &&
    !isNaN(post.location.lat) &&
    !isNaN(post.location.lng) &&
    (post.location.lat !== 0 || post.location.lng !== 0)
  );

  // Prefer user/receiver location as map center; fallback to first post or default
  const center: LatLngExpression = hasReceiver
    ? [receiverLat as number, receiverLng as number]
    : hasValidCenter
      ? [centerLat as number, centerLng as number]
      : validPosts.length > 0 && validPosts[0].location?.lat && validPosts[0].location?.lng
        ? [validPosts[0].location.lat, validPosts[0].location.lng]
        : [17.385, 78.4867]; // Default: Hyderabad, India

  // Prepare custom receiver icon label 
  const receiverIcon = hasReceiver
    ? L.divIcon({
      className: "custom-receiver-marker",
      html: `
          <div class="relative flex flex-col items-center">
            <div style="background-color: #ef4444;" class="w-8 h-8 rounded-full rounded-br-sm rotate-45 border-2 border-white shadow-xl z-10 flex items-center justify-center">
              <div class="w-3 h-3 bg-white rounded-full"></div>
            </div>
            ${receiverName ? `<div class="mt-1 px-3 py-1 bg-red-500 text-white text-[10px] font-black tracking-wider uppercase rounded-full shadow-lg border-2 border-white whitespace-nowrap z-20">${receiverName}</div>` : ''}
          </div>
        `,
      iconSize: [120, 60],
      iconAnchor: [60, 40],
      popupAnchor: [0, -42],
    })
    : getMarkerIcon('receiver');

  const [clat, clng] = Array.isArray(center)
    ? center
    : [(center as { lat: number; lng: number }).lat, (center as { lat: number; lng: number }).lng];
  const centerKey = `${Number(clat).toFixed(4)}-${Number(clng).toFixed(4)}`;

  return (
    <div className={`w-full ${fullScreen ? 'h-full' : 'h-[400px] sm:h-[500px]'} rounded-2xl overflow-hidden border border-border/50 shadow-inner relative z-0 mb-4 bg-muted/20`}>
      <MapContainer
        key={centerKey}
        center={center}
        zoom={13}
        zoomControl={false}
        className="w-full h-full z-0 font-sans"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url={theme === 'dark'
            ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
            : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />

        <MapActionButtons
          userLat={hasReceiver ? receiverLat as number : undefined}
          userLng={hasReceiver ? receiverLng as number : undefined}
          providerLat={validPosts.length > 0 ? validPosts[0].location.lat : undefined}
          providerLng={validPosts.length > 0 ? validPosts[0].location.lng : undefined}
          posts={validPosts}
        />

        {hasReceiver && (
          <>
            <Marker
              position={[receiverLat as number, receiverLng as number]}
              icon={receiverIcon}
            >
              <Popup className="premium-map-popup" closeButton={false}>
                <div className="text-sm font-semibold text-red-600 p-2 text-center">
                  {receiverName || "You are here"}
                </div>
              </Popup>
            </Marker>
          </>
        )}

        {validPosts.map((post) => {
          const coords: LatLngExpression = [post.location.lat, post.location.lng];
          const distanceText =
            post.distance != null
              ? `${(post.distance || 0).toFixed(1)} km away`
              : null;

          // Determine color type safely
          let mType: 'veg' | 'non-veg' | 'vegan' | 'mixed' = 'veg';
          const t = post.foodType?.toLowerCase() || '';
          if (t.includes('non')) mType = 'non-veg';
          else if (t.includes('vegan')) mType = 'vegan';
          else if (t.includes('mix')) mType = 'mixed';

          return (
            <div key={post.id}>
              {hasReceiver && (
                <>
                  <Polyline
                    key={`${post.id}-line`}
                    positions={[
                      [receiverLat as number, receiverLng as number],
                      coords,
                    ]}
                    pathOptions={{ color: "#22c55e", weight: 2, opacity: 0.4, dashArray: "5, 5" }}
                  />
                  {(() => {
                    const rLat = receiverLat as number;
                    const rLng = receiverLng as number;
                    const pLat = coords[0] as number;
                    const pLng = coords[1] as number;
                    const midLat = (rLat + pLat) / 2;
                    const midLng = (rLng + pLng) / 2;
                    // Calculate angle pointing FROM provider TO receiver
                    const angle = Math.atan2(rLng - pLng, rLat - pLat) * (180 / Math.PI);

                    return (
                      <Marker
                        key={`${post.id}-arrow`}
                        position={[midLat, midLng]}
                        icon={L.divIcon({
                          className: "custom-arrow-marker",
                          html: `<div style="transform: rotate(${angle}deg); display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; color: #22c55e; filter: drop-shadow(0px 2px 3px rgba(0,0,0,0.3));">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M12 19V5M5 12l7-7 7 7"/>
                            </svg>
                          </div>`,
                          iconSize: [24, 24],
                          iconAnchor: [12, 12],
                        })}
                        interactive={false}
                      />
                    );
                  })()}
                </>
              )}
              <Marker
                key={post.id}
                position={coords}
                icon={getMarkerIcon(mType)}
                eventHandlers={{
                  click: () => onSelectPost?.(post),
                }}
              >
                <Popup className="premium-map-popup" closeButton={false}>
                  <div className="p-2 min-w-[220px] max-w-[260px] flex flex-col gap-3">
                    <div className="flex -mx-5 -mt-5 bg-gradient-to-r from-emerald-600 to-green-500 p-4 items-center justify-between border-b border-green-700/50 rounded-t-xl mb-1 shadow-inner">
                      <h4 className="font-black text-[15px] leading-tight text-white pr-2 line-clamp-2 drop-shadow-sm">{post.foodType}</h4>
                      <div className="shrink-0 p-1.5 bg-white/20 backdrop-blur-md text-white rounded-lg shadow-sm border border-white/20">
                        <MapPin className="w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px]">
                          {post.providerName.charAt(0).toUpperCase()}
                        </span>
                        <p className="text-sm font-bold text-foreground truncate">{post.providerName}</p>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <Users className="w-3 h-3" />
                          Feeds ~{post.quantity || 1}
                        </span>
                        {distanceText && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
                            <Navigation className="w-3 h-3" />
                            {distanceText}
                          </span>
                        )}
                      </div>

                      <div className="bg-muted/50 rounded-lg p-2.5 border border-border/50">
                        <p className="text-[12px] font-medium text-muted-foreground leading-snug line-clamp-2" title={post.location.address?.replace('Unknown Location', 'Location hidden for privacy')}>
                          {post.location.address && post.location.address !== 'Unknown Location'
                            ? post.location.address
                            : 'Location hidden - Tap view details to get directions.'}
                        </p>
                      </div>
                    </div>

                    {onSelectPost && (
                      <button
                        onClick={(e) => { e.stopPropagation(); onSelectPost(post); }}
                        className="w-full mt-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm py-2.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}

