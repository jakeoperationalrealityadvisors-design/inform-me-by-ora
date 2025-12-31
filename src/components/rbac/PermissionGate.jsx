import React from 'react';
import { useUserRole } from '@/components/auth/RoleGuard';

/**
 * Component to conditionally render children based on permissions
 * Usage: <PermissionGate permission="can_create_forms">...</PermissionGate>
 */
export default function PermissionGate({ 
    children, 
    permission, 
    role, 
    fallback = null 
}) {
    const { hasPermission, isAdmin, isManager, isTeamMember } = useUserRole();
    
    // Check permission if specified
    if (permission && !hasPermission(permission)) {
        return fallback;
    }
    
    // Check role if specified
    if (role) {
        const roles = Array.isArray(role) ? role : [role];
        const userRole = isAdmin ? 'admin' : isManager ? 'manager' : 'team_member';
        if (!roles.includes(userRole)) {
            return fallback;
        }
    }
    
    return <>{children}</>;
}