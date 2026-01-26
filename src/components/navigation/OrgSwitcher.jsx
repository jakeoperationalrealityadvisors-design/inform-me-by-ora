import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Building2, Check, LogOut, Plus, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';

export default function OrgSwitcher() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const currentOrgId = localStorage.getItem('current_org_id');

    const { data: user } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => httpClient.auth.me()
    });

    const { data: currentOrg } = useQuery({
        queryKey: ['organization', currentOrgId || user?.organization_id],
        queryFn: () => {
            const orgId = currentOrgId || user?.organization_id;
            return httpClient.entities.Organization.filter({ id: orgId }).then(r => r[0]);
        },
        enabled: !!(currentOrgId || user?.organization_id)
    });

    const { data: tempAccess = [] } = useQuery({
        queryKey: ['temp-access', user?.email],
        queryFn: () => httpClient.entities.TemporaryAccess.filter({ 
            user_email: user.email,
            status: 'active'
        }),
        enabled: !!user?.email
    });

    // Get all accessible orgs
    const accessibleOrgs = React.useMemo(() => {
        const orgs = [];
        if (user?.organization_id) {
            orgs.push({ id: user.organization_id, type: 'home' });
        }
        tempAccess.forEach(access => {
            if (!orgs.find(o => o.id === access.organization_id)) {
                orgs.push({ id: access.organization_id, type: 'temporary' });
            }
        });
        return orgs;
    }, [user, tempAccess]);

    const switchOrg = (orgId) => {
        localStorage.setItem('current_org_id', orgId);
        queryClient.invalidateQueries();
        toast.success('Switched organization');
        navigate(createPageUrl('Home'));
        window.location.reload();
    };

    const handleLogout = () => {
        localStorage.removeItem('current_org_id');
        localStorage.removeItem('active_orgs');
        httpClient.auth.logout();
    };

    const handleHopCode = () => {
        navigate(createPageUrl('HopCode'));
    };

    if (!user) return null;

    const currentOrgType = currentOrgId === user.organization_id ? 'home' : 'temporary';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 border-blue-900/30 text-white hover:bg-blue-950/50">
                    <Building2 className="w-4 h-4" />
                    <span className="max-w-[150px] truncate">
                        {currentOrg?.name || 'Select Site'}
                    </span>
                    {currentOrgType === 'temporary' && (
                        <Badge className="bg-[#FF8C00] text-white ml-1">Temp</Badge>
                    )}
                    <ChevronDown className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                <div className="px-2 py-1.5 text-xs font-semibold text-blue-400">
                    Your Organizations
                </div>
                {accessibleOrgs.map((org) => (
                    <DropdownMenuItem
                        key={org.id}
                        onClick={() => switchOrg(org.id)}
                        className="cursor-pointer"
                    >
                        <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                                <Building2 className="w-4 h-4" />
                                <span>Organization</span>
                                {org.type === 'home' && (
                                    <Badge className="bg-green-600 text-white">Home</Badge>
                                )}
                                {org.type === 'temporary' && (
                                    <Badge className="bg-[#FF8C00] text-white">Temp</Badge>
                                )}
                            </div>
                            {currentOrgId === org.id && (
                                <Check className="w-4 h-4 text-green-500" />
                            )}
                        </div>
                    </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleHopCode} className="cursor-pointer">
                    <Plus className="w-4 h-4 mr-2" />
                    Enter Hop Code
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-400">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}