import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Plus, Check, Settings as SettingsIcon, Zap, Globe, Code } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { serviceIntegrations } from '@/components/connections/ServiceIntegrations';
import ConnectionMonitor from '@/components/connections/ConnectionMonitor';
import { toast } from 'sonner';

export default function Integrations() {
    const [activeTab, setActiveTab] = useState('available');
    const [newService, setNewService] = useState({ name: '', baseURL: '', apiKey: '' });

    const availableIntegrations = [
        { name: 'Stripe', icon: '💳', description: 'Payment processing', protocol: 'REST', status: 'configured' },
        { name: 'SendGrid', icon: '📧', description: 'Email service', protocol: 'REST', status: 'configured' },
        { name: 'Twilio', icon: '📱', description: 'SMS & voice', protocol: 'REST', status: 'configured' },
        { name: 'Salesforce', icon: '☁️', description: 'CRM platform', protocol: 'REST/SOAP', status: 'available' },
        { name: 'Slack', icon: '💬', description: 'Team messaging', protocol: 'REST/WebSocket', status: 'available' },
        { name: 'Google Calendar', icon: '📅', description: 'Calendar sync', protocol: 'REST', status: 'available' },
        { name: 'Custom API', icon: '🔌', description: 'Your own service', protocol: 'REST/GraphQL', status: 'custom' }
    ];

    const protocols = [
        { name: 'REST API', icon: Globe, desc: 'Standard HTTP/HTTPS' },
        { name: 'GraphQL', icon: Code, desc: 'Query language for APIs' },
        { name: 'WebSocket', icon: Zap, desc: 'Real-time bidirectional' },
        { name: 'SOAP', icon: Globe, desc: 'XML-based protocol' }
    ];

    const addCustomService = () => {
        if (!newService.name || !newService.baseURL) {
            toast.error('Please provide service name and URL');
            return;
        }

        serviceIntegrations.register(newService.name.toLowerCase(), {
            baseURL: newService.baseURL
        });

        if (newService.apiKey) {
            serviceIntegrations.setAPIKey(newService.name.toLowerCase(), newService.apiKey);
        }

        toast.success(`${newService.name} integration added`);
        setNewService({ name: '', baseURL: '', apiKey: '' });
    };

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Settings')}>
                                <Button variant="ghost" size="icon" className="rounded-full text-blue-400">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white">External Integrations</h1>
                                <p className="text-sm text-blue-400">Connect to external services and APIs</p>
                            </div>
                        </div>
                        <ConnectionMonitor />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {['available', 'protocols', 'custom'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                activeTab === tab
                                    ? 'bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-white'
                                    : 'bg-[#0f1419] text-blue-400 hover:bg-blue-900/20'
                            }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Available Integrations */}
                {activeTab === 'available' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableIntegrations.map((integration) => (
                            <Card key={integration.name} className="bg-[#0f1419] border-blue-900/20">
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-3xl">{integration.icon}</div>
                                            <div>
                                                <CardTitle className="text-white">{integration.name}</CardTitle>
                                                <CardDescription>{integration.description}</CardDescription>
                                            </div>
                                        </div>
                                        {integration.status === 'configured' && (
                                            <Check className="w-5 h-5 text-green-500" />
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <Badge variant="outline" className="text-blue-400 border-blue-900/30">
                                            {integration.protocol}
                                        </Badge>
                                        <Button
                                            size="sm"
                                            variant={integration.status === 'configured' ? 'outline' : 'default'}
                                            className={integration.status === 'configured' ? '' : 'bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]'}
                                        >
                                            {integration.status === 'configured' ? (
                                                <>
                                                    <SettingsIcon className="w-4 h-4 mr-2" />
                                                    Configure
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4 mr-2" />
                                                    Add
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Protocols */}
                {activeTab === 'protocols' && (
                    <div className="space-y-4">
                        {protocols.map((protocol) => {
                            const Icon = protocol.icon;
                            return (
                                <Card key={protocol.name} className="bg-[#0f1419] border-blue-900/20">
                                    <CardHeader>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#FF8C00] to-[#1E40AF] flex items-center justify-center">
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-white">{protocol.name}</CardTitle>
                                                <CardDescription>{protocol.desc}</CardDescription>
                                            </div>
                                            <Badge className="ml-auto bg-green-950/50 text-green-400">Active</Badge>
                                        </div>
                                    </CardHeader>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Custom Integration */}
                {activeTab === 'custom' && (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardHeader>
                            <CardTitle className="text-white">Add Custom Integration</CardTitle>
                            <CardDescription>Connect to any REST API or service</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="text-blue-100">Service Name</Label>
                                <Input
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                    placeholder="My API Service"
                                    className="bg-[#0a0e17] border-blue-900/30 text-white"
                                />
                            </div>
                            <div>
                                <Label className="text-blue-100">Base URL</Label>
                                <Input
                                    value={newService.baseURL}
                                    onChange={(e) => setNewService({ ...newService, baseURL: e.target.value })}
                                    placeholder="https://api.example.com"
                                    className="bg-[#0a0e17] border-blue-900/30 text-white"
                                />
                            </div>
                            <div>
                                <Label className="text-blue-100">API Key (Optional)</Label>
                                <Input
                                    type="password"
                                    value={newService.apiKey}
                                    onChange={(e) => setNewService({ ...newService, apiKey: e.target.value })}
                                    placeholder="Enter API key if required"
                                    className="bg-[#0a0e17] border-blue-900/30 text-white"
                                />
                            </div>
                            <Button
                                onClick={addCustomService}
                                className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Integration
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}