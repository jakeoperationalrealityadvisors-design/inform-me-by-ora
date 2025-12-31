import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Loader2, ShieldAlert } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export function useUserRole() {
    const { data: user, isLoading: userLoading } = useQuery({
        queryKey: ['current-user'],
        queryFn: () => base44.auth.me()
    });

    const { data: customRole, isLoading: roleLoading } = useQuery({
        queryKey: ['user-role', user?.custom_role_id],
        queryFn: () => user?.custom_role_id ? base44.entities.Role.filter({ id: user.custom_role_id }).then(r => r[0]) : null,
        enabled: !!user?.custom_role_id
    });

    const isLoading = userLoading || roleLoading;
    const isAdmin = user?.role === 'admin';
    const isManager = user?.team_role === 'manager';
    const isEmployee = user?.account_type === 'employee';
    const isTeamMember = !isAdmin && !isManager;
    
    // Permission checks with custom role support
    const hasPermission = (permission) => {
        if (isAdmin) return true;

        // Check user-specific overrides first
        if (user?.permissions_override) {
            const overrideValue = user.permissions_override[permission];
            if (overrideValue !== undefined) return overrideValue;
        }

        // Check custom role permissions
        if (customRole?.permissions) {
            const [category, action] = permission.split('.');
            const categoryPerms = customRole.permissions[category];
            if (categoryPerms && categoryPerms[action] !== undefined) {
                return categoryPerms[action];
            }
        }

        // Fallback to legacy role permissions
        const managerPermissions = [
            'forms.view', 'forms.create', 'forms.edit', 'forms.delete', 'forms.submit',
            'checklists.view', 'checklists.create', 'checklists.edit', 'checklists.delete', 'checklists.submit',
            'tasks.view', 'tasks.create', 'tasks.edit', 'tasks.delete',
            'documents.view', 'documents.upload', 'documents.edit', 'documents.delete',
            'submissions.view_all', 'submissions.approve', 'submissions.reject',
            'automations.view', 'automations.create', 'automations.edit',
            'reports.view', 'categories.manage'
        ];
        const teamMemberPermissions = [
            'forms.view', 'forms.submit',
            'checklists.view', 'checklists.submit',
            'tasks.view',
            'documents.view',
            'submissions.view_own'
        ];

        if (isManager && managerPermissions.includes(permission)) return true;
        if (isTeamMember && teamMemberPermissions.includes(permission)) return true;

        return false;
    };
    
    return {
        user,
        customRole,
        isLoading,
        isAdmin,
        isManager,
        isTeamMember,
        isEmployee,
        canManage: isAdmin || isManager,
        canViewAll: isAdmin || hasPermission('submissions.view_all'),
        // Forms
        canViewForms: hasPermission('forms.view'),
        canCreateForms: hasPermission('forms.create'),
        canEditForms: hasPermission('forms.edit'),
        canDeleteForms: hasPermission('forms.delete'),
        canSubmitForms: hasPermission('forms.submit'),
        // Checklists
        canViewChecklists: hasPermission('checklists.view'),
        canCreateChecklists: hasPermission('checklists.create'),
        canEditChecklists: hasPermission('checklists.edit'),
        canDeleteChecklists: hasPermission('checklists.delete'),
        canSubmitChecklists: hasPermission('checklists.submit'),
        // Tasks
        canViewTasks: hasPermission('tasks.view'),
        canCreateTasks: hasPermission('tasks.create'),
        canEditTasks: hasPermission('tasks.edit'),
        canDeleteTasks: hasPermission('tasks.delete'),
        // Documents
        canViewDocuments: hasPermission('documents.view'),
        canUploadDocuments: hasPermission('documents.upload'),
        canEditDocuments: hasPermission('documents.edit'),
        canDeleteDocuments: hasPermission('documents.delete'),
        // Submissions
        canViewAllSubmissions: hasPermission('submissions.view_all'),
        canViewOwnSubmissions: hasPermission('submissions.view_own'),
        canApproveSubmissions: hasPermission('submissions.approve'),
        canRejectSubmissions: hasPermission('submissions.reject'),
        // Automations
        canViewAutomations: hasPermission('automations.view'),
        canCreateAutomations: hasPermission('automations.create'),
        canEditAutomations: hasPermission('automations.edit'),
        canDeleteAutomations: hasPermission('automations.delete'),
        // System
        canViewReports: hasPermission('reports.view'),
        canManageUsers: hasPermission('users.manage'),
        canManageCategories: hasPermission('categories.manage'),
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