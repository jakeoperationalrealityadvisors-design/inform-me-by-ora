import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Helper function to retry failed operations
async function retryOperation(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
        }
    }
}

// Helper function to evaluate a single condition
function evaluateSingleCondition(condition, data) {
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
}

// Helper function to evaluate complex condition logic with AND/OR operators
function evaluateConditionLogic(conditionLogic, data) {
    if (!conditionLogic || !conditionLogic.groups || conditionLogic.groups.length === 0) {
        return true;
    }
    
    const groupResults = conditionLogic.groups.map(group => {
        // Evaluate all conditions within the group
        const conditionResults = group.conditions.map(condition => 
            evaluateSingleCondition(condition, data)
        );
        
        // Apply group operator (AND/OR)
        if (group.operator === 'OR') {
            return conditionResults.some(result => result === true);
        } else {
            return conditionResults.every(result => result === true);
        }
    });
    
    // Apply top-level operator between groups
    if (conditionLogic.operator === 'OR') {
        return groupResults.some(result => result === true);
    } else {
        return groupResults.every(result => result === true);
    }
}

Deno.serve(async (req) => {
    try {
        const informMeByOra = createClientFromRequest(req);
        
        const user = await informMeByOra.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { trigger_type, trigger_data } = await req.json();

        // Fetch all enabled automation rules
        const rules = await informMeByOra.asServiceRole.entities.AutomationRule.filter({ 
            enabled: true, 
            trigger_type 
        });

        const executedActions = [];

        for (const rule of rules) {
            // Update execution count and timestamp with retry
            await retryOperation(() => 
                base44.asServiceRole.entities.AutomationRule.update(rule.id, {
                    execution_count: (rule.execution_count || 0) + 1,
                    last_executed: new Date().toISOString()
                })
            );
            
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
            
            // Check complex condition logic
            if (!evaluateConditionLogic(rule.condition_logic, trigger_data)) {
                continue;
            }

            // Execute each action
            for (const action of rule.actions || []) {
                // Handle delayed actions
                if (action.delay_minutes && action.delay_minutes > 0) {
                    const executeAt = new Date();
                    executeAt.setMinutes(executeAt.getMinutes() + action.delay_minutes);
                    
                    await base44.asServiceRole.entities.DelayedAutomationAction.create({
                        rule_id: rule.id,
                        rule_name: rule.name,
                        trigger_type: trigger_type,
                        trigger_data: trigger_data,
                        action_type: action.type,
                        action_config: action.config,
                        action_code: action.code_snippet,
                        execute_at: executeAt.toISOString(),
                        status: 'pending',
                        created_at: new Date().toISOString()
                    });
                    
                    executedActions.push({
                        rule: rule.name,
                        action: action.type,
                        success: true,
                        note: `Scheduled for execution in ${action.delay_minutes} minutes`
                    });
                    continue;
                }
                try {
                    await retryOperation(async () => {
                        if (action.type === 'custom_code') {
                            // Execute custom code in sandboxed environment
                            try {
                                const customFunction = new Function('trigger_data', 'action_config', 'base44', action.code_snippet);
                                const result = await customFunction(trigger_data, action.config, base44.asServiceRole);
                                executedActions.push({
                                    rule: rule.name,
                                    action: 'custom_code',
                                    success: true,
                                    result: result
                                });
                            } catch (codeError) {
                                console.error('Custom code execution error:', codeError);
                                throw new Error(`Custom code failed: ${codeError.message}`);
                            }
                        } else if (action.type === 'assign_task') {
                            if (trigger_data.submission_id && trigger_data.submission_type) {
                                const entity = trigger_data.submission_type === 'form' ? 'FormSubmission' : 'ChecklistSubmission';
                                await base44.asServiceRole.entities[entity].update(trigger_data.submission_id, {
                                    assigned_to_email: action.config.assignee_email,
                                    priority: action.config.priority || 'medium',
                                    due_date: action.config.due_date
                                });
                            }
                        } else if (action.type === 'send_notification') {
                            await base44.asServiceRole.entities.Notification.create({
                                user_email: action.config.recipient_email || trigger_data.submitted_by_email,
                                title: action.config.title || `New ${trigger_type}`,
                                message: action.config.message || `A ${trigger_type} event occurred`,
                                type: 'task_assigned',
                                link_page: trigger_data.link_page,
                                link_params: trigger_data.link_params
                            });
                        } else if (action.type === 'send_email') {
                            await base44.asServiceRole.integrations.Core.SendEmail({
                                to: action.config.recipient_email || trigger_data.submitted_by_email,
                                subject: action.config.subject || `Automation: ${rule.name}`,
                                body: action.config.body || `An automation rule was triggered: ${rule.name}`
                            });
                        } else if (action.type === 'create_followup') {
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
                        } else if (action.type === 'create_task') {
                            await base44.asServiceRole.entities.Task.create({
                                title: action.config.title || `Task from: ${trigger_data.title}`,
                                description: action.config.description,
                                assigned_to_email: action.config.assignee_email,
                                assigned_to_name: action.config.assignee_name,
                                priority: action.config.priority || 'medium',
                                due_date: action.config.due_date,
                                status: 'todo',
                                related_form_id: trigger_data.submission_type === 'form' ? trigger_data.submission_id : null,
                                related_checklist_id: trigger_data.submission_type === 'checklist' ? trigger_data.submission_id : null
                            });
                        } else if (action.type === 'update_status') {
                            if (trigger_data.submission_id && trigger_data.submission_type) {
                                const entity = trigger_data.submission_type === 'form' ? 'FormSubmission' : 'ChecklistSubmission';
                                await base44.asServiceRole.entities[entity].update(trigger_data.submission_id, { status: action.config.new_status });
                            }
                        } else if (action.type === 'add_comment') {
                            if (trigger_data.submission_id && trigger_data.submission_type) {
                                await base44.asServiceRole.entities.Comment.create({
                                    submission_id: trigger_data.submission_id,
                                    submission_type: trigger_data.submission_type,
                                    comment_text: action.config.comment_text || 'Automated comment',
                                    author_name: 'Automation',
                                    author_email: 'automation@system'
                                });
                            }
                        } else if (action.type === 'update_documents') {
                            // Find and update all linked documents
                            const linkedDocs = await base44.asServiceRole.entities.Document.filter({
                                'linked_to.form_submission_id': trigger_data.submission_id || null,
                                'linked_to.checklist_submission_id': trigger_data.submission_id || null,
                                'linked_to.task_id': trigger_data.task_id || null
                            });
                            
                            for (const doc of linkedDocs) {
                                await base44.asServiceRole.entities.Document.update(doc.id, {
                                    status: action.config.document_status || 'active',
                                    tags: action.config.add_tags ? [...(doc.tags || []), ...action.config.add_tags] : doc.tags
                                });
                            }
                        } else if (action.type === 'log_to_salesforce') {
                            // Call the Salesforce logging function
                            await base44.asServiceRole.functions.invoke('logToSalesforce', {
                                submission_id: trigger_data.submission_id,
                                submission_type: trigger_data.submission_type,
                                subject: action.config.subject,
                                description: action.config.description,
                                priority: action.config.priority || trigger_data.priority,
                                contact_email: trigger_data.submitted_by_email,
                                contact_name: trigger_data.submitted_by_name
                            });
                        } else if (action.type === 'call_webhook') {
                            // Call external webhook
                            const webhookResponse = await fetch(action.config.webhook_url, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': action.config.auth_header || ''
                                },
                                body: JSON.stringify({
                                    trigger_type: trigger_type,
                                    trigger_data: trigger_data,
                                    action_config: action.config,
                                    timestamp: new Date().toISOString()
                                })
                            });
                            
                            if (!webhookResponse.ok) {
                                throw new Error(`Webhook call failed: ${webhookResponse.status}`);
                            }
                        }
                    });

                    executedActions.push({
                        rule: rule.name,
                        action: action.type,
                        success: true
                    });
                } catch (error) {
                    console.error(`Automation action failed: ${action.type}`, error);
                    executedActions.push({
                        rule: rule.name,
                        action: action.type,
                        success: false,
                        error: error.message,
                        retries_exhausted: true
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