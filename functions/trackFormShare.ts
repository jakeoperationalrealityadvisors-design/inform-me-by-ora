import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { form_id, share_type, referrer } = await req.json();
        
        if (!form_id) {
            return Response.json({ error: 'Form ID required' }, { status: 400 });
        }
        
        // Track share analytics (you can create a ShareAnalytics entity if needed)
        // For now, just log the activity
        await base44.asServiceRole.entities.ActivityLog.create({
            user_email: 'system',
            user_name: 'System',
            action_type: 'form_shared',
            entity_type: 'form',
            entity_id: form_id,
            description: `Form shared via ${share_type || 'link'}`,
            metadata: {
                share_type: share_type || 'link',
                referrer: referrer || 'direct',
                timestamp: new Date().toISOString()
            }
        });
        
        return Response.json({
            success: true,
            message: 'Share tracked successfully'
        });
        
    } catch (error) {
        console.error('Share tracking error:', error);
        return Response.json({ 
            error: error.message || 'Failed to track share' 
        }, { status: 500 });
    }
});