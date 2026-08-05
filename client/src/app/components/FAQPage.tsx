import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronDown, Search } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { motion, AnimatePresence } from 'motion/react';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const faqs: FAQItem[] = [
    {
        category: 'Getting Started',
        question: 'What is LeftOverLink?',
        answer: 'LeftOverLink is a food waste reduction platform that connects food providers (restaurants, homes, events) with receivers (NGOs, volunteers, individuals in need). Our mission is to reduce food waste while helping communities in need.'
    },
    {
        category: 'Getting Started',
        question: 'How do I sign up?',
        answer: 'You can sign up by clicking the "Get Started" button on our landing page. Choose whether you want to be a Food Provider or Food Receiver, then complete the registration form with your details.'
    },
    {
        category: 'Getting Started',
        question: 'What\'s the difference between Provider and Receiver?',
        answer: 'Food Providers post surplus food they want to donate, while Food Receivers can browse and claim available food. You can only have one role per account, so choose the one that fits your needs.'
    },
    {
        category: 'For Providers',
        question: 'How do I post surplus food?',
        answer: 'After logging in as a Food Provider, click the "Post Food" button in the dashboard. Fill in details like food type, quantity, expiry time, and location. Make sure to provide accurate information to help receivers.'
    },
    {
        category: 'For Providers',
        question: 'Can I edit or delete my food posts?',
        answer: 'Yes! Go to "My Listings" from the menu to see all your active posts. You can edit details, mark food as picked up, or delete listings at any time.'
    },
    {
        category: 'For Providers',
        question: 'What happens when someone claims my food?',
        answer: 'You\'ll receive a notification when someone reserves your food. The receiver\'s contact information will be shared with you so you can coordinate the pickup. After pickup, both parties can rate the experience.'
    },
    {
        category: 'For Receivers',
        question: 'How do I claim food?',
        answer: 'Browse available food on the map dashboard or in the food list. When you find something you need, click "Claim Pickup" on the food card. You\'ll get the provider\'s contact details to arrange collection.'
    },
    {
        category: 'For Receivers',
        question: 'How do I know if food is still fresh?',
        answer: 'Food listings are color-coded: Green (fresh, >2 hours), Yellow (medium, 1-2 hours), and Red (urgent, <1 hour). Always check the expiry time and use your judgment when collecting food.'
    },
    {
        category: 'For Receivers',
        question: 'What is NGO Priority?',
        answer: 'Verified NGOs can enable NGO Priority in settings, which gives them first access to newly posted food. This ensures that organizations serving communities can secure donations more easily.'
    },
    {
        category: 'Safety & Privacy',
        question: 'Is my location shared publicly?',
        answer: 'By default, only approximate locations are shown on the map. Exact addresses are only revealed after a pickup is confirmed. You can control this in Privacy Settings.'
    },
    {
        category: 'Safety & Privacy',
        question: 'How do you verify users?',
        answer: 'We verify users through email and phone confirmation. NGOs undergo additional verification with documentation. Verified users have a blue checkmark badge on their profiles.'
    },
    {
        category: 'Safety & Privacy',
        question: 'What if I encounter a problem with another user?',
        answer: 'You can report users or block them from your account. Go to Settings > Privacy & Safety > Block/Report Users. Our team reviews all reports within 24 hours.'
    },
    {
        category: 'Safety & Privacy',
        question: 'Is the food safe to eat?',
        answer: 'LeftOverLink is a coordination platform. We don\'t inspect food safety. Always use your judgment, check expiry times, inspect food condition, and follow food safety guidelines when collecting donations.'
    },
    {
        category: 'Technical',
        question: 'Why can\'t I see any food on the map?',
        answer: 'Make sure location permissions are enabled. Also check your alert radius in Settings - increasing it may show more results. Food availability depends on active posts in your area.'
    },
    {
        category: 'Technical',
        question: 'I\'m not receiving notifications',
        answer: 'Check Settings > Notifications to ensure alerts are enabled. Also verify that browser/app permissions allow notifications. You may need to enable push notifications in your device settings.'
    },
    {
        category: 'Impact & Achievements',
        question: 'How is my environmental impact calculated?',
        answer: 'We estimate CO2 saved based on food type and quantity. Average calculations: meals save ~2.5kg CO2, produce ~1.5kg, dairy ~2kg, and meat ~5kg. View your impact in Pickup History.'
    },
    {
        category: 'Impact & Achievements',
        question: 'What are achievement badges?',
        answer: 'Badges are earned by reaching milestones like completing pickups, making donations, or saving certain amounts of CO2. They appear on your profile and in your Pickup History.'
    }
];

export function FAQPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('All');

    const categories = ['All', ...Array.from(new Set(faqs.map(faq => faq.category)))];

    const filteredFAQs = faqs.filter(faq => {
        const matchesSearch = searchQuery === '' ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-background border-b sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/settings')}
                        >
                            ← Back
                        </Button>
                        <h1 className="text-xl font-bold">Frequently Asked Questions</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 space-y-6 pb-20">
                {/* Search */}
                <Card className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                        <Input
                            type="search"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </Card>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map(category => (
                        <Button
                            key={category}
                            size="sm"
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            onClick={() => setSelectedCategory(category)}
                            className={selectedCategory === category ? 'bg-green-600 hover:bg-green-700' : ''}
                        >
                            {category}
                        </Button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-3">
                    {filteredFAQs.length === 0 ? (
                        <Card className="p-8 text-center text-gray-500">
                            No FAQs found matching your search
                        </Card>
                    ) : (
                        filteredFAQs.map((faq, index) => (
                            <Card key={index} className="overflow-hidden">
                                <button
                                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                    className="w-full p-4 flex items-start justify-between text-left hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex-1 pr-4">
                                        <div className="text-xs text-green-600 mb-1">{faq.category}</div>
                                        <h3 className="font-medium">{faq.question}</h3>
                                    </div>
                                    <ChevronDown
                                        className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${expandedIndex === index ? 'rotate-180' : ''
                                            }`}
                                    />
                                </button>

                                <AnimatePresence>
                                    {expandedIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-4 pb-4 text-sm text-muted-foreground border-t pt-4">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        ))
                    )}
                </div>

                {/* Contact Support */}
                <Card className="p-6 bg-green-500/10 border-green-500/20">
                    <h3 className="font-medium mb-2">Still have questions?</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                        Can't find what you're looking for? Our support team is here to help.
                    </p>
                    <Button
                        onClick={() => navigate('/contact-support')}
                        className="w-full bg-green-600 hover:bg-green-700"
                    >
                        Contact Support
                    </Button>
                </Card>
            </div>
        </div>
    );
}
