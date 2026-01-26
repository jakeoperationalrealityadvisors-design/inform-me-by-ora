import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, CreditCard, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function BillingHistory({ organization }) {
    const { data: billingRecords = [] } = useQuery({
        queryKey: ['billing-history', organization.id],
        queryFn: () => httpClient.entities.BillingHistory.filter({ organization_id: organization.id }, '-created_date')
    });
    
    const statusColors = {
        completed: 'bg-green-600',
        pending: 'bg-yellow-600',
        failed: 'bg-red-600',
        refunded: 'bg-gray-600'
    };
    
    return (
        <div className="space-y-4">
            <Card className="bg-[#0f1419] border-blue-900/20">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-blue-500" />
                            Billing History
                        </CardTitle>
                        <Button variant="outline" size="sm" className="border-blue-600 text-blue-300">
                            <Download className="w-4 h-4 mr-2" />
                            Export All
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {billingRecords.length > 0 ? (
                        <div className="space-y-3">
                            {billingRecords.map((record) => (
                                <div key={record.id} className="flex items-center justify-between p-4 bg-[#0a0e17] rounded-lg border border-blue-900/20">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
                                            <FileText className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">
                                                {record.plan_type} Plan
                                            </p>
                                            <p className="text-sm text-blue-400">
                                                {format(new Date(record.created_date), 'MMM d, yyyy')}
                                            </p>
                                            {record.period_start && record.period_end && (
                                                <p className="text-xs text-blue-400/70">
                                                    {format(new Date(record.period_start), 'MMM d')} - {format(new Date(record.period_end), 'MMM d, yyyy')}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-white font-semibold">
                                                ${record.amount.toFixed(2)}
                                            </p>
                                            <Badge className={statusColors[record.status]}>
                                                {record.status}
                                            </Badge>
                                        </div>
                                        {record.invoice_url && (
                                            <Button variant="ghost" size="icon" asChild>
                                                <a href={record.invoice_url} target="_blank" rel="noopener noreferrer">
                                                    <Download className="w-4 h-4" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <CreditCard className="w-12 h-12 text-blue-400/30 mx-auto mb-3" />
                            <p className="text-blue-400">No billing history yet</p>
                            <p className="text-sm text-blue-400/70 mt-1">
                                Payment records will appear here
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}