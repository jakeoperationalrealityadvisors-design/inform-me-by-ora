import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        // Only admins can run scheduled checks
        if (user?.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const notificationsSent = [];

        // Check forms with deadlines
        const forms = await base44.asServiceRole.entities.FormSubmission.list();
        for (const form of forms) {
            if (form.due_date && form.status !== 'approved' && form.status !== 'rejected') {
                const dueDate = new Date(form.due_date);
                
                // Due in 24 hours
                if (dueDate <= tomorrow && dueDate > now && form.assigned_to_email) {
                    await base44.asServiceRole.entities.Notification.create({
                        user_email: form.assigned_to_email,
                        title: 'Task Due Soon',
                        message: `Form "${form.form_title}" is due within 24 hours`,
                        type: 'task_due_soon',
                        link_page: 'ViewFormSubmission',
                        link_params: `id=${form.id}`,
                        read: false
                    });

                    // Send email
                    await base44.functions.invoke('sendNotificationEmail', {
                        recipient_email: form.assigned_to_email,
                        subject: 'Task Due Soon - InForm Me',
                        message: `Your form submission "${form.form_title}" is due within 24 hours. Please complete it as soon as possible.`,
                        action_url: `${Deno.env.get('APP_URL')}/app/ViewFormSubmission?id=${form.id}`
                    });

                    notificationsSent.push({ type: 'form', id: form.id, user: form.assigned_to_email });
                }
            }
        }

        // Check checklists with deadlines
        const checklists = await base44.asServiceRole.entities.ChecklistSubmission.list();
        for (const checklist of checklists) {
            if (checklist.due_date && checklist.status !== 'completed' && checklist.assigned_to_email) {
                const dueDate = new Date(checklist.due_date);
                
                if (dueDate <= tomorrow && dueDate > now) {
                    await base44.asServiceRole.entities.Notification.create({
                        user_email: checklist.assigned_to_email,
                        title: 'Checklist Due Soon',
                        message: `Checklist "${checklist.checklist_title}" is due within 24 hours`,
                        type: 'task_due_soon',
                        link_page: 'ViewChecklistSubmission',
                        link_params: `id=${checklist.id}`,
                        read: false
                    });

                    await base44.functions.invoke('sendNotificationEmail', {
                        recipient_email: checklist.assigned_to_email,
                        subject: 'Checklist Due Soon - InForm Me',
                        message: `Your checklist "${checklist.checklist_title}" is due within 24 hours.`,
                        action_url: `${Deno.env.get('APP_URL')}/app/ViewChecklistSubmission?id=${checklist.id}`
                    });

                    notificationsSent.push({ type: 'checklist', id: checklist.id, user: checklist.assigned_to_email });
                }
            }
        }

        // Check standalone tasks
        const tasks = await base44.asServiceRole.entities.Task.list();
        for (const task of tasks) {
            if (task.due_date && task.status !== 'completed' && task.status !== 'cancelled' && task.assigned_to_email) {
                const dueDate = new Date(task.due_date);
                
                if (dueDate <= tomorrow && dueDate > now) {
                    await base44.asServiceRole.entities.Notification.create({
                        user_email: task.assigned_to_email,
                        title: 'Task Due Soon',
                        message: `Task "${task.title}" is due within 24 hours`,
                        type: 'task_due_soon',
                        link_page: 'MyTasks',
                        link_params: '',
                        read: false
                    });

                    await base44.functions.invoke('sendNotificationEmail', {
                        recipient_email: task.assigned_to_email,
                        subject: 'Task Due Soon - InForm Me',
                        message: `Your task "${task.title}" is due within 24 hours.`,
                        action_url: `${Deno.env.get('APP_URL')}/app/MyTasks`
                    });

                    notificationsSent.push({ type: 'task', id: task.id, user: task.assigned_to_email });
                }
            }
        }

        return Response.json({
            success: true,
            notificationsSent: notificationsSent.length,
            details: notificationsSent
        });

    } catch (error) {
        console.error('Deadline notification check error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});