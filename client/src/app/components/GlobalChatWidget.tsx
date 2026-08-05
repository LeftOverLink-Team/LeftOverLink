import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, ChevronLeft, Phone, Video, Send, CheckCheck, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router';
import { chatSyncService, ChatMessage } from '../../shared/chatSync';
import api from '../api/axios';



export function GlobalChatWidget() {
    const { user } = useAuth();
    const location = useLocation();

    const [isOpen, setIsOpen] = useState(false);
    const [providers, setProviders] = useState<any[]>([]);

    // activeChat references a specific provider connection
    const [activeChat, setActiveChat] = useState<{ name: string, orderId: string } | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const [isMapExpanded, setIsMapExpanded] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const constraintsRef = useRef<HTMLDivElement>(null);

    // Initial check for unread messages on mount
    useEffect(() => {
        const checkUnread = () => {
            const unreadStatus = localStorage.getItem('chat_has_unread');
            setHasUnreadMessages(unreadStatus === 'true');
        };
        const handleMapExpansion = (e: any) => {
            setIsMapExpanded(e.detail);
        };

        checkUnread();

        // Listen for storage events across tabs or from other components
        window.addEventListener('storage', checkUnread);

        // Custom event for same-window updates
        window.addEventListener('chat_unread_update', checkUnread);
        window.addEventListener('map_expanded', handleMapExpansion);

        return () => {
            window.removeEventListener('storage', checkUnread);
            window.removeEventListener('chat_unread_update', checkUnread);
            window.removeEventListener('map_expanded', handleMapExpansion);
        }
    }, []);

    // Clear unread status when chat is opened
    useEffect(() => {
        if (isOpen) {
            setHasUnreadMessages(false);
            localStorage.setItem('chat_has_unread', 'false');
            window.dispatchEvent(new Event('chat_unread_update'));
        }
    }, [isOpen]);

    useEffect(() => {
        if (!user) return;

        const updateContactsAndPoll = async () => {
            try {
                const endpoint = user.role === 'receiver' ? '/orders/mine' : '/orders/provider';
                const res = await api.get(endpoint);
                const orders: any[] = res.data;

                const contactMap = new Map();
                orders.forEach((order: any) => {
                    const contactName = user.role === 'receiver' ? order.providerName : order.receiverName;
                    const contactId = user.role === 'receiver' ? order.providerId : order.receiverId;
                    if (contactName && order.id && !contactMap.has(contactName)) {
                        contactMap.set(contactName, {
                            id: contactId || order.id,
                            name: contactName,
                            lastActive: order.pickupTime ? new Date(order.pickupTime) : new Date(order.createdAt || Date.now()),
                            orderId: order.id
                        });
                    }
                });

                const contacts = Array.from(contactMap.values())
                    .sort((a, b) => b.lastActive.getTime() - a.lastActive.getTime());
                setProviders(contacts);

                const orderIds = contacts.map(c => c.orderId);
                if (orderIds.length > 0) {
                    chatSyncService.startGlobalPolling(orderIds);
                } else {
                    chatSyncService.stopGlobalPolling();
                }
            } catch (err) {
                console.error('Failed to load contacts:', err);
            }
        };

        updateContactsAndPoll();
        const interval = setInterval(updateContactsAndPoll, 30000);

        return () => {
            chatSyncService.stopGlobalPolling();
            clearInterval(interval);
        };
    }, [user]);

    // Load messages when a chat is selected
    useEffect(() => {
        if (!activeChat) return;

        const loadMessages = () => {
            setMessages(chatSyncService.getMessages(activeChat.orderId));
        };

        // If cache is currently empty, fetching will be slightly delayed by startPolling.
        // We can force an immediate explicit fetch here to guarantee the UI has data.
        chatSyncService.fetchMessagesExplicitly(activeChat.orderId).then((data) => {
            if (data) setMessages(data);
        });

        chatSyncService.startPolling(activeChat.orderId);
        loadMessages();

        // Listen for internal service updates
        const handleLocalUpdate = (e: any) => {
            if (e.detail?.orderId === activeChat.orderId) {
                loadMessages();
            }
        };

        window.addEventListener('local-chat-update', handleLocalUpdate);

        return () => {
            chatSyncService.stopPolling(activeChat.orderId);
            window.removeEventListener('local-chat-update', handleLocalUpdate);
        };
    }, [activeChat]);

    // Auto-scroll
    useEffect(() => {
        if (!showScrollDown) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim() || !activeChat) return;

        const isProviderRole = user?.role === 'provider';

        chatSyncService.sendMessage(
            activeChat.orderId,
            isProviderRole ? 'provider' : 'receiver',
            isProviderRole ? 'provider' : 'receiver',
            inputText.trim()
        );

        setInputText('');
    };

    // Corner snapping logic
    type Corner = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    const [corner, setCorner] = useState<Corner>('bottom-right');
    const isDragging = useRef(false);

    const cornerPositionClasses: Record<Corner, string> = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-6 right-6',
        'top-left': 'top-6 left-6',
    };

    const handleDragEnd = (_: any, info: any) => {
        const { point } = info;
        const midX = window.innerWidth / 2;
        const midY = window.innerHeight / 2;

        const newCorner: Corner =
            point.x < midX && point.y < midY ? 'top-left' :
                point.x >= midX && point.y < midY ? 'top-right' :
                    point.x < midX && point.y >= midY ? 'bottom-left' :
                        'bottom-right';

        setCorner(newCorner);
        // Mark as dragged so we can suppress the click
        isDragging.current = true;
        setTimeout(() => { isDragging.current = false; }, 50);
    };

    const handleFabClick = () => {
        if (isDragging.current) return; // Suppress click after drag
        setIsOpen(true);
    };

    // Hide temporarily if map is expanded or if explicitly on the standalone Map page
    if (!user || isMapExpanded || location.pathname === '/provider/map') return null;

    const isProviderView = user.role === 'provider';

    // Determine flex alignment for the chat drawer based on corner
    const chatAlignClass =
        corner.includes('right') ? 'items-end' : 'items-start';

    return (
        <>
            {/* Floating Action Button — fixed to corner, draggable to snap */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.div
                        drag
                        dragMomentum={false}
                        dragElastic={0.15}
                        dragConstraints={{ top: 0, left: 0, right: 0, bottom: 0 }}
                        onDragEnd={handleDragEnd}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className={`fixed ${cornerPositionClasses[corner]} z-[10000] cursor-grab active:cursor-grabbing pointer-events-auto`}
                    >
                        <Button
                            onClick={handleFabClick}
                            className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-2xl flex items-center justify-center hover:scale-110 transition-transform relative group"
                        >
                            <MessageCircle className="w-8 h-8" />

                            {/* Notification Badge */}
                            {hasUnreadMessages && (
                                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950 animate-pulse" />
                            )}
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Drawer / Overlay — anchored near the corner */}
            <AnimatePresence>
                {isOpen && (
                    <div className={`fixed ${cornerPositionClasses[corner]} z-[10000] pointer-events-auto flex flex-col ${chatAlignClass}`}>
                        <motion.div
                            initial={{ opacity: 0, y: corner.includes('bottom') ? 200 : -200, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: corner.includes('bottom') ? 200 : -200, scale: 0.9 }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="w-[300px] sm:w-[380px] h-[600px] max-h-[85vh] bg-white dark:bg-zinc-950 rounded-3xl shadow-2xl border border-border/50 flex flex-col overflow-hidden"
                        >

                            {/* 1. Header Area */}
                            <div className="bg-green-600 text-white p-4 flex items-center justify-between shrink-0 shadow-md z-10">
                                <div className="flex items-center gap-3">
                                    {activeChat && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-white hover:bg-green-700 w-8 h-8 rounded-full"
                                            onClick={() => setActiveChat(null)}
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </Button>
                                    )}
                                    <div>
                                        <h3 className="font-bold text-lg leading-tight">
                                            {activeChat ? activeChat.name : 'Messages'}
                                        </h3>
                                        {activeChat && (
                                            <p className="text-xs text-green-100 font-medium">
                                                {isTyping ? 'typing...' : 'Online'}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {activeChat && (
                                        <>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-white hover:bg-green-700">
                                                <Phone className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-white hover:bg-green-700">
                                                <Video className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="w-8 h-8 rounded-full text-white hover:bg-green-700 hover:text-red-300"
                                        onClick={() => {
                                            setIsOpen(false);
                                            // Optional: keep strict chat state, or reset:
                                            // setTimeout(() => setActiveChat(null), 300)
                                        }}
                                    >
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* 2. Main Content Area — outer wrapper is relative so the arrow can be positioned inside it */}
                            <div className="flex-1 relative overflow-hidden flex flex-col">
                                <div
                                    className="flex-1 bg-slate-50 dark:bg-zinc-900 overflow-y-auto flex flex-col"
                                    onScroll={(e) => {
                                        if (!activeChat) return;
                                        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                                        setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
                                    }}
                                >
                                    {!activeChat ? (
                                        /* Provider List View */
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-2 space-y-1"
                                        >
                                            {providers.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center p-8 text-center h-full mt-20">
                                                    <MessageCircle className="w-12 h-12 text-muted-foreground/30 mb-4" />
                                                    <p className="text-muted-foreground font-medium">No active conversations.</p>
                                                    <p className="text-xs text-muted-foreground mt-2">Claim food orders to start chatting with providers!</p>
                                                </div>
                                            ) : (
                                                providers.map((provider) => (
                                                    <div
                                                        key={provider.orderId}
                                                        onClick={() => setActiveChat({ name: provider.name, orderId: provider.orderId })}
                                                        className="flex items-center gap-4 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors"
                                                    >
                                                        <div className="relative">
                                                            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-500 font-bold text-xl">
                                                                {provider.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-baseline mb-0.5">
                                                                <h4 className="font-bold truncate text-[15px]">{provider.name}</h4>
                                                                <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                                                    {formatDistanceToNow(provider.lastActive, { addSuffix: true })}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground truncate font-medium">
                                                                Tap to open chat history
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </motion.div>
                                    ) : (
                                        /* Active Chat Messages View */
                                        <motion.div
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="p-4 space-y-4"
                                        >
                                            <div className="text-center text-xs text-muted-foreground my-4 font-black uppercase tracking-widest bg-black/5 dark:bg-white/5 rounded-full py-1 px-3 w-max mx-auto">
                                                Today
                                            </div>

                                            <AnimatePresence initial={false}>
                                                {messages.map((msg) => {
                                                    const isProviderRole = user?.role === 'provider';
                                                    const isMe = msg.senderRole === (isProviderRole ? 'provider' : 'receiver');
                                                    return (
                                                        <motion.div
                                                            key={msg.id}
                                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            <div className={`max-w-[80%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                                <div
                                                                    className={`px-4 py-2.5 shadow-sm text-[15px] leading-relaxed ${isMe
                                                                        ? 'bg-green-600 text-white rounded-2xl rounded-tr-sm'
                                                                        : 'bg-white dark:bg-zinc-800 border border-border/50 text-foreground rounded-2xl rounded-tl-sm'
                                                                        }`}
                                                                >
                                                                    {msg.text}
                                                                </div>
                                                                <div className="flex items-center gap-1 mt-1 px-1">
                                                                    <span className="text-[10px] text-muted-foreground/70 font-semibold">
                                                                        {format(new Date(msg.timestamp), 'h:mm a')}
                                                                    </span>
                                                                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-green-600" />}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    );
                                                })}
                                            </AnimatePresence>

                                            {/* Typing Indicator */}
                                            {isTyping && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="flex justify-start"
                                                >
                                                    <div className="bg-white dark:bg-zinc-800 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3.5 shadow-sm flex items-center gap-1.5">
                                                        <motion.div className="w-1.5 h-1.5 bg-green-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                                                        <motion.div className="w-1.5 h-1.5 bg-green-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                                                        <motion.div className="w-1.5 h-1.5 bg-green-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                                                    </div>
                                                </motion.div>
                                            )}

                                            <div ref={messagesEndRef} />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Auto Scroll Button — absolute inside the outer non-scrolling wrapper */}
                                <AnimatePresence>
                                    {activeChat && showScrollDown && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                            className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none z-50"
                                        >
                                            <Button
                                                type="button"
                                                onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                                className="rounded-full shadow-lg bg-green-600/90 backdrop-blur-sm hover:bg-green-700 text-white pointer-events-auto h-9 w-9 p-0 flex items-center justify-center transition-transform hover:scale-110"
                                            >
                                                <ChevronDown className="h-5 w-5" />
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* 3. Input Area (Only visible in Active Chat) */}
                            <AnimatePresence>
                                {activeChat && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 20 }}
                                        className="bg-white dark:bg-zinc-950 border-t p-3 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.03)]"
                                    >
                                        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                                            <Input
                                                value={inputText}
                                                onChange={(e) => setInputText(e.target.value)}
                                                placeholder="Message..."
                                                className="flex-1 rounded-full bg-slate-100 dark:bg-zinc-900 border-none h-12 px-5 text-[15px] focus-visible:ring-1 focus-visible:ring-green-500"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={!inputText.trim()}
                                                size="icon"
                                                className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md disabled:opacity-50 transition-all hover:scale-105 active:scale-95 shrink-0"
                                            >
                                                <Send className="w-5 h-5 ml-1" />
                                            </Button>
                                        </form>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
