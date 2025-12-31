import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

async function retryOperation(fn, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const today = now.toISOString().split('T')[0];
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const notifications = [];

        // Check standalone tasks
        const tasks = await base44.asServiceRole.entities.Task.filter({
            status: { $in: ['todo', 'in_progress'] }
        });

        for (const task of tasks) {
            if (!task.due_date || !task.assigned_to_email) continue;

            const dueDate = task.due_date;
            
            // Overdue tasks
            if (dueDate < today) {
                notifications.push({
                    user_email: task.assigned_to_email,
                    title: 'Overdue Task',
                    message: `Task "${task.title}" is overdue`,
                    type: 'task_overdue',
                    link_page: 'MyTasks'
                });
            }
            // Due today
            else if (dueDate === today) {
                notifications.push({
                    user_email: task.assigned_to_email,
                    title: 'Task Due Today',
                    message: `Task "${task.title}" is due today`,
                    type: 'task_due_soon',
                    link_page: 'MyTasks'
                });
            }
            // Due tomorrow
            else if (dueDate === tomorrowStr) {
                notifications.push({
                    user_email: task.assigned_to_email,
                    title: 'Task Due Tomorrow',
                    message: `Task "${task.title}" is due tomorrow`,
                    type: 'task_due_soon',
                    link_page: 'MyTasks'
                });
            }
        }

        // Check form submissions
        const formSubmissions = await base44.asServiceRole.entities.FormSubmission.filter({
            status: { $in: ['submitted', 'in_progress'] }
        });

        for (const submission of formSubmissions) {
            if (!submission.due_date || !submission.assigned_to_email) continue;

            const dueDate = submission.due_date;
            
            if (dueDate < today) {
                notifications.push({
                    user_email: submission.assigned_to_email,
                    title: 'Overdue Form',
                    message: `Form "${submission.form_title}" is overdue`,
                    type: 'task_overdue',
                    link_page: 'ViewFormSubmission',
                    link_params: `?id=${submission.id}`
                });
            } else if (dueDate === today || dueDate === tomorrowStr) {
                notifications.push({
                    user_email: submission.assigned_to_email,
                    title: 'Form Due Soon',
                    message: `Form "${submission.form_title}" is due ${dueDate === today ? 'today' : 'tomorrow'}`,
                    type: 'task_due_soon',
                    link_page: 'ViewFormSubmission',
                    link_params: `?id=${submission.id}`
                });
            }
        }

        // Check checklist submissions
        const checklistSubmissions = await base44.asServiceRole.entities.ChecklistSubmission.filter({
            status: { $in: ['in_progress'] }
        });

        for (const submission of checklistSubmissions) {
            if (!submission.due_date || !submission.assigned_to_email) continue;

            const dueDate = submission.due_date;
            
            if (dueDate < today) {
                notifications.push({
                    user_email: submission.assigned_to_email,
                    title: 'Overdue Checklist',
                    message: `Checklist "${submission.checklist_title}" is overdue`,
                    type: 'task_overdue',
                    link_page: 'ViewChecklistSubmission',
                    link_params: `?id=${submission.id}`
                });
            } else if (dueDate === today || dueDate === tomorrowStr) {
                notifications.push({
                    user_email: submission.assigned_to_email,
                    title: 'Checklist Due Soon',
                    message: `Checklist "${submission.checklist_title}" is due ${dueDate === today ? 'today' : 'tomorrow'}`,
                    type: 'task_due_soon',
                    link_page: 'ViewChecklistSubmission',
                    link_params: `?id=${submission.id}`
                });
            }
        }

        // Create notifications with retry
        for (const notification of notifications) {
            try {
                await retryOperation(() => 
                    base44.asServiceRole.entities.Notification.create(notification)
                );
            } catch (error) {
                console.error('Failed to create notification:', error);
            }
        }

        return Response.json({
            success: true,
            notifications_created: notifications.length,
            checked: {
                tasks: tasks.length,
                forms: formSubmissions.length,
                checklists: checklistSubmissions.length
            }
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});