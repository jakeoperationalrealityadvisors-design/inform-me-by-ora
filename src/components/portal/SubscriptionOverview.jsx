import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export default function SubscriptionOverview({ organization, members }) {
    const daysLeft = organization.trial_ends 
        ? differenceInDays(new Date(organization.trial_ends), new Date())
        : 0;
    
    const planColors = {
        trial: 'bg-yellow-500',
        basic: 'bg-blue-500',
        professional: 'bg-purple-500',
        enterprise: 'bg-[#FF8C00]'
    };
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white text-lg">Current Plan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-300">Plan Type</span>
                        <Badge className={`${planColors[organization.plan_type]} capitalize`}>
                            {organization.plan_type}
                        </Badge>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-blue-300">Status</span>
                        <Badge className={organization.status === 'active' ? 'bg-green-600' : 'bg-red-600'}>
                            {organization.status}
                        </Badge>
                    </div>
                    
                    {organization.plan_type === 'trial' && (
                        <div className="bg-yellow-950/30 border border-yellow-900/30 rounded-lg p-4 mt-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="w-5 h-5 text-yellow-400 mt-0.5" />
                                <div>
                                    <p className="text-yellow-300 font-medium">Trial Period</p>
                                    <p className="text-sm text-yellow-400/70 mt-1">
                                        {daysLeft > 0 ? (
                                            `${daysLeft} day${daysLeft > 1 ? 's' : ''} remaining until ${format(new Date(organization.trial_ends), 'MMM d, yyyy')}`
                                        ) : (
                                            'Trial has expired'
                                        )}
                                    </p>
                                    {daysLeft <= 7 && daysLeft > 0 && (
                                        <div className="flex items-center gap-1 mt-2 text-xs text-yellow-400">
                                            <AlertCircle className="w-3 h-3" />
                                            Upgrade soon to maintain access
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <CardTitle className="text-white text-lg">Account Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-300">Organization</span>
                        <span className="text-white font-medium">{organization.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-blue-300">Owner</span>
                        <span className="text-white">{organization.owner_email}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-blue-300">Team Size</span>
                        <span className="text-white">{members.length} / {organization.max_users} users</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-blue-300">Created</span>
                        <span className="text-white">{format(new Date(organization.created_date), 'MMM d, yyyy')}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}