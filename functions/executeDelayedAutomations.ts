import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Function to execute delayed automation actions
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        // This should be called by a cron job or scheduler
        // For now, we'll check for actions that are due

        const now = new Date();

        // Find all delayed actions that are due
        const delayedActions = await base44.asServiceRole.entities.DelayedAutomationAction.filter({
            status: 'pending',
            execute_at: { $lte: now.toISOString() }
        });

        const executedActions = [];

        for (const delayedAction of delayedActions) {
            try {
                // Mark as processing
                await base44.asServiceRole.entities.DelayedAutomationAction.update(delayedAction.id, {
                    status: 'processing'
                });

                // Execute the action based on type
                if (delayedAction.action_type === 'custom_code') {
                    const customFunction = new Function('trigger_data', 'action_config', 'base44', delayedAction.action_code);
                    const result = await customFunction(delayedAction.trigger_data, delayedAction.action_config, base44.asServiceRole);
                    executedActions.push({
                        id: delayedAction.id,
                        rule: delayedAction.rule_name,
                        action: 'custom_code',
                        success: true,
                        result: result
                    });
                } else if (delayedAction.action_type === 'assign_task') {
                    if (delayedAction.trigger_data.submission_id && delayedAction.trigger_data.submission_type) {
                        const entity = delayedAction.trigger_data.submission_type === 'form' ? 'FormSubmission' : 'ChecklistSubmission';
                        await base44.asServiceRole.entities[entity].update(delayedAction.trigger_data.submission_id, {
                            assigned_to_email: delayedAction.action_config.assignee_email,
                            priority: delayedAction.action_config.priority || 'medium',
                            due_date: delayedAction.action_config.due_date
                        });
                    }
                    executedActions.push({
                        id: delayedAction.id,
                        rule: delayedAction.rule_name,
                        action: 'assign_task',
                        success: true
                    });
                } else if (delayedAction.action_type === 'send_notification') {
                    await base44.asServiceRole.entities.Notification.create({
                        user_email: delayedAction.action_config.recipient_email || delayedAction.trigger_data.submitted_by_email,
                        title: delayedAction.action_config.title || `Delayed ${delayedAction.trigger_type}`,
                        message: delayedAction.action_config.message || `A delayed ${delayedAction.trigger_type} event occurred`,
                        type: 'task_assigned',
                        link_page: delayedAction.trigger_data.link_page,
                        link_params: delayedAction.trigger_data.link_params
                    });
                    executedActions.push({
                        id: delayedAction.id,
                        rule: delayedAction.rule_name,
                        action: 'send_notification',
                        success: true
                    });
                } else if (delayedAction.action_type === 'send_email') {
                    await base44.asServiceRole.integrations.Core.SendEmail({
                        to: delayedAction.action_config.recipient_email || delayedAction.trigger_data.submitted_by_email,
                        subject: delayedAction.action_config.subject || `Delayed Automation: ${delayedAction.rule_name}`,
                        body: delayedAction.action_config.body || `A delayed automation rule was triggered: ${delayedAction.rule_name}`
                    });
                    executedActions.push({
                        id: delayedAction.id,
                        rule: delayedAction.rule_name,
                        action: 'send_email',
                        success: true
                    });
                } else if (delayedAction.action_type === 'create_followup') {
                    const followupDate = new Date();
                    followupDate.setDate(followupDate.getDate() + (delayedAction.action_config.days_ahead || 7));
                    await base44.asServiceRole.entities.ScheduledEvent.create({
                        title: delayedAction.action_config.title || `Delayed Follow-up: ${delayedAction.trigger_data.title}`,
                        description: delayedAction.action_config.description,
                        event_type: 'follow_up',
                        start_date: followupDate.toISOString(),
                        assigned_to_email: delayedAction.action_config.assignee_email,
                        related_submission_id: delayedAction.trigger_data.submission_id,
                        related_submission_type: delayedAction.trigger_data.submission_type
                    });
                    executedActions.push({
                        id: delayedAction.id,
                        rule: delayedAction.rule_name,
                        action: 'create_followup',
                        success: true
                    });
                } else if (delayedAction.action_type === 'create_task') {
                    await base44.asServiceRole.entities.Task.create({
                        title: delayedAction.action_config.title || `Delayed Task from: ${delayedAction.trigger_data.title}`,
                        description: delayedAction.action_config.description,
                        assigned_to_email: delayedAction.action_config.assignee_email,
                        assigned_to_name: delayedAction.action_config.assignee_name,
                        priority: delayedAction.action_config.priority || 'medium',
                        due_date: delayedAction.action_config.due_date,
                        status: 'todo',
                        related_form_id: delayedAction.trigger_data.submission_type === 'form' ? delayedAction.trigger_data.submission_id : null,
                        related_checklist_id: delayedAction.trigger_data.submission_type === 'checklist' ? delayedAction.trigger_data.submission_id : null
                    });
                    executedActions.push({
                        id: delayedAction.id,
                        rule: delayedAction.rule_name,
                        action: 'create_task',
                        success: true
                    });
                } else if (delayedAction.action_type === 'update_status') {
                    if (delayedAction.trigger_data.submission_id && delayedAction.trigger_data.submission_type) {
                        const entity = delayedAction.trigger_data.submission_type === 'form' ? 'FormSubmission' : 'ChecklistSubmission';
                        await base44.asServiceRole.entities[entity].update(delayedAction.trigger_data.submission_id, {
                            status: delayedAction.action_config.new_status
                        });
                    }
                    executedActions.push({
                        id: delayedAction.id,
                        rule: delayedAction.rule_name,
                        action: 'update_status',
                        success: true
                    });
                } else if (delayedAction.action_type === 'add_comment') {
                    if (delayedAction.trigger_data.submission_id && delayedAction.trigger_data.submission_type) {
                        await base44.asServiceRole.entities.Comment.create({
                            submission_id: delayedAction.trigger_data.submission_id,
                            submission_type: delayedAction.trigger_data.submission_type,
                            comment_text: delayedAction.action_config.comment_text || 'Delayed automated comment',
                            author_name: 'Delayed Automation',
                            author_email: 'automation@system'
                        });
                    }
                    executedActions.push({
                        id: delayedAction.id,
                        rule: delayedAction.rule_name,
                        action: 'add_comment',
                        success: true
                    });
                } else if (delayedAction.action_type === 'update_documents') {
                    const linkedDocs = await base44.asServiceRole.entities.Document.filter({
                        'linked_to.form_submission_id': delayedAction.trigger_data.submission_id || null,
                        'linked_to.checklist_submission_id': delayedAction.trigger_data.submission_id || null,
                        'linked_to.task_id': delayedAction.trigger_data.task_id || null
                    });

                    for (const doc of linkedDocs) {
                        await base44.asServiceRole.entities.Document.update(doc.id, {
                            status: delayedAction.action_config.document_status || 'active',
                            tags: delayedAction.action_config.add_tags ? [...(doc.tags || []), ...delayedAction.action_config.add_tags] : doc.tags
                        });
                    }
                    executedActions.push({
                        id: delayedAction.id,
                        rule: delayedAction.rule_name,
                        action: 'update_documents',
                        success: true
                    });
                } else if (delayedAction.action_type === 'log_to_salesforce') {
                    await base44.asServiceRole.functions.invoke('logToSalesforce', {
                        submission_id: delayedAction.trigger_data.submission_id,
                        submission_type: delayedAction.trigger_data.submission_type,
                        subject: delayedAction.action_config.subject,
                        description: delayedAction.action_config.description,
                        priority: delayedAction.action_config.priority || delayedAction.trigger_data.priority,
                        contact_email: delayedAction.trigger_data.submitted_by_email,
                        contact_name: delayedAction.trigger_data.submitted_by_name
                    });
                    executedActions.push({
                        id: delayedAction.id,
                        rule: delayedAction.rule_name,
                        action: 'log_to_salesforce',
                        success: true
                    });
                } else if (delayedAction.action_type === 'call_webhook') {
                    const webhookResponse = await fetch(delayedAction.action_config.webhook_url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': delayedAction.action_config.auth_header || ''
                        },
                        body: JSON.stringify({
                            trigger_type: delayedAction.trigger_type,
                            trigger_data: delayedAction.trigger_data,
                            action_config: delayedAction.action_config,
                            timestamp: now.toISOString(),
                            delayed: true
                        })
                    });
                    
                    if (!webhookResponse.ok) {
                        throw new Error(`Delayed webhook call failed: ${webhookResponse.status}`);
                    }
                    executedActions.push({
                        id: delayedAction.id,
                        rule: delayedAction.rule_name,
                        action: 'call_webhook',
                        success: true
                    });
                }

                // Mark as completed
                await base44.asServiceRole.entities.DelayedAutomationAction.update(delayedAction.id, {
                    status: 'completed',
                    executed_at: now.toISOString()
                });

            } catch (error) {
                console.error(`Delayed automation action failed: ${delayedAction.action_type}`, error);
                // Mark as failed
                await base44.asServiceRole.entities.DelayedAutomationAction.update(delayedAction.id, {
                    status: 'failed',
                    error_message: error.message,
                    executed_at: now.toISOString()
                });
                executedActions.push({
                    id: delayedAction.id,
                    rule: delayedAction.rule_name,
                    action: delayedAction.action_type,
                    success: false,
                    error: error.message
                });
            }
        }

        return Response.json({
            success: true,
            executed_actions: executedActions,
            processed_count: delayedActions.length
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});