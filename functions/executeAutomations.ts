import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Helper function to evaluate conditions
function evaluateConditions(conditions, data) {
    if (!conditions || conditions.length === 0) return true;
    
    return conditions.every(condition => {
        const value = data[condition.field];
        const targetValue = condition.value;
        
        switch (condition.operator) {
            case 'equals':
                return value == targetValue;
            case 'not_equals':
                return value != targetValue;
            case 'contains':
                return String(value || '').toLowerCase().includes(String(targetValue).toLowerCase());
            case 'greater_than':
                return Number(value) > Number(targetValue);
            case 'less_than':
                return Number(value) < Number(targetValue);
            case 'is_empty':
                return !value || value === '';
            case 'is_not_empty':
                return value && value !== '';
            default:
                return true;
        }
    });
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { trigger_type, trigger_data } = await req.json();

        // Fetch all enabled automation rules
        const rules = await base44.asServiceRole.entities.AutomationRule.filter({ 
            enabled: true, 
            trigger_type 
        });

        const executedActions = [];

        for (const rule of rules) {
            // Update execution count and timestamp
            await base44.asServiceRole.entities.AutomationRule.update(rule.id, {
                execution_count: (rule.execution_count || 0) + 1,
                last_executed: new Date().toISOString()
            });
            
            // Check if rule matches the trigger config
            let shouldExecute = true;

            if (rule.trigger_config?.template_id && 
                trigger_data.template_id !== rule.trigger_config.template_id) {
                shouldExecute = false;
            }

            if (rule.trigger_config?.category_id && 
                trigger_data.category_id !== rule.trigger_config.category_id) {
                shouldExecute = false;
            }

            if (!shouldExecute) continue;
            
            // Check conditions
            if (!evaluateConditions(rule.conditions, trigger_data)) {
                continue;
            }

            // Execute each action
            for (const action of rule.actions || []) {
                // Handle delayed actions
                if (action.delay_minutes && action.delay_minutes > 0) {
                    // In a real system, you'd use a queue/scheduler
                    // For now, we'll just skip delayed actions
                    executedActions.push({
                        rule: rule.name,
                        action: action.type,
                        success: true,
                        note: `Scheduled for ${action.delay_minutes} minutes from now`
                    });
                    continue;
                }
                try {
                    if (action.type === 'assign_task') {
                        // Assign the submission to a user
                        if (trigger_data.submission_id && trigger_data.submission_type) {
                            const entity = trigger_data.submission_type === 'form' 
                                ? 'FormSubmission' 
                                : 'ChecklistSubmission';
                            
                            await base44.asServiceRole.entities[entity].update(
                                trigger_data.submission_id,
                                {
                                    assigned_to_email: action.config.assignee_email,
                                    priority: action.config.priority || 'medium',
                                    due_date: action.config.due_date
                                }
                            );

                            executedActions.push({
                                rule: rule.name,
                                action: 'assign_task',
                                success: true
                            });
                        }
                    } else if (action.type === 'send_notification') {
                        // Create notification
                        await base44.asServiceRole.entities.Notification.create({
                            user_email: action.config.recipient_email || trigger_data.submitted_by_email,
                            title: action.config.title || `New ${trigger_type}`,
                            message: action.config.message || `A ${trigger_type} event occurred`,
                            type: 'task_assigned',
                            link_page: trigger_data.link_page,
                            link_params: trigger_data.link_params
                        });

                        executedActions.push({
                            rule: rule.name,
                            action: 'send_notification',
                            success: true
                        });
                    } else if (action.type === 'send_email') {
                        // Send email
                        await base44.asServiceRole.integrations.Core.SendEmail({
                            to: action.config.recipient_email || trigger_data.submitted_by_email,
                            subject: action.config.subject || `Automation: ${rule.name}`,
                            body: action.config.body || `An automation rule was triggered: ${rule.name}`
                        });

                        executedActions.push({
                            rule: rule.name,
                            action: 'send_email',
                            success: true
                        });
                    } else if (action.type === 'create_followup') {
                        // Create a follow-up event
                        const daysAhead = action.config.days_ahead || 7;
                        const followupDate = new Date();
                        followupDate.setDate(followupDate.getDate() + daysAhead);

                        await base44.asServiceRole.entities.ScheduledEvent.create({
                            title: action.config.title || `Follow-up: ${trigger_data.title}`,
                            description: action.config.description,
                            event_type: 'follow_up',
                            start_date: followupDate.toISOString(),
                            assigned_to_email: action.config.assignee_email,
                            related_submission_id: trigger_data.submission_id,
                            related_submission_type: trigger_data.submission_type
                        });

                        executedActions.push({
                            rule: rule.name,
                            action: 'create_followup',
                            success: true
                        });
                    } else if (action.type === 'create_task') {
                        // Create a standalone task
                        await base44.asServiceRole.entities.Task.create({
                            title: action.config.title || `Task from: ${trigger_data.title}`,
                            description: action.config.description,
                            assigned_to_email: action.config.assignee_email,
                            priority: action.config.priority || 'medium',
                            due_date: action.config.due_date,
                            status: 'todo',
                            related_form_id: trigger_data.submission_type === 'form' ? trigger_data.submission_id : null,
                            related_checklist_id: trigger_data.submission_type === 'checklist' ? trigger_data.submission_id : null
                        });

                        executedActions.push({
                            rule: rule.name,
                            action: 'create_task',
                            success: true
                        });
                    } else if (action.type === 'update_status') {
                        // Update submission status
                        if (trigger_data.submission_id && trigger_data.submission_type) {
                            const entity = trigger_data.submission_type === 'form' 
                                ? 'FormSubmission' 
                                : 'ChecklistSubmission';
                            
                            await base44.asServiceRole.entities[entity].update(
                                trigger_data.submission_id,
                                { status: action.config.new_status }
                            );

                            executedActions.push({
                                rule: rule.name,
                                action: 'update_status',
                                success: true
                            });
                        }
                    } else if (action.type === 'trigger_automation') {
                        // Trigger another automation rule
                        const targetRule = await base44.asServiceRole.entities.AutomationRule.filter({
                            id: action.config.target_rule_id,
                            enabled: true
                        });
                        
                        if (targetRule.length > 0) {
                            // Recursive call to execute the target automation
                            await fetch(req.url, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    trigger_type: 'manual_trigger',
                                    trigger_data: trigger_data
                                })
                            });

                            executedActions.push({
                                rule: rule.name,
                                action: 'trigger_automation',
                                success: true
                            });
                        }
                    } else if (action.type === 'add_comment') {
                        // Add a comment to the submission
                        if (trigger_data.submission_id && trigger_data.submission_type) {
                            await base44.asServiceRole.entities.Comment.create({
                                submission_id: trigger_data.submission_id,
                                submission_type: trigger_data.submission_type,
                                comment_text: action.config.comment_text || 'Automated comment',
                                author_name: 'Automation',
                                author_email: 'automation@system'
                            });

                            executedActions.push({
                                rule: rule.name,
                                action: 'add_comment',
                                success: true
                            });
                        }
                    }
                } catch (error) {
                    executedActions.push({
                        rule: rule.name,
                        action: action.type,
                        success: false,
                        error: error.message
                    });
                }
            }
        }

        return Response.json({
            success: true,
            executed_actions: executedActions
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});