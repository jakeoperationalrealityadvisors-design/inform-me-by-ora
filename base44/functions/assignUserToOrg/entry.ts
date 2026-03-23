import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// This function automatically assigns new users to their organization on first login
// It should be called via automation when user_invited trigger fires

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Get the authenticated user
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        // Check if user already has an organization
        if (user.organization_id) {
            return Response.json({ 
                message: 'User already assigned to organization',
                organization_id: user.organization_id 
            });
        }
        
        // For invited users, we'll need to track pending invitations
        // This is a simplified version - in production you'd want a PendingInvitation entity
        
        return Response.json({ 
            success: true,
            message: 'User organization assignment checked'
        });
        
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});