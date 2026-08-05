import React from "react";
import { Organisation } from "../../types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { MapPin, Phone, Bell, BellOff, Navigation } from "lucide-react";
import { Switch } from "../ui/switch";

interface OrganisationCardProps {
    organisation: Organisation;
    onToggleNotifications: (id: string, enabled: boolean) => void;
    onViewOnMap: (org: Organisation) => void;
}

const categoryColors: Record<string, string> = {
    orphanage: "bg-blue-100 text-blue-800",
    "old-age-home": "bg-purple-100 text-purple-800",
    "special-school": "bg-green-100 text-green-800",
    "children-home": "bg-pink-100 text-pink-800",
    "blind-school": "bg-yellow-100 text-yellow-800",
    "rehab-center": "bg-red-100 text-red-800",
};

export const OrganisationCard: React.FC<OrganisationCardProps> = ({
    organisation,
    onToggleNotifications,
    onViewOnMap,
}) => {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <Badge className={categoryColors[organisation.category] || "bg-gray-100"}>
                        {organisation.category.replace("-", " ")}
                    </Badge>
                    {organisation.distance !== undefined && (
                        <span className="text-sm font-medium text-muted-foreground">
                            {organisation.distance.toFixed(1)} km away
                        </span>
                    )}
                </div>
                <CardTitle className="text-xl font-bold mt-2">{organisation.orgName}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pb-2 text-sm">
                <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <p className="text-muted-foreground leading-tight">
                        {organisation.address}, {organisation.district}, {organisation.pincode}
                    </p>
                </div>
                {organisation.phone && (
                    <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <a href={`tel:${organisation.phone}`} className="text-primary hover:underline">
                            {organisation.phone}
                        </a>
                    </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                        {organisation.notifications.receiveFoodAlerts ? (
                            <Bell className="h-4 w-4 text-primary" />
                        ) : (
                            <BellOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="font-medium">Receive Alerts</span>
                    </div>
                    <Switch
                        checked={organisation.notifications.receiveFoodAlerts}
                        onCheckedChange={(checked) => onToggleNotifications(organisation._id, checked)}
                    />
                </div>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-2 pt-2">
                <Button variant="outline" className="w-full gap-2" onClick={() => onViewOnMap(organisation)}>
                    <Navigation className="h-4 w-4" /> View Map
                </Button>
                <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => window.open(organisation.geo.mapLink, "_blank")}
                >
                    Directions
                </Button>
            </CardFooter>
        </Card>
    );
};
