import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, CheckCircle2, Circle, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import RoleGuard from '@/components/auth/RoleGuard';

const checklistItems = [
    {
        category: 'Billing & Monetization',
        items: [
            { name: 'Stripe Integration', status: 'complete', link: 'BillingTest', description: 'Payment processing via Stripe' },
            { name: 'Subscription Plans', status: 'complete', link: 'Pricing', description: 'Trial, Basic, Professional, Enterprise' },
            { name: 'Billing Dashboard', status: 'complete', link: 'CustomerPortal', description: 'Customer billing portal' },
            { name: 'Usage Tracking', status: 'complete', link: 'CustomerPortal', description: 'Monitor limits and usage' },
            { name: 'Webhook Handler', status: 'complete', link: 'BillingTest', description: 'Process Stripe webhooks' }
        ]
    },
    {
        category: 'Security & Authentication',
        items: [
            { name: 'Email Verification', status: 'complete', link: 'VerifyEmail', description: 'Token-based email verification' },
            { name: 'Role-Based Access', status: 'complete', link: 'RoleManagement', description: 'Custom roles and permissions' },
            { name: 'XSS Protection', status: 'complete', description: 'Input sanitization implemented' },
            { name: 'CSRF Protection', status: 'complete', description: 'Security headers configured' },
            { name: 'Rate Limiting', status: 'complete', description: 'API rate limiting active' },
            { name: 'Security Audit', status: 'pending', description: 'Third-party security review needed' }
        ]
    },
    {
        category: 'Legal & Compliance',
        items: [
            { name: 'Terms of Service', status: 'complete', link: 'TermsOfService', description: 'Legal terms page' },
            { name: 'Privacy Policy', status: 'complete', link: 'PrivacyPolicy', description: 'Privacy policy page' },
            { name: 'Data Export', status: 'complete', link: 'ExportData', description: 'GDPR-compliant data export' },
            { name: 'GDPR Compliance', status: 'partial', description: 'Cookie consent needed' },
            { name: 'Data Retention Policy', status: 'pending', description: 'Define retention periods' }
        ]
    },
    {
        category: 'Monitoring & Support',
        items: [
            { name: 'Error Monitoring', status: 'complete', link: 'SystemHealth', description: 'Global error tracking' },
            { name: 'Activity Logs', status: 'complete', link: 'ActivityLog', description: 'Audit trail system' },
            { name: 'Support System', status: 'complete', link: 'Support', description: 'Ticket-based support' },
            { name: 'Performance Monitoring', status: 'pending', description: 'APM tool integration needed' },
            { name: 'Uptime Monitoring', status: 'pending', description: 'External monitoring service' }
        ]
    },
    {
        category: 'Infrastructure',
        items: [
            { name: 'Production Environment', status: 'partial', description: 'Environment variables configured' },
            { name: 'CDN Setup', status: 'pending', description: 'Static asset delivery' },
            { name: 'Database Backups', status: 'pending', description: 'Automated backup strategy' },
            { name: 'Disaster Recovery', status: 'pending', description: 'Recovery plan needed' },
            { name: 'SSL/TLS', status: 'complete', description: 'HTTPS enforced' }
        ]
    },
    {
        category: 'User Experience',
        items: [
            { name: 'Mobile Optimization', status: 'complete', description: 'PWA with offline support' },
            { name: 'Email System', status: 'complete', description: 'Transactional emails working' },
            { name: 'Onboarding Flow', status: 'complete', link: 'NetworkOnboarding', description: 'User onboarding implemented' },
            { name: 'Documentation', status: 'partial', link: 'KnowledgeBase', description: 'Basic help available' },
            { name: 'Tutorial System', status: 'complete', description: 'Tooltips and guided tours' }
        ]
    },
    {
        category: 'Testing',
        items: [
            { name: 'Unit Tests', status: 'pending', description: 'Component testing suite' },
            { name: 'Integration Tests', status: 'pending', description: 'API integration tests' },
            { name: 'Load Testing', status: 'pending', description: 'Performance under load' },
            { name: 'Security Testing', status: 'pending', description: 'Penetration testing' },
            { name: 'User Acceptance', status: 'pending', description: 'Beta user feedback' }
        ]
    }
];

function ProductionChecklistContent() {
    const totalItems = checklistItems.reduce((sum, cat) => sum + cat.items.length, 0);
    const completeItems = checklistItems.reduce((sum, cat) => 
        sum + cat.items.filter(item => item.status === 'complete').length, 0
    );
    const partialItems = checklistItems.reduce((sum, cat) => 
        sum + cat.items.filter(item => item.status === 'partial').length, 0
    );
    const pendingItems = totalItems - completeItems - partialItems;
    const completionPercent = Math.round((completeItems / totalItems) * 100);

    const statusConfig = {
        complete: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-950/30', label: 'Complete' },
        partial: { icon: AlertCircle, color: 'text-yellow-400', bg: 'bg-yellow-950/30', label: 'Partial' },
        pending: { icon: Circle, color: 'text-blue-400', bg: 'bg-blue-950/30', label: 'Pending' }
    };

    return (
        <div className="min-h-screen bg-[#0a0e17] py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <Link to={createPageUrl('Settings')}>
                    <Button variant="ghost" className="mb-6 text-blue-400">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Settings
                    </Button>
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Production Readiness Checklist</h1>
                    <p className="text-blue-400">Track progress toward production launch</p>
                </div>

                {/* Overall Progress */}
                <Card className="bg-[#0f1419] border-blue-900/30 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white">Overall Progress</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-blue-100">Completion</span>
                                <span className="text-2xl font-bold text-white">{completionPercent}%</span>
                            </div>
                            <Progress value={completionPercent} className="h-3" />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-green-950/30 rounded-lg p-4 border border-green-900/30">
                                <div className="text-2xl font-bold text-green-400 mb-1">{completeItems}</div>
                                <div className="text-sm text-green-300">Complete</div>
                            </div>
                            <div className="bg-yellow-950/30 rounded-lg p-4 border border-yellow-900/30">
                                <div className="text-2xl font-bold text-yellow-400 mb-1">{partialItems}</div>
                                <div className="text-sm text-yellow-300">Partial</div>
                            </div>
                            <div className="bg-blue-950/30 rounded-lg p-4 border border-blue-900/30">
                                <div className="text-2xl font-bold text-blue-400 mb-1">{pendingItems}</div>
                                <div className="text-sm text-blue-300">Pending</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Checklist Categories */}
                <div className="space-y-6">
                    {checklistItems.map((category, catIdx) => {
                        const categoryComplete = category.items.filter(i => i.status === 'complete').length;
                        const categoryTotal = category.items.length;
                        const categoryPercent = Math.round((categoryComplete / categoryTotal) * 100);

                        return (
                            <Card key={catIdx} className="bg-[#0f1419] border-blue-900/30">
                                <CardHeader>
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-white">{category.category}</CardTitle>
                                        <Badge className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">
                                            {categoryComplete}/{categoryTotal}
                                        </Badge>
                                    </div>
                                    <Progress value={categoryPercent} className="h-2 mt-2" />
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {category.items.map((item, itemIdx) => {
                                            const config = statusConfig[item.status];
                                            const Icon = config.icon;

                                            return (
                                                <div
                                                    key={itemIdx}
                                                    className={`${config.bg} rounded-lg p-4 border border-blue-900/20`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <Icon className={`w-5 h-5 ${config.color} flex-shrink-0 mt-0.5`} />
                                                        <div className="flex-1">
                                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                                <h4 className="font-semibold text-white">{item.name}</h4>
                                                                {item.link && (
                                                                    <Link to={createPageUrl(item.link)}>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-6 px-2 text-blue-400 hover:text-blue-300"
                                                                        >
                                                                            <ExternalLink className="w-3 h-3" />
                                                                        </Button>
                                                                    </Link>
                                                                )}
                                                            </div>
                                                            <p className="text-sm text-blue-400">{item.description}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Action Items */}
                {pendingItems > 0 && (
                    <Card className="bg-[#0f1419] border-blue-900/30 mt-8">
                        <CardHeader>
                            <CardTitle className="text-white">Next Steps</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-blue-300">
                                <p>🔸 Complete security audit with third-party firm</p>
                                <p>🔸 Add cookie consent banner for GDPR</p>
                                <p>🔸 Set up APM monitoring (New Relic/Datadog)</p>
                                <p>🔸 Configure CDN for static assets</p>
                                <p>🔸 Implement automated database backups</p>
                                <p>🔸 Write unit and integration tests</p>
                                <p>🔸 Conduct load and security testing</p>
                                <p>🔸 Run beta program for user feedback</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function ProductionChecklist() {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <ProductionChecklistContent />
        </RoleGuard>
    );
}