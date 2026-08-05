import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

export function PrivacyPage() {
    const navigate = useNavigate();

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
                        <h1 className="text-xl font-bold">Privacy Policy</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 pb-20">
                <Card className="p-6">
                    <div className="prose prose-sm max-w-none">
                        <p className="text-sm text-gray-500 mb-6">
                            Last Updated: February 12, 2026
                        </p>

                        <p className="text-gray-700 mb-6">
                            At LeftOverLink, we take your privacy seriously. This Privacy Policy explains how we collect, use,
                            protect, and share your information when you use our food waste reduction platform.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">1. Information We Collect</h2>

                        <h3 className="font-medium mt-4 mb-2">1.1 Information You Provide</h3>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li><strong>Account Information:</strong> Name, email address, phone number, role (Provider/Receiver)</li>
                            <li><strong>Profile Information:</strong> Profile photo, bio, organization details (for NGOs)</li>
                            <li><strong>Food Listings:</strong> Food details, quantities, expiry times, pickup instructions</li>
                            <li><strong>Communications:</strong> Messages, ratings, reviews, and support inquiries</li>
                        </ul>

                        <h3 className="font-medium mt-4 mb-2">1.2 Automatically Collected Information</h3>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li><strong>Location Data:</strong> GPS coordinates for map features and nearby food alerts</li>
                            <li><strong>Device Information:</strong> Device type, operating system, browser type</li>
                            <li><strong>Usage Data:</strong> Pages viewed, features used, time spent on platform</li>
                            <li><strong>Log Data:</strong> IP address, access times, error logs</li>
                        </ul>

                        <h3 className="font-medium mt-4 mb-2">1.3 Information from Third Parties</h3>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Verification data from identity verification services</li>
                            <li>NGO documentation from registration authorities</li>
                        </ul>

                        <h2 className="text-lg font-bold mt-6 mb-3">2. How We Use Your Information</h2>
                        <p className="text-gray-700 mb-2">We use collected information to:</p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Facilitate food donations and pickups between users</li>
                            <li>Display food listings on the map and match users</li>
                            <li>Send notifications about nearby food, pickups, and platform updates</li>
                            <li>Verify user identities and prevent fraud</li>
                            <li>Calculate environmental impact and achievements</li>
                            <li>Improve platform functionality and user experience</li>
                            <li>Provide customer support and respond to inquiries</li>
                            <li>Enforce our Terms of Service and investigate violations</li>
                            <li>Comply with legal obligations</li>
                        </ul>

                        <h2 className="text-lg font-bold mt-6 mb-3">3. How We Share Your Information</h2>

                        <h3 className="font-medium mt-4 mb-2">3.1 With Other Users</h3>
                        <p className="text-gray-700 mb-4">
                            When you post or claim food, certain information is shared:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li><strong>Before Pickup:</strong> Name, approximate location, profile picture, ratings</li>
                            <li><strong>After Claiming:</strong> Exact address, contact details (phone/email)</li>
                            <li><strong>Public Profile:</strong> Name, role, ratings, achievements (if enabled)</li>
                        </ul>

                        <h3 className="font-medium mt-4 mb-2">3.2 With Service Providers</h3>
                        <p className="text-gray-700 mb-4">
                            We share data with third-party providers who help us operate the platform:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Map and location services (for map display)</li>
                            <li>Cloud hosting providers (for data storage)</li>
                            <li>Communication services (for notifications)</li>
                            <li>Analytics providers (for platform improvement)</li>
                            <li>Identity verification services</li>
                        </ul>

                        <h3 className="font-medium mt-4 mb-2">3.3 For Legal Reasons</h3>
                        <p className="text-gray-700 mb-4">
                            We may disclose information when required by law or to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Comply with legal processes or government requests</li>
                            <li>Protect our rights, property, or safety</li>
                            <li>Prevent fraud or security threats</li>
                            <li>Investigate Terms of Service violations</li>
                        </ul>

                        <h2 className="text-lg font-bold mt-6 mb-3">4. Your Privacy Controls</h2>
                        <p className="text-gray-700 mb-2">You can control your privacy through settings:</p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li><strong>Location Privacy:</strong> Hide exact location until pickup confirmed</li>
                            <li><strong>Profile Visibility:</strong> Control what information is publicly visible</li>
                            <li><strong>Notifications:</strong> Choose which alerts you receive</li>
                            <li><strong>Data Access:</strong> Request a copy of your data</li>
                            <li><strong>Account Deletion:</strong> Delete your account and associated data</li>
                        </ul>

                        <h2 className="text-lg font-bold mt-6 mb-3">5. Data Security</h2>
                        <p className="text-gray-700 mb-4">
                            We implement industry-standard security measures to protect your data:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Encryption of data in transit and at rest</li>
                            <li>Regular security audits and updates</li>
                            <li>Access controls and authentication</li>
                            <li>Secure data centers with physical protections</li>
                        </ul>
                        <p className="text-gray-700 mb-4">
                            However, no system is completely secure. We cannot guarantee absolute security of your information.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">6. Data Retention</h2>
                        <p className="text-gray-700 mb-4">
                            We retain your data for as long as your account is active or as needed to provide services.
                            After account deletion, we may retain certain data for:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Legal compliance (typically 7 years)</li>
                            <li>Fraud prevention and safety investigations</li>
                            <li>Aggregated analytics (anonymized)</li>
                        </ul>

                        <h2 className="text-lg font-bold mt-6 mb-3">7. Children's Privacy</h2>
                        <p className="text-gray-700 mb-4">
                            LeftOverLink is not intended for users under 18. We do not knowingly collect information from
                            children. If we discover data from a child was collected, we will delete it immediately.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">8. International Data Transfers</h2>
                        <p className="text-gray-700 mb-4">
                            Your data may be transferred to and stored in countries outside your residence. We ensure
                            appropriate safeguards are in place for international transfers.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">9. Your Rights</h2>
                        <p className="text-gray-700 mb-2">Depending on your location, you may have rights to:</p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li><strong>Access:</strong> Request copies of your personal data</li>
                            <li><strong>Correction:</strong> Update inaccurate or incomplete data</li>
                            <li><strong>Deletion:</strong> Request deletion of your data</li>
                            <li><strong>Portability:</strong> Receive data in a portable format</li>
                            <li><strong>Objection:</strong> Object to certain data processing</li>
                            <li><strong>Restriction:</strong> Request limitation of processing</li>
                        </ul>
                        <p className="text-gray-700 mb-4">
                            To exercise these rights, contact us at privacy@leftoverlink.com
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">10. Cookies and Tracking</h2>
                        <p className="text-gray-700 mb-4">
                            We use cookies and similar technologies to:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Keep you logged in</li>
                            <li>Remember your preferences</li>
                            <li>Analyze platform usage</li>
                            <li>Improve performance</li>
                        </ul>
                        <p className="text-gray-700 mb-4">
                            You can control cookies through your browser settings, but this may affect platform functionality.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">11. Third-Party Links</h2>
                        <p className="text-gray-700 mb-4">
                            Our Platform may contain links to third-party websites. We are not responsible for their privacy
                            practices. Please review their privacy policies before providing information.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">12. Changes to This Policy</h2>
                        <p className="text-gray-700 mb-4">
                            We may update this Privacy Policy periodically. We will notify users of significant changes via
                            email or platform notification. Continued use after changes constitutes acceptance.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">13. Contact Us</h2>
                        <p className="text-gray-700 mb-4">
                            For privacy-related questions or concerns, contact us at:<br />
                            Email: privacy@leftoverlink.com<br />
                            Address: [Company Address]<br />
                            Data Protection Officer: dpo@leftoverlink.com
                        </p>

                        <Separator className="my-6" />

                        <p className="text-sm text-gray-600 italic">
                            By using LeftOverLink, you acknowledge that you have read and understood this Privacy Policy.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
