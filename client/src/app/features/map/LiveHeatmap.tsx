import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup } from 'react-leaflet';
import { HeatmapLayer } from 'react-leaflet-heatmap-layer-v3';
import L from 'leaflet';
import { useTheme } from 'next-themes';
import api from '../../api/axios';
import { Loader2, LocateFixed, Maximize2, X } from 'lucide-react';
import { useLocation } from '../../hooks/useLocation';
import { Button } from '../../components/ui/button';

interface HeatmapData {
    lat: number;
    lng: number;
    intensity: number;
}

// Generate the Receiver icon identical to FoodMap
const getReceiverIcon = (name?: string) => {
    return L.divIcon({
        className: "custom-receiver-marker",
        html: `
            <div class="relative flex flex-col items-center">
              <div style="background-color: #ef4444;" class="w-8 h-8 rounded-full rounded-br-sm rotate-45 border-2 border-white shadow-xl z-10 flex items-center justify-center">
                <div class="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <div class="mt-1 px-3 py-1 bg-red-500 text-white text-[10px] font-black tracking-wider uppercase rounded-full shadow-lg border-2 border-white whitespace-nowrap z-20">${name || 'You are here'}</div>
            </div>
          `,
        iconSize: [120, 60],
        iconAnchor: [60, 40],
        popupAnchor: [0, -42],
    });
};

function DetectLocationButton({ onLocationFound }: { onLocationFound?: (loc: { lat: number, lng: number }) => void }) {
    const map = useMap();
    const { detectLocation, isDetecting } = useLocation();

    return (
        <button
            onClick={async (e) => {
                e.preventDefault();
                const loc = await detectLocation(false);
                if (loc) {
                    if (onLocationFound) onLocationFound(loc);
                    map.flyTo([loc.lat, loc.lng], 13, { animate: true, duration: 1.5 });
                }
            }}
            disabled={isDetecting}
            className="absolute bottom-6 right-6 z-[1000] flex items-center justify-center p-3 bg-white dark:bg-slate-900 border-2 border-green-500 rounded-full shadow-xl hover:bg-green-50 dark:hover:bg-slate-800 transition-all group disabled:opacity-50"
            title="Detect My Location"
        >
            <LocateFixed className={`w-5 h-5 text-green-600 group-hover:scale-110 transition-transform ${isDetecting ? 'animate-spin' : ''}`} />
        </button>
    );
}

// Extract Map Inner components so we can reuse them between Preview and Fullscreen
function HeatmapContent({
    theme,
    activeData,
    gradient,
    userLat,
    userLng,
    onLocationFound
}: {
    theme: string,
    activeData: HeatmapData[],
    gradient: any,
    userLat?: number | null,
    userLng?: number | null,
    onLocationFound: (loc: { lat: number, lng: number }) => void
}) {
    return (
        <>
            <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url={theme === 'dark'
                    ? "https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                }
            />

            <DetectLocationButton onLocationFound={onLocationFound} />

            {/* Receiver Location Marker */}
            {userLat != null && userLng != null && userLat !== 0 && userLng !== 0 && (
                <Marker
                    position={[userLat, userLng]}
                    icon={getReceiverIcon()}
                >
                    <Popup className="premium-map-popup" closeButton={false}>
                        <div className="text-sm font-semibold text-red-600 p-2 text-center">
                            Your Location
                        </div>
                    </Popup>
                </Marker>
            )}

            {/* Heatmap Layer */}
            {activeData.length > 0 && (
                <HeatmapLayer
                    fitBoundsOnLoad={false}
                    fitBoundsOnUpdate={false}
                    points={activeData}
                    longitudeExtractor={(m: any) => m.lng}
                    latitudeExtractor={(m: any) => m.lat}
                    intensityExtractor={(m: any) => m.intensity}
                    radius={20}
                    blur={15}
                    max={10}
                    gradient={gradient}
                />
            )}
        </>
    );
}

export function LiveHeatmap() {
    const { theme } = useTheme();
    const [userLoc, setUserLoc] = useState<{ lat: number, lng: number } | null>(null);
    const [viewMode, setViewMode] = useState<'waste' | 'demand'>('waste');
    const [wasteData, setWasteData] = useState<HeatmapData[]>([]);
    const [demandData, setDemandData] = useState<HeatmapData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMapExpanded, setIsMapExpanded] = useState(false);

    const center = [22.5937, 78.9629] as L.LatLngExpression; // Center of India
    const defaultZoom = 5; // Zoom level perfectly frames all of India

    useEffect(() => {
        const fetchHeatmapData = async () => {
            try {
                const res = await api.get('/analytics/heatmap');
                if (res.data?.success) {
                    setWasteData(res.data.data.waste);
                    setDemandData(res.data.data.demand);
                }
            } catch (err) {
                console.error("Failed to fetch heatmap data", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHeatmapData();
    }, []);

    const activeData = viewMode === 'waste' ? wasteData : demandData;

    // Use pure Red gradient for waste and pure Blue gradient for demand
    const gradient = viewMode === 'waste'
        ? { 0.4: '#fca5a5', 0.8: '#ef4444', 1.0: '#991b1b' } // Light Red -> Red -> Dark Red
        : { 0.4: '#93c5fd', 0.8: '#3b82f6', 1.0: '#1e3a8a' }; // Light Blue -> Blue -> Dark Blue

    return (
        <div className="relative w-full mb-6">
            {!isMapExpanded ? (
                <div
                    className="relative w-full rounded-3xl overflow-hidden border border-border shadow-2xl h-[400px] md:h-[600px] bg-muted/20 group cursor-pointer"
                    onClick={() => setIsMapExpanded(true)}
                >
                    <div className="absolute inset-0 bg-background/5 backdrop-blur-[2px] z-10 transition-colors group-hover:bg-background/0"></div>

                    {/* Centered Expand Button */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                        <Button variant="default" className="shadow-2xl scale-110 pointer-events-auto bg-green-600 hover:bg-green-700 text-white rounded-full px-6 py-6 font-bold flex items-center gap-2 group-hover:scale-125 transition-transform" onClick={(e) => { e.stopPropagation(); setIsMapExpanded(true); }}>
                            <Maximize2 className="w-5 h-5" />
                            Tap to View Full Map
                        </Button>
                    </div>

                    {/* Overlay Toggles */}
                    <div className="absolute top-6 right-6 z-[1000] flex bg-background/90 backdrop-blur-md p-1.5 rounded-full shadow-xl border">
                        <button
                            onClick={(e) => { e.stopPropagation(); setViewMode('waste'); }}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'waste'
                                ? 'bg-red-500 text-white shadow-md'
                                : 'text-muted-foreground hover:bg-muted'
                                }`}
                        >
                            Food Waste
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); setViewMode('demand'); }}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'demand'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-muted-foreground hover:bg-muted'
                                }`}
                        >
                            Demand Focus
                        </button>
                    </div>

                    {/* Information Pill */}
                    <div className="absolute bottom-6 left-6 z-[1000] flex items-center gap-2 bg-background/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${viewMode === 'waste' ? 'bg-red-400' : 'bg-blue-400'}`}></span>
                                <span className={`relative inline-flex rounded-full h-3 w-3 ${viewMode === 'waste' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                            </span>
                            <span className="text-sm font-semibold">Live Simulation</span>
                        </div>
                    </div>

                    {isLoading && (
                        <div className="absolute inset-0 z-[2000] flex items-center justify-center bg-background/50 backdrop-blur-[2px]">
                            <Loader2 className="w-10 h-10 text-green-600 animate-spin" />
                        </div>
                    )}

                    <MapContainer
                        center={center}
                        zoom={defaultZoom}
                        zoomControl={false}
                        className="w-full h-full z-0 font-sans"
                        dragging={false}
                        scrollWheelZoom={false}
                        doubleClickZoom={false}
                        boxZoom={false}
                        keyboard={false}
                        touchZoom={false}
                    >
                        <HeatmapContent
                            theme={theme || 'light'}
                            activeData={activeData}
                            gradient={gradient}
                            userLat={userLoc?.lat}
                            userLng={userLoc?.lng}
                            onLocationFound={setUserLoc}
                        />
                    </MapContainer>
                </div>
            ) : (
                <div className="fixed inset-0 z-[100] bg-background flex items-center justify-center pb-safe">
                    <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-background/80 to-transparent z-[110] pointer-events-none" />

                    {/* Red Premium Close Button */}
                    <Button
                        variant="default"
                        size="icon"
                        onClick={() => setIsMapExpanded(false)}
                        className="absolute top-6 left-6 z-[120] rounded-full shadow-xl bg-red-600 hover:bg-red-700 border-2 border-red-500 hover:border-red-400 group transition-all duration-300 hover:scale-110 hover:shadow-[0_0_20px_rgba(220,38,38,0.4)]"
                    >
                        <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform duration-300" />
                    </Button>

                    <div className="w-full h-full p-[2px] bg-gradient-to-br from-green-500/20 via-transparent to-green-500/20">
                        <div className="w-full h-full bg-background overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.1)]">
                            {/* Overlay Toggles (Expanded View) */}
                            <div className="absolute top-6 right-6 z-[1000] flex bg-background/90 backdrop-blur-md p-1.5 rounded-full shadow-xl border">
                                <button
                                    onClick={() => setViewMode('waste')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'waste'
                                        ? 'bg-red-500 text-white shadow-md'
                                        : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    Food Waste
                                </button>
                                <button
                                    onClick={() => setViewMode('demand')}
                                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${viewMode === 'demand'
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : 'text-muted-foreground hover:bg-muted'
                                        }`}
                                >
                                    Demand Focus
                                </button>
                            </div>

                            {/* Information Pill (Expanded View) */}
                            <div className="absolute bottom-6 left-6 z-[1000] flex items-center gap-2 bg-background/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-xl border">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${viewMode === 'waste' ? 'bg-red-400' : 'bg-blue-400'}`}></span>
                                        <span className={`relative inline-flex rounded-full h-3 w-3 ${viewMode === 'waste' ? 'bg-red-500' : 'bg-blue-500'}`}></span>
                                    </span>
                                    <span className="text-sm font-semibold">Live Simulation</span>
                                </div>
                            </div>

                            <MapContainer
                                center={center}
                                zoom={defaultZoom}
                                zoomControl={false}
                                className="w-full h-full z-0 font-sans"
                            >
                                <HeatmapContent
                                    theme={theme || 'light'}
                                    activeData={activeData}
                                    gradient={gradient}
                                    userLat={userLoc?.lat}
                                    userLng={userLoc?.lng}
                                    onLocationFound={setUserLoc}
                                />
                            </MapContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
