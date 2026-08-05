import React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Organisation } from "../../types";
import { Button } from "../ui/button";
import { Phone, Navigation } from "lucide-react";

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface OrganisationMapProps {
    organisations: Organisation[];
    center?: [number, number];
    zoom?: number;
}

// Helper component to update map view
const ChangeView = ({ center, zoom }: { center: [number, number]; zoom: number }) => {
    const map = useMap();
    map.setView(center, zoom);
    return null;
};

export const OrganisationMap: React.FC<OrganisationMapProps> = ({
    organisations,
    center = [17.385, 78.4867], // Default to Hyderabad
    zoom = 12,
}) => {
    // Use first organisation with coordinates as default center if not provided
    const mapCenter: [number, number] =
        organisations.length > 0 && organisations[0].geo.lat && organisations[0].geo.lng
            ? [organisations[0].geo.lat, organisations[0].geo.lng]
            : center;

    return (
        <div className="h-[500px] w-full rounded-xl overflow-hidden border shadow-inner">
            <MapContainer
                center={mapCenter}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ChangeView center={mapCenter} zoom={zoom} />
                {organisations.map((org) => {
                    if (!org.geo.lat || !org.geo.lng) return null;

                    return (
                        <Marker key={org._id} position={[org.geo.lat, org.geo.lng]}>
                            <Popup>
                                <div className="p-1 min-w-[200px]">
                                    <h3 className="font-bold text-lg m-0">{org.orgName}</h3>
                                    <p className="text-xs text-muted-foreground mb-2">{org.category}</p>
                                    <p className="text-sm border-t pt-2 mb-3">{org.address}</p>
                                    <div className="flex flex-col gap-2">
                                        {org.phone && (
                                            <Button variant="outline" size="sm" className="w-full gap-2 text-xs h-8" asChild>
                                                <a href={`tel:${org.phone}`}>
                                                    <Phone className="h-3 w-3" /> {org.phone}
                                                </a>
                                            </Button>
                                        )}
                                        <Button variant="default" size="sm" className="w-full gap-2 text-xs h-8" asChild>
                                            <a href={org.geo.mapLink} target="_blank" rel="noopener noreferrer">
                                                <Navigation className="h-3 w-3" /> Navigate
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
};
