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
    const isTeamMember = !isAdmin && !isManager;
    
    // Permission checks with override support
    const hasPermission = (permission) => {
        if (isAdmin) return true; // Admin has all permissions
        if (user?.permissions_override?.[permission] !== undefined) {
            return user.permissions_override[permission];
        }
        // Default permissions by role
        const managerPermissions = [
            'can_create_forms', 'can_edit_forms', 'can_delete_forms',
            'can_create_checklists', 'can_edit_checklists', 'can_delete_checklists',
            'can_view_reports', 'can_view_all_submissions'
        ];
        return isManager && managerPermissions.includes(permission);
    };
    
    return {
        user,
        isLoading,
        isAdmin,
        isManager,
        isTeamMember,
        canManage: isAdmin || isManager,
        canViewAll: isAdmin || isManager,
        canCreateForms: hasPermission('can_create_forms'),
        canEditForms: hasPermission('can_edit_forms'),
        canDeleteForms: hasPermission('can_delete_forms'),
        canCreateChecklists: hasPermission('can_create_checklists'),
        canEditChecklists: hasPermission('can_edit_checklists'),
        canDeleteChecklists: hasPermission('can_delete_checklists'),
        canViewReports: hasPermission('can_view_reports'),
        canManageUsers: hasPermission('can_manage_users'),
        canViewAllSubmissions: hasPermission('can_view_all_submissions'),
        hasPermission
    };
}

export default function RoleGuard({ children, allowedRoles = [], requiredPermission = null, fallbackPath = 'Home' }) {
    const { user, isLoading, isAdmin, isManager, isTeamMember, hasPermission } = useUserRole();
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </div>
        );
    }
    
    // Check role-based access
    const userRole = isAdmin ? 'admin' : isManager ? 'manager' : 'team_member';
    const hasRoleAccess = allowedRoles.length === 0 || allowedRoles.includes(userRole);
    
    // Check permission-based access
    const hasPermissionAccess = !requiredPermission || hasPermission(requiredPermission);
    
    const hasAccess = hasRoleAccess && hasPermissionAccess;
    
    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-[#0a0e17] flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-950/30 flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
                    <p className="text-blue-300 mb-6">
                        {requiredPermission 
                            ? 'You don\'t have the required permissions to access this page.'
                            : 'Your role doesn\'t have access to this page.'}
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