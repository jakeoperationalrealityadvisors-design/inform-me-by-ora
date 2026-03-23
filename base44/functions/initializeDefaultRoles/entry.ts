import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const existingRoles = await base44.asServiceRole.entities.Role.list();
        
        if (existingRoles.length > 0) {
            return Response.json({ 
                message: 'Roles already exist',
                count: existingRoles.length 
            });
        }

        const defaultRoles = [
            {
                name: 'Viewer',
                description: 'Can view forms, checklists, and submissions',
                is_system_role: true,
                permissions: {
                    forms: { view: true, create: false, edit: false, delete: false, submit: false },
                    checklists: { view: true, create: false, edit: false, delete: false, submit: false },
                    tasks: { view: true, create: false, edit: false, delete: false },
                    documents: { view: true, upload: false, edit: false, delete: false },
                    submissions: { view_all: false, view_own: true, approve: false, reject: false },
                    automations: { view: false, create: false, edit: false, delete: false },
                    reports: { view: false },
                    users: { manage: false },
                    categories: { manage: false }
                }
            },
            {
                name: 'Contributor',
                description: 'Can view and submit forms and checklists',
                is_system_role: true,
                permissions: {
                    forms: { view: true, create: false, edit: false, delete: false, submit: true },
                    checklists: { view: true, create: false, edit: false, delete: false, submit: true },
                    tasks: { view: true, create: true, edit: true, delete: false },
                    documents: { view: true, upload: true, edit: false, delete: false },
                    submissions: { view_all: false, view_own: true, approve: false, reject: false },
                    automations: { view: false, create: false, edit: false, delete: false },
                    reports: { view: false },
                    users: { manage: false },
                    categories: { manage: false }
                }
            },
            {
                name: 'Editor',
                description: 'Can create and edit forms, checklists, and tasks',
                is_system_role: true,
                permissions: {
                    forms: { view: true, create: true, edit: true, delete: false, submit: true },
                    checklists: { view: true, create: true, edit: true, delete: false, submit: true },
                    tasks: { view: true, create: true, edit: true, delete: true },
                    documents: { view: true, upload: true, edit: true, delete: false },
                    submissions: { view_all: true, view_own: true, approve: false, reject: false },
                    automations: { view: true, create: false, edit: false, delete: false },
                    reports: { view: true },
                    users: { manage: false },
                    categories: { manage: false }
                }
            },
            {
                name: 'Approver',
                description: 'Can approve and reject submissions',
                is_system_role: true,
                permissions: {
                    forms: { view: true, create: false, edit: false, delete: false, submit: true },
                    checklists: { view: true, create: false, edit: false, delete: false, submit: true },
                    tasks: { view: true, create: true, edit: true, delete: false },
                    documents: { view: true, upload: true, edit: false, delete: false },
                    submissions: { view_all: true, view_own: true, approve: true, reject: true },
                    automations: { view: true, create: false, edit: false, delete: false },
                    reports: { view: true },
                    users: { manage: false },
                    categories: { manage: false }
                }
            },
            {
                name: 'Manager',
                description: 'Full access except user management',
                is_system_role: true,
                permissions: {
                    forms: { view: true, create: true, edit: true, delete: true, submit: true },
                    checklists: { view: true, create: true, edit: true, delete: true, submit: true },
                    tasks: { view: true, create: true, edit: true, delete: true },
                    documents: { view: true, upload: true, edit: true, delete: true },
                    submissions: { view_all: true, view_own: true, approve: true, reject: true },
                    automations: { view: true, create: true, edit: true, delete: true },
                    reports: { view: true },
                    users: { manage: false },
                    categories: { manage: true }
                }
            }
        ];

        for (const role of defaultRoles) {
            await base44.asServiceRole.entities.Role.create(role);
        }

        return Response.json({
            success: true,
            message: 'Default roles created',
            roles: defaultRoles.map(r => r.name)
        });

    } catch (error) {
        console.error('Error initializing roles:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});