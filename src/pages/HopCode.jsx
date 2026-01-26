import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Building2, ArrowRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from 'sonner';

export default function HopCode() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [hopcode, setHopcode] = useState('');

    const hopMutation = useMutation({
        mutationFn: async (code) => {
            const user = await httpClient.auth.me();
            
            // Find organization with this hopcode
            const orgs = await httpClient.entities.Organization.filter({ 
                hopcode: code.toUpperCase(),
                'settings.allow_hopcode_access': true 
            });
            
            if (!orgs.length) {
                throw new Error('Invalid hopcode or organization not found');
            }
            
            const org = orgs[0];
            
            // Check if hopcode expired
            if (org.hopcode_expires && new Date(org.hopcode_expires) < new Date()) {
                throw new Error('This hopcode has expired. Contact the site supervisor.');
            }
            
            // Create temporary access record
            await httpClient.entities.TemporaryAccess.create({
                user_email: user.email,
                organization_id: org.id,
                hopcode: code.toUpperCase(),
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
                status: 'active'
            });
            
            // Store in localStorage for quick switching
            const activeOrgs = JSON.parse(localStorage.getItem('active_orgs') || '[]');
            if (!activeOrgs.find(o => o.id === org.id)) {
                activeOrgs.push({ id: org.id, name: org.name, type: 'temporary' });
                localStorage.setItem('active_orgs', JSON.stringify(activeOrgs));
            }
            localStorage.setItem('current_org_id', org.id);
            
            return org;
        },
        onSuccess: (org) => {
            queryClient.invalidateQueries(['current-user']);
            queryClient.invalidateQueries(['organization']);
            toast.success(`Access granted to ${org.name}`);
            navigate(createPageUrl('Home'));
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (hopcode.length >= 4) {
            hopMutation.mutate(hopcode);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-[#0f1419] border-blue-900/20">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-white">Enter Hop Code</CardTitle>
                    <CardDescription className="text-blue-400">
                        Get temporary access to a worksite.<br />
                        Ask your supervisor for the code.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Input
                                value={hopcode}
                                onChange={(e) => setHopcode(e.target.value.toUpperCase())}
                                placeholder="Enter code (e.g., ABC123)"
                                className="text-center text-2xl font-mono bg-[#0a0e17] border-blue-900/30 text-white h-14"
                                maxLength={6}
                                autoFocus
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={hopcode.length < 4 || hopMutation.isPending}
                            className="w-full h-12 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] text-lg"
                        >
                            {hopMutation.isPending ? 'Connecting...' : (
                                <>
                                    Access Site
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}