import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserRole } from '../types';
import axios from 'axios';

interface AuthUser {
    id: string;
    name: string;
    role: UserRole | string;
    email?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    token: string | null;
    isLoading: boolean;
    login: (user: AuthUser, token: string) => void;
    logout: () => void;
    updateUser: (updates: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const apiRoot =
    ((import.meta as any)?.env?.VITE_API_URL as string) || 'http://localhost:5001';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const savedUser = localStorage.getItem('user');
                const savedToken = localStorage.getItem('token');

                if (!savedUser || !savedToken) {
                    setIsLoading(false);
                    return;
                }

                // Optimistically set state from cache so UI renders immediately
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                setToken(savedToken);

                // Verify token against server — catches expired tokens and role mismatches
                try {
                    const res = await axios.get(`${apiRoot}/api/auth/me`, {
                        headers: { Authorization: `Bearer ${savedToken}` },
                    });
                    const fresh = res.data;
                    // Update with canonical role/name from DB (source of truth)
                    const verifiedUser: AuthUser = {
                        id: fresh._id || fresh.id || parsedUser.id,
                        name: fresh.name || parsedUser.name,
                        email: fresh.email || parsedUser.email,
                        role: fresh.role || parsedUser.role,
                    };
                    setUser(verifiedUser);
                    localStorage.setItem('user', JSON.stringify(verifiedUser));
                } catch (verifyErr: any) {
                    // Only log out if the server explicitly says the token is invalid (401)
                    // Ignore network errors, 500s, CORS issues, server restarts etc.
                    const status = verifyErr?.response?.status;
                    if (status === 401) {
                        setUser(null);
                        setToken(null);
                        localStorage.removeItem('user');
                        localStorage.removeItem('token');
                        if (!window.location.pathname.includes('/login')) {
                            window.location.href = '/login?reason=session';
                        }
                    }
                    // Any other error: keep the cached user and let normal API calls handle auth
                }
            } catch (e) {
                setUser(null);
                setToken(null);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = (userData: AuthUser, authToken: string) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', authToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        // For completely clearing out other app-specific caches if needed
        // localStorage.removeItem('userSettings'); 
        localStorage.removeItem('receiverWallet');
        window.location.href = '/login';
    };

    const updateUser = (updates: Partial<AuthUser>) => {
        setUser(prev => {
            if (!prev) return prev;
            const updated = { ...prev, ...updates };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
