import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { type, template_id, data } = await req.json();
        
        if (!type || !template_id || !data) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }
        
        let submission;
        
        if (type === 'form') {
            // Create form submission
            submission = await base44.asServiceRole.entities.FormSubmission.create({
                form_template_id: template_id,
                form_title: data.form_title,
                responses: data.responses,
                submitted_by_name: data.submitted_by_name || 'Anonymous',
                status: 'submitted'
            });
            
            // Trigger automations
            try {
                await base44.asServiceRole.functions.invoke('executeAutomations', {
                    trigger_type: 'form_submitted',
                    trigger_config: { template_id },
                    data: submission
                });
            } catch (error) {
                console.error('Automation trigger failed:', error);
            }
        } else if (type === 'checklist') {
            // Create checklist submission
            const template = await base44.asServiceRole.entities.ChecklistTemplate
                .filter({ id: template_id }).then(r => r[0]);
            
            const completionPercentage = template?.items?.length 
                ? Math.round((data.completed_items.length / template.items.length) * 100)
                : 0;
            
            submission = await base44.asServiceRole.entities.ChecklistSubmission.create({
                checklist_template_id: template_id,
                checklist_title: data.checklist_title,
                completed_items: data.completed_items,
                submitted_by_name: data.submitted_by_name || 'Anonymous',
                completion_percentage: completionPercentage,
                status: completionPercentage === 100 ? 'completed' : 'in_progress'
            });
            
            // Trigger automations
            try {
                await base44.asServiceRole.functions.invoke('executeAutomations', {
                    trigger_type: 'checklist_completed',
                    trigger_config: { template_id },
                    data: submission
                });
            } catch (error) {
                console.error('Automation trigger failed:', error);
            }
        } else {
            return Response.json({ error: 'Invalid type' }, { status: 400 });
        }
        
        return Response.json({
            success: true,
            submission
        });
        
    } catch (error) {
        console.error('Public submission error:', error);
        return Response.json({ 
            error: error.message || 'Submission failed' 
        }, { status: 500 });
    }
});