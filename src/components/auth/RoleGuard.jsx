import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export function useUserRole() {
    const { data: user, isLoading } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });
    
    const isAdmin = user?.role === 'admin';
    const isManager = user?.team_role === 'manager';
    const isTeamMember = user?.team_role === 'team_member';
    
    return {
        user,
        isLoading,
        isAdmin,
        isManager,
        isTeamMember,
        canManage: isAdmin || isManager,
        canViewAll: isAdmin || isManager
    };
}

export default function RoleGuard({ children, allowedRoles = [], fallbackPath = 'Home' }) {
    const { user, isLoading, isAdmin, isManager, isTeamMember } = useUserRole();
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }
    
    const userRole = isAdmin ? 'admin' : isManager ? 'manager' : 'team_member';
    const hasAccess = allowedRoles.length === 0 || allowedRoles.includes(userRole);
    
    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-950/30 flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-blue-300 mb-6">
                        You don't have permission to access this page.
                    </p>
                    <Link to={createPageUrl(fallbackPath)}>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            Go to Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }
    
    return <>{children}</>;
}