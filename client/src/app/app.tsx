import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { ThemeProvider } from 'next-themes';
import { LandingPage } from './components/LandingPage';
import { SignupPage } from './components/SignupPage';
import { LoginPage } from './components/LoginPage';
import { ProviderDashboard } from './components/ProviderDashboard';
import { ReceiverDashboard } from './components/ReceiverDashboard';
import { MyOrdersPage } from './components/MyOrdersPage';
import { ProviderOrdersPage } from './components/ProviderOrdersPage';
import { ProviderRequestsPage } from './components/ProviderRequestsPage';
import { PostFoodPage } from './components/PostFoodPage';
import { MyListingsPage } from './components/MyListingsPage';
import { PickupHistoryPage } from './components/PickupHistoryPage';
import { SettingsPage } from './components/SettingsPage';
import { NotificationsPage } from './components/NotificationsPage';
import { PickupConfirmationPage } from './components/PickupConfirmationPage';
import { TermsPage } from './components/TermsPage';
import { PrivacyPage } from './components/PrivacyPage';
import { FoodHygieneDisclaimerPage } from './components/FoodHygieneDisclaimerPage';
import { FAQPage } from './components/FAQPage';
import { Toaster } from './components/ui/sonner';
import { DonationPage } from './components/DonationPage';
import { WalletPage } from './components/WalletPage';
import { ProviderWalletPage } from './components/ProviderWalletPage';
import { ProviderMapPage } from './components/ProviderMapPage';
import { GlobalChatWidget } from './components/GlobalChatWidget';
import { OrganisationDirectory } from './components/OrganisationDirectory';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

/** Redirects logged-in users to their role's dashboard, visitors to /login */
const DashboardRedirect = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'provider' ? '/provider' : '/receiver'} replace />;
};

export default function App() {
  return (
    <Router>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="size-full">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/disclaimer" element={<FoodHygieneDisclaimerPage />} />
            <Route path="/donate" element={<DonationPage />} />
            <Route path="/directory" element={<OrganisationDirectory />} />

            {/* Role-agnostic redirect */}
            <Route path="/dashboard" element={<DashboardRedirect />} />

            {/* Provider-only routes */}
            <Route path="/provider" element={<ProtectedRoute role="provider"><ProviderDashboard /></ProtectedRoute>} />
            <Route path="/provider/map" element={<ProtectedRoute role="provider"><ProviderMapPage /></ProtectedRoute>} />
            <Route path="/provider-orders" element={<ProtectedRoute role="provider"><ProviderOrdersPage /></ProtectedRoute>} />
            <Route path="/provider-requests" element={<ProtectedRoute role="provider"><ProviderRequestsPage /></ProtectedRoute>} />
            <Route path="/post-food" element={<ProtectedRoute role="provider"><PostFoodPage /></ProtectedRoute>} />
            <Route path="/my-listings" element={<ProtectedRoute role="provider"><MyListingsPage /></ProtectedRoute>} />
            <Route path="/provider-wallet" element={<ProtectedRoute role="provider"><ProviderWalletPage /></ProtectedRoute>} />

            {/* Receiver-only routes */}
            <Route path="/receiver" element={<ProtectedRoute role="receiver"><ReceiverDashboard /></ProtectedRoute>} />
            <Route path="/my-orders" element={<ProtectedRoute role="receiver"><MyOrdersPage /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute role="receiver"><WalletPage /></ProtectedRoute>} />
            <Route path="/pickup-confirmation" element={<ProtectedRoute role="receiver"><PickupConfirmationPage /></ProtectedRoute>} />

            {/* Authenticated (any role) routes */}
            <Route path="/history" element={<ProtectedRoute><PickupHistoryPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
          <GlobalChatWidget />
        </div>
      </ThemeProvider>
    </Router>
  );
}
