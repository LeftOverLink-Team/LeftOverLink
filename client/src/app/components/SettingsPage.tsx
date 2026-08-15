import React, { useState, useRef, useEffect, useCallback, memo, ReactNode } from 'react';
import { useNavigate } from 'react-router';
import api from '../api/axios';
import { useTheme } from 'next-themes';
import { useLocation } from '../hooks/useLocation';
import {
  User, MapPin, Bell, Shield, Lock, Palette, HelpCircle,
  FileText, LogOut, ChevronRight, Camera, Mail, Phone,
  CheckCircle, Moon, Sun, Monitor, Accessibility, Loader2, RefreshCw,
  MessageSquare, AlertTriangle, Upload, Info, Laptop, Globe
} from 'lucide-react';
import { Button } from './ui/button';
import { ChatWidget, ChatWidgetHandle } from './ChatWidget';
import { Switch } from './ui/switch';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { AddressAutocomplete } from './AddressAutocomplete';

const SettingsSection = memo(({
  icon: Icon,
  title,
  description,
  children,
  id,
  activeSection,
  onToggle
}: {
  icon: any;
  title: any;
  description?: any;
  children: React.ReactNode | any;
  id: string;
  activeSection: string | null;
  onToggle: (id: string) => void;
}) => {
  const isExpanded = activeSection === id;

  return (
    <Card className="p-4">
      <button
        onClick={() => onToggle(isExpanded ? '' : id)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-lg">
            <Icon className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-medium">{title}</h3>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4">
          <Separator />
          {children}
        </div>
      )}
    </Card>
  );
});

SettingsSection.displayName = 'SettingsSection';

const SettingItem = memo(({
  label,
  description,
  children
}: {
  label: string;
  description?: string;
  children: React.ReactNode | any;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex-1">
      <Label className="text-sm font-medium">{label}</Label>
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
    <div>{children}</div>
  </div>
));

SettingItem.displayName = 'SettingItem';

export function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, updateUser, logout, token } = useAuth();
  const { updateSettings } = useSettings();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const chatRef = useRef<ChatWidgetHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [feedback, setFeedback] = useState({ text: '', screenshot: null as File | null });
  const [report, setReport] = useState({
    description: '',
    steps: '',
    screenshot: null as File | null,
    includeDeviceInfo: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User settings state — start empty, load from storage/API
  const [settings, setSettings] = useState<any>({
    name: '',
    email: '',
    phone: '',
    role: '',
    verified: false,
    profileImage: '',
  });

  const { detectLocation, isDetecting } = useLocation();

  // Load settings from API and user context
  useEffect(() => {
    (async () => {
      try {
        if (!token) return;
        // Load profile from /auth/me
        const profileRes = await api.get('/auth/me');
        if (profileRes.data) {
          const userData = profileRes.data;
          setSettings((prev: any) => ({
            ...prev,
            name: userData.name || '',
            email: userData.email || '',
            role: userData.role || '',
            verified: userData.verified || false,
          }));
        }
        // Load location settings from /auth/settings (MongoDB)
        const settingsRes = await api.get('/auth/settings');
        if (settingsRes.data) {
          const s = settingsRes.data;
          setSettings((prev: any) => ({
            ...prev,
            lat: s.lat || prev.lat,
            lng: s.lng || prev.lng,
            address: s.address || prev.address,
            maxDistance: s.maxDistance || prev.maxDistance,
            notificationsEnabled: s.notificationsEnabled ?? prev.notificationsEnabled,
          }));
        }
      } catch (err) {
        // ignore — fall back on user context
      }
    })();

    // Fallback from user context
    if (user) {
      setSettings((prev: any) => ({
        ...prev,
        role: prev.role || user.role || '',
        name: prev.name || user.name || '',
      }));
    }
  }, [token, user]);

  const saveToStorage = (newSettings: any) => {
    updateSettings(newSettings);
    updateUser({ name: newSettings.name, role: newSettings.role });
  };

  const handleDetectLocation = async () => {
    const location = await detectLocation();
    if (location) {
      const newSettings = {
        ...settings,
        lat: location.lat,
        lng: location.lng,
        address: location.address
      };
      setSettings(newSettings);
      updateSettings(newSettings);
      updateUser({ name: newSettings.name, role: newSettings.role });
      // Persist location to MongoDB
      try {
        await api.put('/auth/settings', { lat: location.lat, lng: location.lng, address: location.address });
      } catch (err) { console.error('Failed to save location:', err); }
      toast.success('Location updated successfully', {
        description: `Detected: ${location.address}`
      });
    }
  };

  const handleLogout = () => {
    toast.success('Logged out successfully');
    logout();
  };

  const handleChatWithSupport = () => {
    chatRef.current?.open();
  };

  const handleSave = async () => {
    updateSettings(settings);
    updateUser({ name: settings.name, role: settings.role });
    // Persist location settings to MongoDB
    try {
      await api.put('/auth/settings', {
        lat: settings.lat,
        lng: settings.lng,
        address: settings.address,
        maxDistance: settings.alertRadius ? parseInt(settings.alertRadius) : undefined,
      });
    } catch (err) { console.error('Failed to save settings:', err); }
    toast.success('Settings saved successfully');
  };

  const getDeviceInfo = () => {
    const ua = navigator.userAgent;
    let browser = "Unknown Browser";
    if (ua.indexOf("Firefox") > -1) browser = "Firefox";
    else if (ua.indexOf("Chrome") > -1) browser = "Chrome";
    else if (ua.indexOf("Safari") > -1) browser = "Safari";
    else if (ua.indexOf("Edge") > -1) browser = "Edge";

    let os = "Unknown OS";
    if (ua.indexOf("Win") > -1) os = "Windows";
    else if (ua.indexOf("Mac") > -1) os = "macOS";
    else if (ua.indexOf("Linux") > -1) os = "Linux";
    else if (ua.indexOf("Android") > -1) os = "Android";
    else if (ua.indexOf("iPhone") > -1) os = "iOS";

    return {
      browser,
      os,
      version: "1.2.0-beta", // Mock app version
      userAgent: ua
    };
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.text.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setIsSubmitting(true);
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setShowFeedbackDialog(false);
    setFeedback({ text: '', screenshot: null });
    toast.success("Feedback sent!", {
      description: "Thank you for helping us improve."
    });
  };

  const handleReportSubmit = async () => {
    if (!report.description.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    setIsSubmitting(true);
    const deviceInfo = report.includeDeviceInfo ? getDeviceInfo() : null;

    // Mock API call
    console.log("Submitting report:", { ...report, deviceInfo });
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsSubmitting(false);
    setShowReportDialog(false);
    setReport({ description: '', steps: '', screenshot: null, includeDeviceInfo: true });
    toast.success("Report submitted", {
      description: "Our team will investigate this issue."
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size too large", { description: "Maximum size is 5MB" });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newSettings = { ...settings, profileImage: base64String };
        setSettings(newSettings);
        saveToStorage(newSettings);
        toast.success("Profile picture updated");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleSection = useCallback((id: string) => {
    setActiveSection((prev) => prev === id ? null : id);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              ← Back
            </Button>
            <h1 className="text-xl font-bold">Settings</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-4 pb-20">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={settings.profileImage} />
                <AvatarFallback className="bg-green-100 text-green-700 text-xl">
                  {settings.name ? settings.name.split(' ').map((n: string) => n[0]).join('') : 'LL'}
                </AvatarFallback>
              </Avatar>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                aria-label="Upload profile image"
                title="Upload profile image"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 bg-green-600 rounded-full text-white hover:bg-green-700 transition-colors shadow-lg"
                aria-label="Change profile picture"
                title="Change profile picture"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">{settings.name || 'User'}</h2>
                {settings.verified && (
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">{settings.role || 'No role set'}</p>
              <p className="text-xs text-muted-foreground mt-1">{settings.email || 'No email'}</p>
            </div>
          </div>
        </Card>

        {/* Profile Settings */}
        <SettingsSection
          id="profile"
          icon={User}
          title="Profile Settings"
          description="Manage your personal information"
          activeSection={activeSection}
          onToggle={handleToggleSection}
        >
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={settings.name || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setSettings((prev: any) => ({ ...prev, name: value }));
                }}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={settings.email || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSettings((prev: any) => ({ ...prev, email: value }));
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  value={settings.phone || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSettings((prev: any) => ({ ...prev, phone: value }));
                  }}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Role</Label>
              <Select
                value={settings.role || ''}
                onValueChange={async (value) => {
                  try {
                    const res = await api.put('/auth/role', { role: value });
                    const { token: newToken, user: updatedUser } = res.data;

                    // Store the fresh JWT so all subsequent API calls use the new role
                    localStorage.setItem('token', newToken);
                    // Also update the in-memory Axios default header immediately —
                    // the request interceptor reads localStorage but only on the next
                    // call; setting the default here closes that race window.
                    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

                    const newSettings = { ...settings, role: value };
                    setSettings(newSettings);
                    saveToStorage(newSettings);

                    // Update AuthContext with the new role from the server response
                    if (user) {
                      updateUser({ role: updatedUser.role });
                    }

                    toast.success(`Role switched to ${value === 'provider' ? 'Provider' : 'Receiver'}`);
                    navigate(value === 'provider' ? '/provider' : '/receiver');
                  } catch (err: any) {
                    const msg = err?.response?.data?.error?.message || 'Failed to switch role. Please try again.';
                    toast.error(msg);
                    // Revert the dropdown to the current server role
                    setSettings((prev: any) => ({ ...prev, role: user?.role || prev.role }));
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="receiver">Food Receiver</SelectItem>
                  <SelectItem value="provider">Food Provider</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Changing your role will redirect you to the appropriate dashboard.
              </p>
            </div>
            <Button onClick={handleSave} className="w-full bg-green-600 hover:bg-green-700">
              Save Profile
            </Button>
          </div>
        </SettingsSection>

        {/* Location Settings */}
        <SettingsSection
          id="location"
          icon={MapPin}
          title="Location Settings"
          description="Manage how we use your location"
          activeSection={activeSection}
          onToggle={handleToggleSection}
        >
          <div className="space-y-4">
            <SettingItem
              label="Auto-detect Location"
              description="Automatically use your current location"
            >
              <Switch
                checked={settings.autoLocation ?? false}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, autoLocation: checked };
                  setSettings(newSettings);
                  saveToStorage(newSettings);
                  if (checked) handleDetectLocation();
                }}
              />
            </SettingItem>

            <div className="p-4 bg-muted/50 rounded-lg border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Current Location</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDetectLocation}
                  disabled={isDetecting}
                  className="h-8 gap-2 text-xs"
                >
                  {isDetecting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  Detect Now
                </Button>
              </div>
              <div className="text-sm font-bold text-foreground">
                {settings.address || 'No location set'}
              </div>
              {settings.lat && settings.lng && settings.lat !== 0 && settings.lng !== 0 && (
                <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                  {settings.lat.toFixed(4)}°, {settings.lng.toFixed(4)}°
                </div>
              )}

              <div className="mt-4">
                <Label htmlFor="manualAddress" className="text-xs text-muted-foreground uppercase tracking-wider font-bold mb-2 block">Manual Location Search</Label>
                <div className="relative group z-50">
                  <AddressAutocomplete
                    defaultValue={settings.address || ''}
                    onSelect={(loc) => {
                      const newSettings = {
                        ...settings,
                        autoLocation: false,
                        address: loc.display_name,
                        lat: loc.lat,
                        lng: loc.lon,
                      };
                      setSettings(newSettings);
                      saveToStorage(newSettings);
                      toast.success('Location updated successfully', {
                        description: loc.display_name,
                      });
                    }}
                    placeholder="Search for your street, city, or area..."
                    className="w-full"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 italic">
                  Search for your location if auto-detection fails or is inaccurate.
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="radius">Alert Radius</Label>
              <Select
                value={settings.alertRadius || '10'}
                onValueChange={(value) => {
                  const newSettings = { ...settings, alertRadius: value };
                  setSettings(newSettings);
                  saveToStorage(newSettings);
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select radius" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 km</SelectItem>
                  <SelectItem value="5">5 km</SelectItem>
                  <SelectItem value="10">10 km</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Get alerts for food within this radius
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Notification Settings */}
        <SettingsSection
          id="notifications"
          icon={Bell}
          title="Notifications"
          description="Control your notification preferences"
          activeSection={activeSection}
          onToggle={handleToggleSection}
        >
          <div className="space-y-4">
            <SettingItem
              label="Nearby Food Alerts"
              description="Get notified when food is posted nearby"
            >
              <Switch
                checked={settings.nearbyAlerts ?? false}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, nearbyAlerts: checked };
                  setSettings(newSettings);
                  saveToStorage(newSettings);
                }}
              />
            </SettingItem>

            <SettingItem
              label="Expiry Reminders"
              description="Reminders before food expires"
            >
              <Switch
                checked={settings.expiryReminders ?? false}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, expiryReminders: checked };
                  setSettings(newSettings);
                  saveToStorage(newSettings);
                }}
              />
            </SettingItem>

            <SettingItem
              label="Pickup Notifications"
              description="Updates on pickup confirmations"
            >
              <Switch
                checked={settings.pickupNotifications ?? false}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, pickupNotifications: checked };
                  setSettings(newSettings);
                  saveToStorage(newSettings);
                }}
              />
            </SettingItem>

            <Separator />

            <SettingItem
              label="Push Notifications"
            >
              <Switch
                checked={settings.pushNotifications ?? false}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, pushNotifications: checked };
                  setSettings(newSettings);
                  saveToStorage(newSettings);
                }}
              />
            </SettingItem>

            <SettingItem
              label="Email Notifications"
            >
              <Switch
                checked={settings.emailNotifications ?? false}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, emailNotifications: checked };
                  setSettings(newSettings);
                  saveToStorage(newSettings);
                }}
              />
            </SettingItem>
          </div>
        </SettingsSection>

        {/* Privacy & Safety */}
        <SettingsSection
          id="privacy"
          icon={Shield}
          title="Privacy & Safety"
          description="Control your privacy settings"
          activeSection={activeSection}
          onToggle={handleToggleSection}
        >
          <div className="space-y-4">
            <SettingItem
              label="Hide Exact Location"
              description="Only show approximate location until pickup confirmed"
            >
              <Switch
                checked={settings.hideLocation ?? false}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, hideLocation: checked };
                  setSettings(newSettings);
                  saveToStorage(newSettings);
                }}
              />
            </SettingItem>

            {settings.role === 'receiver' && (
              <SettingItem
                label="NGO Priority"
                description="Give priority to verified NGOs"
              >
                <Switch
                  checked={settings.ngoPriority ?? false}
                  onCheckedChange={(checked) => {
                    const newSettings = { ...settings, ngoPriority: checked };
                    setSettings(newSettings);
                    saveToStorage(newSettings);
                  }}
                />
              </SettingItem>
            )}

            <Button variant="outline" className="w-full">
              Block/Report Users
            </Button>
          </div>
        </SettingsSection>

        {/* Security */}
        <SettingsSection
          id="security"
          icon={Lock}
          title="Security"
          description="Manage your account security"
          activeSection={activeSection}
          onToggle={handleToggleSection}
        >
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              Change Password
            </Button>
            <Button variant="outline" className="w-full justify-start">
              Forgot Password
            </Button>
            <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
              Logout from All Devices
            </Button>
          </div>
        </SettingsSection>

        {/* Theme */}
        <SettingsSection
          id="theme"
          icon={Palette}
          title="Appearance"
          description="Customize how the app looks"
          activeSection={activeSection}
          onToggle={handleToggleSection}
        >
          <div className="space-y-4">
            <div>
              <Label>Theme</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                  className="flex-col h-auto py-3"
                >
                  <Sun className="w-5 h-5 mb-1" />
                  <span className="text-xs">Light</span>
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                  className="flex-col h-auto py-3"
                >
                  <Moon className="w-5 h-5 mb-1" />
                  <span className="text-xs">Dark</span>
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  onClick={() => setTheme('system')}
                  className="flex-col h-auto py-3"
                >
                  <Monitor className="w-5 h-5 mb-1" />
                  <span className="text-xs">System</span>
                </Button>
              </div>
            </div>

            <SettingItem
              label="Reduce Motion"
              description="Minimize animations and effects"
            >
              <Switch
                checked={settings.reduceMotion ?? false}
                onCheckedChange={(checked) => {
                  const newSettings = { ...settings, reduceMotion: checked };
                  setSettings(newSettings);
                  saveToStorage(newSettings);
                }}
              />
            </SettingItem>
          </div>
        </SettingsSection>

        {/* Help & Support */}
        <SettingsSection
          id="help"
          icon={HelpCircle}
          title="Help & Support"
          description="Get help and send feedback"
          activeSection={activeSection}
          onToggle={handleToggleSection}
        >
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/faq')}
            >
              FAQ
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleChatWithSupport}
            >
              Chat with Support
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setShowFeedbackDialog(true)}
            >
              <MessageSquare className="w-4 h-4" />
              Send Feedback
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setShowReportDialog(true)}
            >
              <AlertTriangle className="w-4 h-4" />
              Report an Issue
            </Button>
          </div>
        </SettingsSection>

        {/* Legal */}
        <SettingsSection
          id="legal"
          icon={FileText}
          title="Legal"
          description="Terms and privacy information"
          activeSection={activeSection}
          onToggle={handleToggleSection}
        >
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/terms')}
            >
              Terms & Conditions
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/privacy')}
            >
              Privacy Policy
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => navigate('/disclaimer')}
            >
              Food Hygiene Disclaimer
            </Button>
          </div>
        </SettingsSection>

        {/* Logout */}
        <Card className="p-4">
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </Card>

        {/* App Version */}
        <div className="text-center text-xs text-muted-foreground py-4">
          LeftOverLink v1.0.0
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Chat Widget */}
      <ChatWidget ref={chatRef} />

      {/* Send Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-[425px] bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-green-600" />
              Send Feedback
            </DialogTitle>
            <DialogDescription>
              Share your thoughts, suggestions, or experience with us.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Your Message</Label>
              <Textarea
                id="feedback"
                placeholder="What do you like? What could be better?"
                className="min-h-[120px]"
                value={feedback.text}
                onChange={(e) => setFeedback({ ...feedback, text: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Screenshot (Optional)</Label>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed"
                  onClick={() => document.getElementById('feedback-file')?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {feedback.screenshot ? feedback.screenshot.name : 'Choose Image'}
                </Button>
                <input
                  id="feedback-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFeedback({ ...feedback, screenshot: e.target.files?.[0] || null })}
                  aria-label="Upload feedback screenshot"
                  title="Upload feedback screenshot"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeedbackDialog(false)}>Cancel</Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleFeedbackSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Report Issue Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-[500px] bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Report an Issue
            </DialogTitle>
            <DialogDescription>
              Help us fix bugs by providing more details about the problem.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
            <div className="space-y-2">
              <Label htmlFor="issue-desc">Describe the issue</Label>
              <Textarea
                id="issue-desc"
                placeholder="What happened? What were you trying to do?"
                className="min-h-[80px]"
                value={report.description}
                onChange={(e) => setReport({ ...report, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="repro-steps">Steps to reproduce</Label>
              <Textarea
                id="repro-steps"
                placeholder="1. Go to... 2. Click on... 3. See error..."
                className="min-h-[80px] text-sm"
                value={report.steps}
                onChange={(e) => setReport({ ...report, steps: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Screenshot / Screen Recording</Label>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-dashed"
                onClick={() => document.getElementById('report-file')?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                {report.screenshot ? report.screenshot.name : 'Upload File'}
              </Button>
              <input
                id="report-file"
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => setReport({ ...report, screenshot: e.target.files?.[0] || null })}
                aria-label="Upload report attachment"
                title="Upload report attachment"
              />
            </div>

            <div className="p-3 bg-muted/50 rounded-lg border text-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-medium">
                  <Info className="w-3 h-3 text-blue-500" />
                  Device Information
                </div>
                <Switch
                  checked={report.includeDeviceInfo}
                  onCheckedChange={(checked) => setReport({ ...report, includeDeviceInfo: checked })}
                />
              </div>
              {report.includeDeviceInfo && (
                <div className="grid grid-cols-2 gap-2 text-muted-foreground mt-1 tabular-nums">
                  <div className="flex items-center gap-1">
                    <Laptop className="w-3 h-3" />
                    {getDeviceInfo().os}
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {getDeviceInfo().browser}
                  </div>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>Cancel</Button>
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleReportSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
