import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { AlertTriangle, CheckCircle, XCircle, ShieldAlert } from 'lucide-react';

export function FoodHygieneDisclaimerPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
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
                        <h1 className="text-xl font-bold">Food Hygiene & Safety Disclaimer</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 md:pt-10 space-y-8">
                {/* Header Section */}
                <section className="text-center space-y-4">
                    <div className="inline-flex items-center justify-center p-3 bg-red-500/10 rounded-2xl mb-2">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold">Important Safety Notice</h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        Please read this document carefully before donating or claiming food.
                        Your safety and the safety of our community is our priority.
                    </p>
                </section>

                {/* Warning Card */}
                <Card className="p-6 bg-red-500/10 border-red-200 dark:border-red-900/50">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h2 className="font-bold text-red-900 dark:text-red-400 mb-2">IMPORTANT SAFETY NOTICE</h2>
                            <p className="text-red-800 dark:text-red-300/80 text-sm italic">
                                LeftOverLink is a coordination platform only. We DO NOT inspect, verify, or guarantee the safety,
                                quality, or suitability of any food items shared on our platform. All users must exercise their
                                own judgment and follow food safety guidelines.
                            </p>
                        </div>
                    </div>
                </Card>

                {/* Main Disclaimer */}
                <Card className="p-6">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                        <h2 className="text-lg font-bold mb-3">Our Role</h2>
                        <p className="text-muted-foreground mb-4">
                            LeftOverLink provides a digital platform that connects food providers with food receivers.
                            We facilitate communication and coordination but we:
                        </p>
                        <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-1">
                            <li>Do NOT handle, inspect, or transport food</li>
                            <li>Do NOT verify food safety or quality</li>
                            <li>Do NOT guarantee accurate food descriptions</li>
                            <li>Are NOT responsible for food-related health issues</li>
                            <li>Do NOT have food safety certifications or licenses</li>
                        </ul>

                        <h2 className="text-lg font-bold mb-3">User Responsibility</h2>
                        <p className="text-muted-foreground mb-4">
                            <strong>YOU are responsible for:</strong>
                        </p>
                        <ul className="list-disc pl-6 mb-6 text-muted-foreground space-y-1">
                            <li>Inspecting all food before accepting or consuming it</li>
                            <li>Verifying food safety, freshness, and quality</li>
                            <li>Following proper food safety and hygiene practices</li>
                            <li>Making informed decisions about food suitability</li>
                            <li>Understanding and accepting all risks</li>
                            <li>Seeking medical attention if you experience adverse reactions</li>
                        </ul>
                    </div>
                </Card>

                {/* Food Safety Guidelines */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold mb-4">Food Safety Guidelines</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                        While we don't enforce these, we strongly recommend following these safety practices:
                    </p>

                    <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-2 md:gap-8">
                        <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                DO: Safe Practices
                            </h3>
                            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
                                <li>Inspect food appearance, smell, and packaging</li>
                                <li>Check expiry dates and timestamps</li>
                                <li>Ask questions about food storage and handling</li>
                                <li>Refrigerate perishables immediately after pickup</li>
                                <li>Wash hands before handling food</li>
                                <li>Cook or reheat food to safe temperatures</li>
                                <li>Trust your instincts - if in doubt, don't consume</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2">
                                <XCircle className="w-5 h-5 text-red-600" />
                                DON'T: Unsafe Practices
                            </h3>
                            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-2">
                                <li>Accept food that looks or smells spoiled</li>
                                <li>Consume food past its expiry date</li>
                                <li>Accept food that wasn't stored properly</li>
                                <li>Ignore signs of contamination or tampering</li>
                                <li>Give potentially unsafe food to vulnerable populations</li>
                                <li>Re-donate food that's been in your possession</li>
                            </ul>
                        </div>
                    </div>
                </Card>

                {/* High-Risk Groups */}
                <Card className="p-6 bg-yellow-500/10 border-yellow-200 dark:border-yellow-900/50">
                    <h3 className="font-medium mb-2">High-Risk Individuals</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                        The following groups are more susceptible to foodborne illness and should exercise extra caution:
                    </p>
                    <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
                        <li>Pregnant women</li>
                        <li>Young children and infants</li>
                        <li>Elderly individuals</li>
                        <li>People with weakened immune systems</li>
                        <li>Individuals with chronic illnesses</li>
                    </ul>
                </Card>

                {/* Temperature Safety */}
                <Card className="p-6">
                    <h3 className="font-medium mb-4">Temperature Safety Zones</h3>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="flex flex-col gap-2 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                            <div className="text-2xl mb-1">❄️</div>
                            <div className="font-semibold text-sm">Cold Foods</div>
                            <div className="text-xs text-muted-foreground">Keep below 40°F / 4°C</div>
                        </div>
                        <div className="flex flex-col gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                            <div className="text-2xl mb-1">⚠️</div>
                            <div className="font-semibold text-sm">Danger Zone</div>
                            <div className="text-xs text-muted-foreground">Avoid 40-140°F / 4-60°C</div>
                        </div>
                        <div className="flex flex-col gap-2 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                            <div className="text-2xl mb-1">🔥</div>
                            <div className="font-semibold text-sm">Hot Foods</div>
                            <div className="text-xs text-muted-foreground">Maintain above 140°F / 60°C</div>
                        </div>
                    </div>
                </Card>

                {/* Liability */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold mb-3">Limitation of Liability</h2>
                    <p className="text-muted-foreground mb-4">
                        By using LeftOverLink, you acknowledge and agree that:
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground space-y-3 mb-6">
                        <li>
                            <strong>No Warranties:</strong> We make no warranties about food safety, quality, or suitability.
                        </li>
                        <li>
                            <strong>Assumption of Risk:</strong> You assume all risks associated with receiving or donating food.
                        </li>
                        <li>
                            <strong>No Liability:</strong> LeftOverLink is not liable for any illness, injury, or damages.
                        </li>
                    </ul>
                    <p className="text-sm text-muted-foreground italic bg-muted p-3 rounded-lg">
                        This disclaimer is in addition to our Terms of Service, which you should read in full.
                    </p>
                </Card>

                {/* Reporting & Good Samaritan */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="p-6 bg-green-500/10 border-green-200 dark:border-green-900/50 flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold mb-2">Good Samaritan Laws</h3>
                            <p className="text-xs text-muted-foreground mb-4">
                                Many jurisdictions protect good-faith food donors from liability. Check your local
                                regulations as laws vary by location. Protection typically excludes gross negligence.
                            </p>
                        </div>
                        <p className="text-[10px] text-muted-foreground italic">
                            * This is not legal advice.
                        </p>
                    </Card>

                    <Card className="p-6 bg-green-600 text-white flex flex-col justify-between">
                        <div>
                            <h3 className="font-bold mb-2">Need to contact support?</h3>
                            <p className="text-xs opacity-90 mb-4">
                                If you have safety concerns or need to report an issue, our team is here to help 24/7.
                            </p>
                        </div>
                        <Button
                            className="w-full bg-white text-green-700 hover:bg-green-50"
                            onClick={() => navigate('/contact-support')}
                        >
                            Contact Support
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
