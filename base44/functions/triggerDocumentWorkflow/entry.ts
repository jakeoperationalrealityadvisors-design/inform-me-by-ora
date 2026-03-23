import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { documentId, triggerType, documentData } = await req.json();

        if (!documentId || !triggerType) {
            return Response.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Find matching workflows
        const workflows = await base44.asServiceRole.entities.AutomationRule.filter({
            trigger_type: triggerType,
            enabled: true
        });

        const results = [];

        for (const workflow of workflows) {
            try {
                // Execute each action in the workflow
                for (const action of workflow.actions || []) {
                    if (action.type === 'send_notification') {
                        await base44.asServiceRole.entities.Notification.create({
                            user_email: user.email,
                            title: 'Document Update',
                            message: action.config.message || 'A document has been updated',
                            type: 'document_uploaded',
                            link_page: 'ViewDocument',
                            link_params: `id=${documentId}`,
                            read: false
                        });
                    } else if (action.type === 'send_email') {
                        await base44.asServiceRole.integrations.Core.SendEmail({
                            to: action.config.to || user.email,
                            subject: action.config.subject || 'Document Update',
                            body: action.config.body || 'A document has been updated'
                        });
                    } else if (action.type === 'assign_task') {
                        await base44.asServiceRole.entities.Task.create({
                            title: action.config.title || 'Review Document',
                            description: `Document: ${documentData?.title || 'Untitled'}`,
                            assigned_to_email: action.config.assigned_to_email,
                            assigned_to_name: action.config.assigned_to_email,
                            related_form_id: documentId,
                            status: 'todo',
                            priority: 'medium'
                        });
                    } else if (action.type === 'update_status') {
                        await base44.asServiceRole.entities.Document.update(documentId, {
                            status: action.config.new_status
                        });
                    } else if (action.type === 'add_comment') {
                        await base44.asServiceRole.entities.Comment.create({
                            entity_type: 'document',
                            entity_id: documentId,
                            comment: action.config.comment || 'Automated comment',
                            created_by_name: 'System',
                            created_by_email: 'system@automations'
                        });
                    }
                }

                // Update workflow execution count
                await base44.asServiceRole.entities.AutomationRule.update(workflow.id, {
                    execution_count: (workflow.execution_count || 0) + 1,
                    last_executed: new Date().toISOString()
                });

                results.push({ workflowId: workflow.id, status: 'success' });
            } catch (error) {
                results.push({ workflowId: workflow.id, status: 'error', error: error.message });
            }
        }

        return Response.json({ success: true, results });
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});