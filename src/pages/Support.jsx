import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Send, MessageCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useUserRole } from '@/components/auth/RoleGuard';

export default function Support() {
    const { user } = useUserRole();
    const queryClient = useQueryClient();
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        subject: '',
        category: 'general',
        description: '',
        priority: 'medium'
    });

    const submitMutation = useMutation({
        mutationFn: async (data) => {
            // Create support ticket
            await httpClient.entities.SupportTicket.create({
                user_email: user.email,
                user_name: user.full_name,
                organization_id: user.organization_id,
                subject: data.subject,
                category: data.category,
                description: data.description,
                priority: data.priority,
                status: 'open',
                created_date: new Date().toISOString()
            });

            // Send email notification to support
            await httpClient.integrations.Core.SendEmail({
                to: 'support@informme.app',
                subject: `[Support] ${data.subject}`,
                body: `
New support ticket from ${user.full_name} (${user.email})

Organization: ${user.organization_id}
Category: ${data.category}
Priority: ${data.priority}

Description:
${data.description}
                `.trim()
            });
        },
        onSuccess: () => {
            setSubmitted(true);
            queryClient.invalidateQueries(['support-tickets']);
            toast.success('Support ticket submitted successfully');
        },
        onError: (error) => {
            toast.error('Failed to submit ticket: ' + error.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        submitMutation.mutate(formData);
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-[#0a0e17] py-8 px-4">
                <div className="max-w-2xl mx-auto">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-950/30 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-4">Ticket Submitted!</h1>
                        <p className="text-blue-300 mb-8">
                            We've received your support request and will get back to you within 24 hours via email.
                        </p>
                        <Link to={createPageUrl('Home')}>
                            <Button className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                Back to Home
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0e17] py-8 px-4">
            <div className="max-w-2xl mx-auto">
                <Link to={createPageUrl('Settings')}>
                    <Button variant="ghost" className="mb-6 text-blue-400">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Settings
                    </Button>
                </Link>

                <Card className="bg-[#0f1419] border-blue-900/30 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Support</h1>
                            <p className="text-blue-400">We're here to help</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Label htmlFor="subject" className="text-blue-100">Subject *</Label>
                            <Input
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                placeholder="Brief description of your issue"
                                required
                                className="bg-[#0a0e17] border-blue-900/30 text-white"
                            />
                        </div>

                        <div>
                            <Label htmlFor="category" className="text-blue-100">Category *</Label>
                            <select
                                id="category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                required
                                className="w-full bg-[#0a0e17] border border-blue-900/30 rounded-lg px-4 py-2 text-white"
                            >
                                <option value="general">General Question</option>
                                <option value="technical">Technical Issue</option>
                                <option value="billing">Billing & Payments</option>
                                <option value="feature">Feature Request</option>
                                <option value="bug">Bug Report</option>
                                <option value="account">Account Help</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="priority" className="text-blue-100">Priority</Label>
                            <select
                                id="priority"
                                value={formData.priority}
                                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                className="w-full bg-[#0a0e17] border border-blue-900/30 rounded-lg px-4 py-2 text-white"
                            >
                                <option value="low">Low - General inquiry</option>
                                <option value="medium">Medium - Issue affecting work</option>
                                <option value="high">High - Blocking critical work</option>
                                <option value="urgent">Urgent - System down</option>
                            </select>
                        </div>

                        <div>
                            <Label htmlFor="description" className="text-blue-100">Description *</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Please provide as much detail as possible..."
                                required
                                rows={8}
                                className="bg-[#0a0e17] border-blue-900/30 text-white"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={submitMutation.isPending}
                            className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] h-12"
                        >
                            {submitMutation.isPending ? (
                                'Submitting...'
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Submit Ticket
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-8 pt-8 border-t border-blue-900/30">
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <div className="space-y-2 text-blue-300">
                            <Link to={createPageUrl('TermsOfService')} className="block hover:text-[#FF8C00]">
                                Terms of Service
                            </Link>
                            <Link to={createPageUrl('PrivacyPolicy')} className="block hover:text-[#FF8C00]">
                                Privacy Policy
                            </Link>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}