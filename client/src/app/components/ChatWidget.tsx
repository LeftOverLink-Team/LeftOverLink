import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useNavigate } from 'react-router';
import {
    MessageCircle,
    X,
    Send,
    Bot,
    User,
    Minimize2,
    ExternalLink,
    Clock,
    Shield,
    FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { motion, AnimatePresence } from 'motion/react';
import { Separator } from './ui/separator';

interface Message {
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: Date;
    quickActions?: QuickAction[];
}

interface QuickAction {
    label: string;
    action: () => void;
    icon?: React.ReactNode;
}

// Mock AI responses based on keywords
const getAIResponse = (userMessage: string, navigate: any): Message => {
    const message = userMessage.toLowerCase();

    let response = '';
    let quickActions: QuickAction[] = [];

    if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
        response = "Hello! 👋 I'm your LeftOverLink AI assistant. How can I help you today? I can assist with pickups, listings, account settings, or answer questions about food safety.";
        quickActions = [
            { label: 'View FAQ', action: () => navigate('/faq') },
            { label: 'Contact Support', action: () => navigate('/contact-support') }
        ];
    } else if (message.includes('pickup') || message.includes('claim')) {
        response = "To claim food: Browse the map dashboard, find food you need, and click 'Claim Pickup'. You'll get the provider's contact details. Remember to confirm pickup and rate your experience afterward!";
        quickActions = [
            { label: 'View Dashboard', action: () => navigate('/dashboard') },
            { label: 'Pickup History', action: () => navigate('/history') }
        ];
    } else if (message.includes('post') || message.includes('donate')) {
        response = "To post food: Click 'Post Food' in the dashboard, fill in details like food type, quantity, expiry time, and location. Make sure the information is accurate to help receivers!";
        quickActions = [
            { label: 'Post Food', action: () => navigate('/post-food') },
            { label: 'My Listings', action: () => navigate('/my-listings') }
        ];
    } else if (message.includes('safe') || message.includes('food safety') || message.includes('hygiene')) {
        response = "Food safety is crucial! Always inspect food before accepting, check expiry times, and use your judgment. We don't verify food safety - that's your responsibility. Check our Food Hygiene Disclaimer for detailed guidelines.";
        quickActions = [
            { label: 'Safety Guidelines', action: () => navigate('/food-hygiene') }
        ];
    } else if (message.includes('notification') || message.includes('alert')) {
        response = "You can manage notifications in Settings. Choose which alerts you want: nearby food, expiry reminders, pickup confirmations. You can also set your alert radius!";
        quickActions = [
            { label: 'Notification Settings', action: () => navigate('/settings') },
            { label: 'View Notifications', action: () => navigate('/notifications') }
        ];
    } else if (message.includes('account') || message.includes('profile') || message.includes('settings')) {
        response = "Your account settings let you update profile info, location preferences, notifications, privacy settings, and more. Need to change something specific?";
        quickActions = [
            { label: 'Open Settings', action: () => navigate('/settings') }
        ];
    } else if (message.includes('location') || message.includes('map')) {
        response = "Your location helps us show nearby food. We hide exact addresses until pickup is confirmed for privacy. You can adjust location settings and alert radius in Settings.";
        quickActions = [
            { label: 'Location Settings', action: () => navigate('/settings') }
        ];
    } else if (message.includes('achievement') || message.includes('badge') || message.includes('impact')) {
        response = "Track your environmental impact in Pickup History! See CO2 saved, meals rescued, and badges earned. Every pickup makes a difference! 🌱";
        quickActions = [
            { label: 'View Impact', action: () => navigate('/history') }
        ];
    } else if (message.includes('rating') || message.includes('review')) {
        response = "After each pickup, you can rate your experience. Ratings help build trust in our community. Be honest and fair in your reviews!";
        quickActions = [
            { label: 'Pickup History', action: () => navigate('/history') }
        ];
    } else if (message.includes('ngo') || message.includes('organization')) {
        response = "NGOs get verified status and can enable priority access to food donations. This helps organizations serving communities. Verification requires documentation.";
        quickActions = [
            { label: 'Settings', action: () => navigate('/settings') }
        ];
    } else if (message.includes('privacy') || message.includes('data')) {
        response = "We take privacy seriously. Your exact location is hidden until pickup confirmation. You control what's shared. Read our full Privacy Policy for details.";
        quickActions = [
            { label: 'Privacy Policy', action: () => navigate('/privacy') }
        ];
    } else if (message.includes('help') || message.includes('faq') || message.includes('question')) {
        response = "I can help with many topics! Check our FAQ for common questions, or ask me about pickups, posting food, safety, settings, or anything else.";
        quickActions = [
            { label: 'View FAQ', action: () => navigate('/faq') },
            { label: 'Contact Support', action: () => navigate('/contact-support') }
        ];
    } else if (message.includes('problem') || message.includes('issue') || message.includes('bug')) {
        response = "Sorry you're experiencing issues! For technical problems, please contact our support team with details about what's happening. They'll help you resolve it.";
        quickActions = [
            { label: 'Contact Support', action: () => navigate('/contact-support') }
        ];
    } else if (message.includes('report') || message.includes('block')) {
        response = "To report or block users, go to Settings > Privacy & Safety > Block/Report Users. For safety concerns, contact support immediately.";
        quickActions = [
            { label: 'Privacy Settings', action: () => navigate('/settings') },
            { label: 'Contact Support', action: () => navigate('/contact-support') }
        ];
    } else {
        response = "I'm here to help! I can assist with:\n• Claiming or posting food\n• Account settings\n• Food safety guidelines\n• Notifications and alerts\n• Privacy concerns\n• Technical issues\n\nWhat would you like to know?";
        quickActions = [
            { label: 'View FAQ', action: () => navigate('/faq') },
            { label: 'Contact Support', action: () => navigate('/contact-support') }
        ];
    }

    return {
        id: Date.now().toString(),
        type: 'ai',
        content: response,
        timestamp: new Date(),
        quickActions: quickActions.length > 0 ? quickActions : undefined
    };
};

const ChatMessage = forwardRef<HTMLDivElement, { message: Message; onQuickAction: (action: () => void) => void }>(
    ({ message, onQuickAction }, ref) => {
        const isAI = message.type === 'ai';

        return (
            <div ref={ref} className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'}`}>
                {isAI && (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Bot className="w-5 h-5 text-green-600" />
                    </div>
                )}

                <div className={`flex flex-col gap-1 max-w-[80%] ${isAI ? 'items-start' : 'items-end'}`}>
                    <div
                        className={`px-4 py-2 rounded-2xl ${isAI
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-green-600 text-white'
                            }`}
                    >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>

                    {message.quickActions && message.quickActions.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                            {message.quickActions.map((action, index) => (
                                <Button
                                    key={index}
                                    size="sm"
                                    variant="outline"
                                    onClick={() => onQuickAction(action.action)}
                                    className="text-xs h-7"
                                >
                                    {action.label}
                                    <ExternalLink className="w-3 h-3 ml-1" />
                                </Button>
                            ))}
                        </div>
                    )}

                    <span className="text-xs text-gray-500 px-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                {!isAI && (
                    <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                    </div>
                )}
            </div>
        );
    }
);

ChatMessage.displayName = 'ChatMessage';

export interface ChatWidgetHandle {
    open: () => void;
    close: () => void;
}

export const ChatWidget = forwardRef<ChatWidgetHandle>((_, ref) => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '0',
            type: 'ai',
            content: "Hi there! 👋 I'm your LeftOverLink AI assistant. I can help you with pickups, listings, settings, food safety, and more. How can I assist you today?",
            timestamp: new Date(),
            quickActions: [
                { label: 'How to claim food?', action: () => handleQuickMessage('How do I claim food?') },
                { label: 'Post food guide', action: () => handleQuickMessage('How do I post food?') },
                { label: 'Food safety tips', action: () => handleQuickMessage('Tell me about food safety') }
            ]
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
    }));

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isTyping, isOpen]);

    const handleQuickMessage = (message: string) => {
        handleSendMessage(message);
    };

    const handleSendMessage = (customMessage?: string) => {
        const messageText = customMessage || inputValue.trim();
        if (!messageText) return;

        // Add user message
        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsTyping(true);

        // Simulate AI thinking delay
        setTimeout(() => {
            const aiResponse = getAIResponse(messageText, navigate);
            setMessages(prev => [...prev, aiResponse]);
            setIsTyping(false);
        }, 800);
    };

    const handleQuickAction = (action: () => void) => {
        action();
        setIsOpen(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            height: isMinimized ? 'auto' : undefined
                        }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-4 right-4 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] md:w-[400px]"
                    >
                        <Card className="flex flex-col shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-green-600 text-white p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                                        <Bot className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">AI Support Assistant</h3>
                                        <div className="flex items-center gap-1 text-xs text-green-100">
                                            <div className="w-2 h-2 rounded-full bg-green-300 animate-pulse" />
                                            <span>Online</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setIsMinimized(!isMinimized)}
                                        className="text-white hover:bg-white/20 h-8 w-8 p-0"
                                    >
                                        <Minimize2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => setIsOpen(false)}
                                        className="text-white hover:bg-white/20 h-8 w-8 p-0"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {!isMinimized && (
                                <>
                                    {/* Messages Area */}
                                    <ScrollArea className="h-[400px] p-4 bg-white" ref={scrollAreaRef}>
                                        <div className="space-y-4">
                                            {messages.map((message) => (
                                                <ChatMessage
                                                    key={message.id}
                                                    message={message}
                                                    onQuickAction={handleQuickAction}
                                                />
                                            ))}

                                            {isTyping && (
                                                <div className="flex gap-3 justify-start">
                                                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                        <Bot className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                                                        <div className="flex gap-1">
                                                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                            <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div ref={messagesEndRef} />
                                        </div>
                                    </ScrollArea>

                                    <Separator />

                                    {/* Input Area */}
                                    <div className="p-4 bg-gray-50">
                                        <div className="flex gap-2">
                                            <Input
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                placeholder="Type your message..."
                                                className="flex-1"
                                            />
                                            <Button
                                                onClick={() => handleSendMessage()}
                                                disabled={!inputValue.trim()}
                                                className="bg-green-600 hover:bg-green-700"
                                            >
                                                <Send className="w-4 h-4" />
                                            </Button>
                                        </div>

                                        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                                            <Clock className="w-3 h-3" />
                                            <span>Response time: &lt;1 min</span>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Footer */}
                                    <div className="p-3 bg-gray-50 text-xs text-gray-600">
                                        <div className="flex items-start gap-2 mb-2">
                                            <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                            <p>
                                                AI responses are for guidance only. For critical issues or food safety concerns,{' '}
                                                <button
                                                    onClick={() => {
                                                        navigate('/contact-support');
                                                        setIsOpen(false);
                                                    }}
                                                    className="text-green-600 hover:underline font-medium"
                                                >
                                                    contact human support
                                                </button>.
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs">
                                            <button
                                                onClick={() => {
                                                    navigate('/privacy');
                                                    setIsOpen(false);
                                                }}
                                                className="text-gray-500 hover:text-green-600 flex items-center gap-1"
                                            >
                                                <FileText className="w-3 h-3" />
                                                Privacy
                                            </button>
                                            <span className="text-gray-300">•</span>
                                            <button
                                                onClick={() => {
                                                    navigate('/terms');
                                                    setIsOpen(false);
                                                }}
                                                className="text-gray-500 hover:text-green-600 flex items-center gap-1"
                                            >
                                                <FileText className="w-3 h-3" />
                                                Terms
                                            </button>
                                            <span className="text-gray-300">•</span>
                                            <button
                                                onClick={() => {
                                                    navigate('/food-hygiene');
                                                    setIsOpen(false);
                                                }}
                                                className="text-gray-500 hover:text-green-600 flex items-center gap-1"
                                            >
                                                <Shield className="w-3 h-3" />
                                                Safety
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
});

ChatWidget.displayName = 'ChatWidget';
