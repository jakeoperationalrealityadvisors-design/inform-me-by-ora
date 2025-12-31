import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Shield, UserCog, User } from 'lucide-react';
import { useUserRole } from '@/components/auth/RoleGuard';

/**
 * Displays the current user's role with an icon and badge
 */
export default function RoleIndicator({ showLabel = true }) {
    const { isAdmin, isManager, user } = useUserRole();
    
    if (!user) return null;
    
    const roleConfig = isAdmin ? {
        label: 'Admin',
        icon: Shield,
        className: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
    } : isManager ? {
        label: 'Manager',
        icon: UserCog,
        className: 'bg-green-500/10 text-green-400 border-green-500/20'
    } : {
        label: 'Team Member',
        icon: User,
        className: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };
    
    const Icon = roleConfig.icon;
    
    if (!showLabel) {
        return (
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800">
                <Icon className="w-4 h-4 text-slate-300" />
            </div>
        );
    }
    
    return (
        <Badge variant="outline" className={roleConfig.className}>
            <Icon className="w-3 h-3 mr-1" />
            {roleConfig.label}
        </Badge>
    );
}