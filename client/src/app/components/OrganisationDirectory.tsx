import React, { useState, useEffect } from "react";
import { Organisation } from "../types";
import { OrganisationCard } from "./organisation/OrganisationCard";
import { OrganisationMap } from "./organisation/OrganisationMap";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { LayoutGrid, Map as MapIcon, Search, Building2, Filter } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export const OrganisationDirectory: React.FC = () => {
    const [organisations, setOrganisations] = useState<Organisation[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedOrg, setSelectedOrg] = useState<Organisation | null>(null);

    useEffect(() => {
        fetchOrganisations();
    }, []);

    const fetchOrganisations = async () => {
        try {
            const response = await axios.get("/api/organisations");
            setOrganisations(response.data);
        } catch (err) {
            console.error("Failed to fetch organisations:", err);
            toast.error("Failed to load organisations");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleNotifications = async (id: string, enabled: boolean) => {
        try {
            await axios.post(`/api/organisations/${id}/enable-alerts`, { receiveFoodAlerts: enabled });
            setOrganisations((prev) =>
                prev.map((org) =>
                    org._id === id
                        ? { ...org, notifications: { ...org.notifications, receiveFoodAlerts: enabled } }
                        : org
                )
            );
            toast.success(enabled ? "Alerts enabled" : "Alerts disabled");
        } catch (err) {
            toast.error("Failed to update notification settings");
        }
    };

    const filteredOrganisations = Array.isArray(organisations)
        ? organisations.filter(
            (org) =>
                org.orgName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                org.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                org.category?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <Building2 className="h-10 w-10 text-primary" />
                        Organisation Directory
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Find and support local organisations in Andhra Pradesh.
                    </p>
                </div>

                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, district or category..."
                        className="pl-10 h-12 text-md shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <Tabs defaultValue="list" className="space-y-6">
                <div className="flex justify-between items-center">
                    <TabsList className="grid w-64 grid-cols-2">
                        <TabsTrigger value="list" className="gap-2">
                            <LayoutGrid className="h-4 w-4" /> List
                        </TabsTrigger>
                        <TabsTrigger value="map" className="gap-2">
                            <MapIcon className="h-4 w-4" /> Map
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                        <Filter className="h-4 w-4" />
                        Showing {filteredOrganisations.length} results
                    </div>
                </div>

                <TabsContent value="list">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
                            ))}
                        </div>
                    ) : filteredOrganisations.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredOrganisations.map((org) => (
                                <OrganisationCard
                                    key={org._id}
                                    organisation={org}
                                    onToggleNotifications={handleToggleNotifications}
                                    onViewOnMap={(org) => setSelectedOrg(org)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed rounded-3xl">
                            <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-20" />
                            <p className="text-xl font-medium text-muted-foreground">No organisations found matching your search.</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="map">
                    <OrganisationMap
                        organisations={filteredOrganisations}
                        center={selectedOrg?.geo.lat && selectedOrg?.geo.lng ? [selectedOrg.geo.lat, selectedOrg.geo.lng] : undefined}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};
