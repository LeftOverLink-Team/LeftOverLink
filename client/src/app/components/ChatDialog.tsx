import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, X, Phone, Video, CheckCheck, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { chatSyncService, ChatMessage } from '../../shared/chatSync';

interface ChatDialogProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    providerName: string; // Used as the counterparty name
    isProviderView?: boolean;
}


export function ChatDialog({ isOpen, onClose, orderId, providerName, isProviderView = false }: ChatDialogProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showScrollDown, setShowScrollDown] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const loadMessages = () => {
            setMessages(chatSyncService.getMessages(orderId));
        };

        // If cache is empty, fetch explicit so it renders instantly
        chatSyncService.fetchMessagesExplicitly(orderId).then((data) => {
            if (data) setMessages(data);
        });

        // Start background fetching latency loop
        chatSyncService.startPolling(orderId);
        loadMessages();

        // Listen for internal service updates (when polling finds new data)
        const handleLocalUpdate = (e: any) => {
            if (e.detail?.orderId === orderId) {
                loadMessages();
            }
        };

        window.addEventListener('local-chat-update', handleLocalUpdate);

        // Focus input after open
        setTimeout(() => inputRef.current?.focus(), 300);

        return () => {
            chatSyncService.stopPolling(orderId);
            window.removeEventListener('local-chat-update', handleLocalUpdate);
        };
    }, [isOpen, orderId]);

    useEffect(() => {
        // Auto-scroll to bottom if we are near the bottom
        if (!showScrollDown) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const handleSendMessage = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        chatSyncService.sendMessage(
            orderId,
            isProviderView ? 'provider' : 'receiver',
            isProviderView ? 'provider' : 'receiver',
            inputText.trim()
        );

        setInputText('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[400px] w-full p-0 overflow-hidden rounded-3xl border-border/50 shadow-2xl h-[80vh] sm:h-[600px] flex flex-col bg-slate-50 dark:bg-zinc-950">
                <VisuallyHidden.Root>
                    <DialogTitle>Chat with {providerName}</DialogTitle>
                    <DialogDescription>Chat dialogue with {providerName}</DialogDescription>
                </VisuallyHidden.Root>

                {/* Chat Header */}
                <div className="bg-white dark:bg-zinc-900 border-b p-4 flex items-center justify-between shrink-0 z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-700 dark:text-green-500 font-bold text-lg">
                                {providerName.charAt(0).toUpperCase()}
                            </div>
                            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-zinc-900 rounded-full"></span>
                        </div>
                        <div>
                            <h3 className="font-bold leading-tight flex items-center gap-1">
                                {providerName}
                            </h3>
                            <p className="text-xs text-green-600 font-medium tracking-tight">
                                {isTyping ? 'typing...' : 'Online'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-green-600">
                            <Phone className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-green-600">
                            <Video className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full text-muted-foreground hover:text-red-500" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Chat Messages Area */}
                <div className="flex-1 relative overflow-hidden flex flex-col">
                    <div
                        className="flex-1 overflow-y-auto p-4 space-y-4"
                        onScroll={(e) => {
                            const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                            setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
                        }}
                    >
                        <div className="text-center text-xs text-muted-foreground my-4 font-medium uppercase tracking-widest">
                            Today
                        </div>

                        <AnimatePresence initial={false}>
                            {messages.map((msg) => {
                                const isMe = msg.senderRole === (isProviderView ? 'provider' : 'receiver');
                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`max-w-[75%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            <div
                                                className={`px-4 py-2.5 rounded-2xl shadow-sm text-sm ${isMe
                                                    ? 'bg-green-600 text-white rounded-tr-sm'
                                                    : 'bg-white dark:bg-zinc-800 border border-border/50 text-foreground rounded-tl-sm'
                                                    }`}
                                            >
                                                {msg.text}
                                            </div>
                                            <div className="flex items-center gap-1 mt-1 px-1">
                                                <span className="text-[10px] text-muted-foreground font-medium">
                                                    {format(new Date(msg.timestamp), 'h:mm a')}
                                                </span>
                                                {isMe && <CheckCheck className="w-3 h-3 text-green-600" />}
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
                                <div className="bg-white dark:bg-zinc-800 border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1">
                                    <motion.div className="w-2 h-2 bg-green-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                                    <motion.div className="w-2 h-2 bg-green-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                                    <motion.div className="w-2 h-2 bg-green-500 rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Auto Scroll Button */}
                    <AnimatePresence>
                        {showScrollDown && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none"
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

                {/* Chat Input Area */}
                <div className="bg-white dark:bg-zinc-900 border-t p-3 shrink-0">
                    <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Input
                            ref={inputRef}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 rounded-full bg-slate-100 dark:bg-zinc-950 border-none h-12 px-5 focus-visible:ring-1 focus-visible:ring-green-500"
                        />
                        <Button
                            type="submit"
                            disabled={!inputText.trim()}
                            size="icon"
                            className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-700 text-white shadow-md disabled:opacity-50 transition-transform active:scale-95 shrink-0"
                        >
                            <Send className="w-5 h-5 ml-1" />
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
