import { useNavigate } from 'react-router';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Separator } from './ui/separator';

export function TermsPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <div className="bg-background border-b sticky top-0 z-15">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/settings')}
                        >
                            ← Back
                        </Button>
                        <h1 className="text-xl font-bold">Terms & Conditions</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto p-4 pb-20">
                <Card className="p-6">
                    <div className="prose prose-sm max-w-none">
                        <p className="text-sm text-gray-500 mb-6">
                            Last Updated: February 12, 2026
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">1. Acceptance of Terms</h2>
                        <p className="text-gray-700 mb-4">
                            By accessing or using LeftOverLink ("the Platform"), you agree to be bound by these Terms and Conditions.
                            If you do not agree to these terms, please do not use the Platform.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">2. Description of Service</h2>
                        <p className="text-gray-700 mb-4">
                            LeftOverLink is a coordination platform that connects food providers with food receivers to reduce food waste.
                            We provide a map-based interface and communication tools but do not directly provide, transport, or inspect food items.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">3. User Accounts</h2>
                        <p className="text-gray-700 mb-2">Users must:</p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Provide accurate and complete registration information</li>
                            <li>Maintain the security of their account credentials</li>
                            <li>Choose one role (Food Provider or Food Receiver) per account</li>
                            <li>Be at least 18 years old or have parental consent</li>
                            <li>Notify us immediately of any unauthorized account use</li>
                        </ul>

                        <h2 className="text-lg font-bold mt-6 mb-3">4. Food Provider Responsibilities</h2>
                        <p className="text-gray-700 mb-2">Food Providers agree to:</p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Provide accurate information about food type, quantity, and expiry time</li>
                            <li>Ensure food is safe for consumption at the time of posting</li>
                            <li>Store food properly until pickup</li>
                            <li>Be available for coordinated pickup times</li>
                            <li>Update or remove listings if food is no longer available</li>
                            <li>Not post expired, spoiled, or potentially harmful food items</li>
                        </ul>

                        <h2 className="text-lg font-bold mt-6 mb-3">5. Food Receiver Responsibilities</h2>
                        <p className="text-gray-700 mb-2">Food Receivers agree to:</p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Inspect food before accepting it</li>
                            <li>Use their own judgment regarding food safety and quality</li>
                            <li>Confirm pickup times and arrive as scheduled</li>
                            <li>Respect providers' time and property</li>
                            <li>Report any safety concerns immediately</li>
                            <li>Not claim food they do not intend to pick up</li>
                        </ul>

                        <h2 className="text-lg font-bold mt-6 mb-3">6. Platform Usage Rules</h2>
                        <p className="text-gray-700 mb-2">Users must not:</p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Use the Platform for commercial purposes without authorization</li>
                            <li>Post false, misleading, or fraudulent listings</li>
                            <li>Harass, abuse, or threaten other users</li>
                            <li>Share or sell account credentials</li>
                            <li>Attempt to circumvent security measures</li>
                            <li>Use the Platform for any illegal activities</li>
                            <li>Scrape, mine, or harvest data without permission</li>
                        </ul>

                        <h2 className="text-lg font-bold mt-6 mb-3">7. Food Safety Disclaimer</h2>
                        <p className="text-gray-700 mb-4">
                            <strong>IMPORTANT:</strong> LeftOverLink is a coordination platform only. We do not inspect, verify, or guarantee
                            the safety, quality, or suitability of any food items. Users accept full responsibility for assessing food safety.
                            Always follow food safety guidelines and use your best judgment. If in doubt, do not consume the food.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">8. Liability Limitations</h2>
                        <p className="text-gray-700 mb-4">
                            LeftOverLink provides the Platform "as is" without warranties. We are not liable for:
                        </p>
                        <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                            <li>Food quality, safety, or related health issues</li>
                            <li>Disputes between users</li>
                            <li>Lost, stolen, or damaged property</li>
                            <li>Failed pickups or coordination</li>
                            <li>User conduct or behavior</li>
                            <li>Platform downtime or technical issues</li>
                        </ul>

                        <h2 className="text-lg font-bold mt-6 mb-3">9. Privacy and Data</h2>
                        <p className="text-gray-700 mb-4">
                            Your use of the Platform is subject to our Privacy Policy. By using LeftOverLink, you consent to our
                            collection and use of data as described in the Privacy Policy.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">10. User Verification</h2>
                        <p className="text-gray-700 mb-4">
                            We may verify user identities through email, phone, or documentation (especially for NGOs).
                            Verified status does not guarantee user conduct or food safety.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">11. Ratings and Reviews</h2>
                        <p className="text-gray-700 mb-4">
                            Users may rate and review each other. Ratings should be honest and fair. We reserve the right to
                            remove reviews that violate our guidelines or are fraudulent.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">12. Intellectual Property</h2>
                        <p className="text-gray-700 mb-4">
                            All Platform content, including logos, designs, and software, is owned by LeftOverLink or its licensors.
                            Users may not copy, modify, or distribute Platform content without permission.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">13. Account Termination</h2>
                        <p className="text-gray-700 mb-4">
                            We reserve the right to suspend or terminate accounts that violate these Terms, engage in fraudulent
                            activity, or pose safety risks. Users may also delete their accounts at any time.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">14. Modifications to Terms</h2>
                        <p className="text-gray-700 mb-4">
                            We may update these Terms at any time. Continued use of the Platform after changes constitutes
                            acceptance of the new Terms. We will notify users of significant changes.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">15. Dispute Resolution</h2>
                        <p className="text-gray-700 mb-4">
                            Any disputes arising from these Terms shall be resolved through binding arbitration in accordance
                            with the laws of [Jurisdiction]. Users waive the right to participate in class actions.
                        </p>

                        <h2 className="text-lg font-bold mt-6 mb-3">16. Contact Information</h2>
                        <p className="text-gray-700 mb-4">
                            For questions about these Terms, contact us at:<br />
                            Email: legal@leftoverlink.com<br />
                            Address: [Company Address]
                        </p>

                        <Separator className="my-6" />

                        <p className="text-sm text-gray-600 italic">
                            By using LeftOverLink, you acknowledge that you have read, understood, and agree to be bound by these
                            Terms and Conditions.
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
