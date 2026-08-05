import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { UtensilsCrossed, Menu, X, Heart, LayoutDashboard, ShoppingBag, Wallet, History, Settings, Bell, LogOut, Sun, Moon } from 'lucide-react';
import { cn } from './ui/utils';
import { useAuth } from '../context/AuthContext';
import { useTheme } from 'next-themes';

export function Header() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 10);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
    ];

    const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
            const offset = 80;
            const bodyRect = document.body.getBoundingClientRect().top;
            const elementRect = element.getBoundingClientRect().top;
            const elementPosition = elementRect - bodyRect;
            const offsetPosition = elementPosition - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    const go = (path: string) => { navigate(path); setIsMobileMenuOpen(false); };

    // Role-aware mobile navigation items
    const mobileNavItems = user ? [
        { icon: LayoutDashboard, label: 'Dashboard', path: user.role === 'provider' ? '/provider' : '/receiver' },
        { icon: ShoppingBag, label: user.role === 'provider' ? 'Requests' : 'My Orders', path: user.role === 'provider' ? '/provider-requests' : '/my-orders' },
        { icon: Wallet, label: 'Wallet', path: user.role === 'provider' ? '/provider-wallet' : '/wallet' },
        { icon: History, label: 'History', path: '/history' },
        { icon: Bell, label: 'Notifications', path: '/notifications' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ] : [];

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b',
                isScrolled
                    ? 'bg-background/80 backdrop-blur-md py-3 shadow-sm border-border'
                    : 'bg-transparent py-5 border-transparent'
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => navigate('/')}
                >
                    <div className="p-2 bg-green-600 rounded-lg group-hover:scale-110 transition-transform">
                        <UtensilsCrossed className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        LeftOverLink
                    </span>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-8">
                    {location.pathname === '/' && navLinks.map((link) => (
                        <a
                            key={link.name}
                            href={link.href}
                            onClick={(e) => scrollToSection(e, link.href)}
                            className="text-sm font-medium text-muted-foreground hover:text-green-600 transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-3">
                    {/* Dark mode toggle */}
                    <button
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        aria-label="Toggle dark mode"
                    >
                        {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-full font-bold"
                        onClick={() => navigate('/donate')}
                    >
                        <Heart className="w-4 h-4" />
                        Donate Now
                    </Button>
                    {user ? (
                        <div className="flex items-center gap-3">
                            {(user.role === 'receiver' || user.role === 'provider') && (
                                <Button
                                    variant="outline"
                                    className="rounded-full px-5 border-green-600/30 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-950/30 flex items-center gap-2 font-semibold"
                                    onClick={() => navigate(user.role === 'provider' ? '/provider-orders' : '/my-orders')}
                                >
                                    {user.role === 'provider' ? 'Shared Food' : 'My Orders'}
                                </Button>
                            )}
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6 shadow-sm"
                                onClick={() => navigate(user.role === 'provider' ? '/provider' : '/receiver')}
                            >
                                Dashboard
                            </Button>
                        </div>
                    ) : (
                        <>
                            <Button
                                variant="ghost"
                                className="text-sm font-medium"
                                onClick={() => navigate('/login')}
                            >
                                Sign In
                            </Button>
                            <Button
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6"
                                onClick={() => navigate('/signup')}
                            >
                                Get Started
                            </Button>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-foreground rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-background border-b overflow-hidden shadow-lg"
                    >
                        <div className="container mx-auto px-4 py-5 flex flex-col gap-2">
                            {/* Landing page links (only on homepage) */}
                            {location.pathname === '/' && navLinks.map((link) => (
                                <a
                                    key={link.name}
                                    href={link.href}
                                    onClick={(e) => scrollToSection(e, link.href)}
                                    className="text-base font-medium py-2.5 px-3 rounded-xl hover:bg-muted transition-colors"
                                >
                                    {link.name}
                                </a>
                            ))}

                            {/* Donate always visible */}
                            <button
                                onClick={() => go('/donate')}
                                className="flex items-center gap-3 py-2.5 px-3 rounded-xl hover:bg-green-50 dark:hover:bg-green-950/30 text-green-600 font-semibold transition-colors"
                            >
                                <Heart className="w-4 h-4" /> Donate Now
                            </button>

                            {user ? (
                                <>
                                    <div className="border-t border-muted/30 my-1 pt-2">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">
                                            Navigation
                                        </p>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            {mobileNavItems.map((item) => (
                                                <button
                                                    key={item.path}
                                                    onClick={() => go(item.path)}
                                                    className={cn(
                                                        'flex items-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-colors text-left',
                                                        location.pathname === item.path
                                                            ? 'bg-green-600 text-white'
                                                            : 'hover:bg-muted'
                                                    )}
                                                >
                                                    <item.icon className="w-4 h-4 shrink-0" />
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="border-t border-muted/30 pt-2 mt-1 flex items-center gap-2">
                                        <button
                                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                            className="flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-muted transition-colors flex-1 text-sm font-medium"
                                        >
                                            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                        </button>
                                        <button
                                            onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                            className="flex items-center gap-2 py-2.5 px-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 font-semibold transition-colors text-sm"
                                        >
                                            <LogOut className="w-4 h-4" /> Sign Out
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex flex-col gap-2 pt-2 border-t border-muted/30 mt-1">
                                    <Button variant="outline" className="w-full justify-center h-11" onClick={() => go('/login')}>
                                        Sign In
                                    </Button>
                                    <Button className="w-full justify-center bg-green-600 hover:bg-green-700 text-white h-11" onClick={() => go('/signup')}>
                                        Get Started
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
