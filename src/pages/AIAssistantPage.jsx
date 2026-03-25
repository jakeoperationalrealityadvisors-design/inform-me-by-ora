import React from 'react';
import SubscriptionGate from '@/components/billing/SubscriptionGate';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from 'lucide-react';
import AIAssistant from '@/components/ai/AIAssistant';

export default function AIAssistantPage() {
    return (
        <SubscriptionGate feature="ai">
            <div className="min-h-screen bg-[#0a0e17] overflow-y-auto">
                <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-20 shadow-sm">
                    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <Link to={createPageUrl('Home')}>
                                <Button variant="ghost" size="icon" className="text-blue-400 shrink-0">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div className="min-w-0">
                                <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-[#FF8C00]" />
                                    AI Assistant
                                </h1>
                                <p className="text-xs sm:text-sm text-blue-400">
                                    Create workflows, summarize documents, get suggestions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
                    <AIAssistant mode="full" />
                </div>
            </div>
        </SubscriptionGate>
    );
}