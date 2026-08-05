import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    /** If provided, user's role must match one of these to enter */
    role?: string | string[];
}

/**
 * Wraps a route to require authentication.
 * Redirects unauthenticated users to /login, preserving the attempted URL.
 * Redirects wrong-role users to their correct dashboard.
 */
export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
    const { user, isLoading } = useAuth();
    const location = useLocation();

    // Auth state is being hydrated from localStorage — show spinner
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                    <p className="text-sm font-medium">Loading…</p>
                </div>
            </div>
        );
    }

    // Not logged in — redirect to login, remembering where they came from
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Role-check — redirect to the user's correct dashboard
    if (role) {
        const allowed = Array.isArray(role) ? role : [role];
        if (!allowed.includes(user.role)) {
            const correctDash = user.role === 'provider' ? '/provider' : '/receiver';
            return <Navigate to={correctDash} replace />;
        }
    }

    return <>{children}</>;
}
