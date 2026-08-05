import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSettings {
    autoLocation: boolean;
    alertRadius: string;
    address: string;
    lat: number;
    lng: number;
}

interface SettingsContextType {
    settings: UserSettings;
    updateSettings: (newSettings: Partial<UserSettings>) => void;
    isLoading: boolean;
}

const defaultSettings: UserSettings = {
    autoLocation: true,
    alertRadius: '10',
    address: 'Not detected',
    lat: 0,
    lng: 0,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const [settings, setSettings] = useState<UserSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadSettings = () => {
            try {
                const saved = localStorage.getItem('userSettings');
                if (saved) {
                    setSettings({ ...defaultSettings, ...JSON.parse(saved) });
                } else {
                    localStorage.setItem('userSettings', JSON.stringify(defaultSettings));
                }
            } catch (e) {
                console.error("Failed to parse userSettings from localStorage", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadSettings();
    }, []);

    const updateSettings = (updates: Partial<UserSettings>) => {
        setSettings(prev => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('userSettings', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
