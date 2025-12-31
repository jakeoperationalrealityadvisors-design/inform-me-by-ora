import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const systemTemplates = [
    {
        name: 'High Priority Task Notification',
        description: 'Notify manager when a high priority task is created',
        category: 'task_management',
        trigger_type: 'task_created',
        trigger_config: {},
        condition_logic: {
            operator: 'AND',
            groups: [{
                operator: 'AND',
                conditions: [{
                    field: 'priority',
                    operator: 'equals',
                    value: 'high'
                }]
            }]
        },
        actions: [{
            type: 'send_notification',
            config: {
                recipient_email: 'manager@example.com',
                title: 'New High Priority Task',
                message: 'A new high priority task has been created and requires attention.'
            }
        }],
        is_system_template: true,
        usage_count: 0
    },
    {
        name: 'Assign New Forms to Team Lead',
        description: 'Automatically assign new form submissions to team lead',
        category: 'form_handling',
        trigger_type: 'form_submitted',
        trigger_config: {},
        condition_logic: {
            operator: 'AND',
            groups: []
        },
        actions: [{
            type: 'assign_task',
            config: {
                assignee_email: 'teamlead@example.com',
                priority: 'medium'
            }
        }, {
            type: 'send_notification',
            config: {
                recipient_email: 'teamlead@example.com',
                title: 'New Form Submission',
                message: 'A new form has been submitted and assigned to you.'
            }
        }],
        is_system_template: true,
        usage_count: 0
    },
    {
        name: 'Checklist Completion Follow-up',
        description: 'Create follow-up event when checklist is completed',
        category: 'approval_workflow',
        trigger_type: 'checklist_completed',
        trigger_config: {},
        condition_logic: {
            operator: 'AND',
            groups: []
        },
        actions: [{
            type: 'create_followup',
            config: {
                title: 'Review completed checklist',
                days_ahead: 3,
                assignee_email: 'manager@example.com'
            }
        }],
        is_system_template: true,
        usage_count: 0
    },
    {
        name: 'Overdue Task Escalation',
        description: 'Send escalation email when task becomes overdue',
        category: 'task_management',
        trigger_type: 'task_overdue',
        trigger_config: {},
        condition_logic: {
            operator: 'AND',
            groups: []
        },
        actions: [{
            type: 'send_email',
            config: {
                recipient_email: 'supervisor@example.com',
                subject: 'Overdue Task Alert',
                body: 'A task has become overdue and requires immediate attention.'
            }
        }, {
            type: 'update_status',
            config: {
                new_status: 'urgent'
            }
        }],
        is_system_template: true,
        usage_count: 0
    },
    {
        name: 'Document Upload Notification',
        description: 'Notify team when important document is uploaded',
        category: 'notifications',
        trigger_type: 'document_uploaded',
        trigger_config: {},
        condition_logic: {
            operator: 'AND',
            groups: []
        },
        actions: [{
            type: 'send_notification',
            config: {
                recipient_email: 'team@example.com',
                title: 'New Document Available',
                message: 'A new document has been uploaded and is available for review.'
            }
        }],
        is_system_template: true,
        usage_count: 0
    },
    {
        name: 'Approval Required Workflow',
        description: 'Request approval from manager for high-value submissions',
        category: 'approval_workflow',
        trigger_type: 'form_submitted',
        trigger_config: {},
        condition_logic: {
            operator: 'AND',
            groups: [{
                operator: 'OR',
                conditions: [{
                    field: 'priority',
                    operator: 'equals',
                    value: 'high'
                }, {
                    field: 'priority',
                    operator: 'equals',
                    value: 'urgent'
                }]
            }]
        },
        actions: [{
            type: 'update_status',
            config: {
                new_status: 'pending_approval'
            }
        }, {
            type: 'send_email',
            config: {
                recipient_email: 'approver@example.com',
                subject: 'Approval Required',
                body: 'A high-priority form submission requires your approval.'
            }
        }],
        is_system_template: true,
        usage_count: 0
    }
];

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
        }
        
        // Check if templates already exist
        const existing = await base44.asServiceRole.entities.AutomationTemplate.filter({ 
            is_system_template: true 
        });
        
        if (existing.length > 0) {
            return Response.json({ 
                message: 'System templates already initialized',
                count: existing.length 
            });
        }
        
        // Create system templates
        const created = [];
        for (const template of systemTemplates) {
            const result = await base44.asServiceRole.entities.AutomationTemplate.create(template);
            created.push(result);
        }
        
        return Response.json({ 
            success: true,
            message: `Successfully initialized ${created.length} system templates`,
            templates: created
        });
        
    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});