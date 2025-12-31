import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
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
                    <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
                    <p className="text-blue-400 mb-8">Last Updated: December 31, 2025</p>
                    
                    <div className="space-y-6 text-blue-200">
                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
                            <p className="leading-relaxed mb-2">We collect the following types of information:</p>
                            <ul className="list-disc ml-6 space-y-1">
                                <li><strong>Account Information:</strong> Name, email address, password (encrypted)</li>
                                <li><strong>Organization Data:</strong> Forms, checklists, submissions, documents, tasks</li>
                                <li><strong>Usage Data:</strong> Pages visited, features used, time spent in application</li>
                                <li><strong>Device Information:</strong> Browser type, IP address, device identifiers</li>
                                <li><strong>Payment Information:</strong> Processed securely through Stripe (we don't store card details)</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
                            <p className="leading-relaxed mb-2">We use your information to:</p>
                            <ul className="list-disc ml-6 space-y-1">
                                <li>Provide and maintain the Service</li>
                                <li>Process your transactions and send notifications</li>
                                <li>Improve and personalize your experience</li>
                                <li>Communicate with you about updates and support</li>
                                <li>Ensure security and prevent fraud</li>
                                <li>Comply with legal obligations</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">3. Data Sharing</h2>
                            <p className="leading-relaxed">
                                We do not sell your personal information. We may share data with:
                            </p>
                            <ul className="list-disc ml-6 space-y-1 mt-2">
                                <li><strong>Service Providers:</strong> Cloud hosting, payment processing, analytics</li>
                                <li><strong>Team Members:</strong> Within your organization as configured by you</li>
                                <li><strong>Legal Requirements:</strong> When required by law or to protect rights</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">4. Data Security</h2>
                            <p className="leading-relaxed">
                                We implement industry-standard security measures including encryption in transit (TLS/SSL), encryption at rest, secure authentication, regular backups, and access controls. However, no method of transmission over the Internet is 100% secure.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention</h2>
                            <p className="leading-relaxed">
                                We retain your data for as long as your account is active. After account deletion, we may retain certain data for up to 90 days for backup purposes, then permanently delete it. You can request immediate deletion by contacting support.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">6. Your Rights</h2>
                            <p className="leading-relaxed mb-2">You have the right to:</p>
                            <ul className="list-disc ml-6 space-y-1">
                                <li><strong>Access:</strong> Request a copy of your personal data</li>
                                <li><strong>Correction:</strong> Update or correct your information</li>
                                <li><strong>Deletion:</strong> Request deletion of your data</li>
                                <li><strong>Export:</strong> Download your data in portable format</li>
                                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
                                <li><strong>Object:</strong> Object to certain data processing activities</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">7. Cookies and Tracking</h2>
                            <p className="leading-relaxed">
                                We use essential cookies for authentication and functionality. We may use analytics cookies to understand usage patterns. You can control cookies through your browser settings.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">8. International Data Transfers</h2>
                            <p className="leading-relaxed">
                                Your data may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">9. Children's Privacy</h2>
                            <p className="leading-relaxed">
                                Our Service is not intended for users under 18 years of age. We do not knowingly collect information from children. If you believe we have collected data from a child, please contact us immediately.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">10. Changes to This Policy</h2>
                            <p className="leading-relaxed">
                                We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through the Service. The "Last Updated" date will reflect when changes were made.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold text-white mb-3">11. Contact Us</h2>
                            <p className="leading-relaxed">
                                For questions about this Privacy Policy or to exercise your rights, please contact us through the Support page in the application.
                            </p>
                        </section>

                        <section className="bg-blue-950/30 p-4 rounded-lg">
                            <h2 className="text-xl font-semibold text-white mb-3">GDPR Compliance</h2>
                            <p className="leading-relaxed">
                                For users in the European Economic Area (EEA), we comply with GDPR requirements. This includes lawful processing bases, data protection by design, and your rights under GDPR Articles 15-22. Contact us to exercise your GDPR rights.
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}