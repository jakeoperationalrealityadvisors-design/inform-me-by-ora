import { base44 } from '@/api/base44Client';

/**
 * Utility to log user activities for audit trail
 */
export async function logActivity({
    action_type,
    entity_type,
    entity_id,
    entity_title,
    description,
    metadata = {}
}) {
    try {
        const user = await base44.auth.me();
        
        await base44.entities.ActivityLog.create({
            user_email: user.email,
            user_name: user.full_name,
            action_type,
            entity_type,
            entity_id,
            entity_title,
            description,
            metadata
        });
    } catch (error) {
        // Silently fail - don't block user actions if logging fails
        console.error('Failed to log activity:', error);
    }
}

/**
 * React hook to easily log activities
 */
export function useActivityLogger() {
    return { logActivity };
}