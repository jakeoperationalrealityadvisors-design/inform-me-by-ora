import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TermsOfService() {
    return (
        <div className="min-h-screen bg-[#0a0e17] py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <Link to={createPageUrl('Home')}>
                    <Button variant="ghost" className="mb-6 text-blue-400">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Button>
                </Link>
                
                <div className="bg-[#0f1419] rounded-lg border border-blue-900/30 p-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Terms of Service</h1>
                    <p className="text-blue-400 mb-8">Last Updated: December 31, 2025</p>
                    
                    <div className="space-y-6 text-blue-200">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
                            <p className="leading-relaxed">
                                By accessing and using InForm Me ("the Service"), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. Description of Service</h2>
                            <p className="leading-relaxed">
                                InForm Me provides form and checklist management, document storage, task management, and workflow automation services. We reserve the right to modify, suspend, or discontinue any aspect of the Service at any time.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. User Accounts</h2>
                            <p className="leading-relaxed mb-2">You are responsible for:</p>
                            <ul className="list-disc ml-6 space-y-1">
                                <li>Maintaining the confidentiality of your account credentials</li>
                                <li>All activities that occur under your account</li>
                                <li>Notifying us immediately of any unauthorized use</li>
                                <li>Ensuring your account information is accurate and up-to-date</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Acceptable Use</h2>
                            <p className="leading-relaxed mb-2">You agree not to:</p>
                            <ul className="list-disc ml-6 space-y-1">
                                <li>Use the Service for any illegal purposes</li>
                                <li>Upload malicious code, viruses, or harmful content</li>
                                <li>Attempt to gain unauthorized access to our systems</li>
                                <li>Interfere with or disrupt the Service</li>
                                <li>Violate any applicable laws or regulations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Data and Privacy</h2>
                            <p className="leading-relaxed">
                                Your use of the Service is also governed by our Privacy Policy. We collect, use, and protect your data as described in the Privacy Policy. You retain all rights to your data, and we will not access or use it except as necessary to provide the Service.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">6. Subscription and Payment</h2>
                            <p className="leading-relaxed">
                                Paid plans are billed in advance on a monthly or annual basis. You authorize us to charge your payment method for all fees. Prices are subject to change with 30 days notice. Refunds are provided on a case-by-case basis.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">7. Termination</h2>
                            <p className="leading-relaxed">
                                You may cancel your account at any time. We reserve the right to suspend or terminate accounts that violate these terms. Upon termination, you may export your data within 30 days, after which it may be permanently deleted.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
                            <p className="leading-relaxed">
                                The Service is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service. Our total liability shall not exceed the amount you paid in the past 12 months.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">9. Changes to Terms</h2>
                            <p className="leading-relaxed">
                                We may update these terms from time to time. We will notify you of significant changes via email or through the Service. Continued use after changes constitutes acceptance of the new terms.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
                            <p className="leading-relaxed">
                                For questions about these Terms of Service, please contact us through the Support page in the application.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}