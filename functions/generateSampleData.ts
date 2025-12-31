import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        // Admin only
        const user = await base44.auth.me();
        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }
        
        const { type } = await req.json();
        
        if (type === 'forms') {
            // Get all active forms
            const forms = await base44.asServiceRole.entities.FormTemplate.filter({ status: 'active' });
            const categories = await base44.asServiceRole.entities.Category.list();
            
            const results = [];
            
            for (const form of forms) {
                const category = categories.find(c => c.id === form.category_id);
                
                // Generate realistic sample data using AI
                const sampleData = await base44.integrations.Core.InvokeLLM({
                    prompt: `Generate realistic sample data for this form:
Title: ${form.title}
Description: ${form.description || 'No description'}
Category: ${category?.name || 'General'}

Fields:
${form.fields.map(f => `- ${f.label} (${f.type})${f.required ? ' *required' : ''}`).join('\n')}

Return a JSON object with field IDs as keys and realistic sample values.
For select fields with options, choose from: ${form.fields.filter(f => f.type === 'select').map(f => `${f.id}: [${f.options?.join(', ')}]`).join(', ')}

Make the data realistic and contextually appropriate for the form category and purpose.`,
                    response_json_schema: {
                        type: "object",
                        properties: {
                            responses: { type: "object" },
                            notes: { type: "string" }
                        }
                    }
                });
                
                // Create the sample submission
                const submission = await base44.asServiceRole.entities.FormSubmission.create({
                    form_template_id: form.id,
                    form_title: form.title,
                    responses: sampleData.responses,
                    submitted_by_name: 'Sample User',
                    notes: sampleData.notes || 'AI-generated sample submission',
                    status: 'submitted',
                    priority: 'medium'
                });
                
                results.push({
                    form: form.title,
                    submissionId: submission.id,
                    category: category?.name
                });
            }
            
            return Response.json({ 
                success: true, 
                message: `Generated ${results.length} sample form submissions`,
                results 
            });
        }
        
        if (type === 'checklists') {
            // Get all active checklists
            const checklists = await base44.asServiceRole.entities.ChecklistTemplate.filter({ status: 'active' });
            const categories = await base44.asServiceRole.entities.Category.list();
            
            const results = [];
            
            for (const checklist of checklists) {
                const category = categories.find(c => c.id === checklist.category_id);
                
                // Generate realistic completion data
                const itemIds = checklist.items.map(i => i.id);
                const completedCount = Math.floor(itemIds.length * 0.7); // 70% completion
                const completedItems = itemIds.slice(0, completedCount);
                
                // Generate notes for items
                const itemNotes = {};
                for (const item of checklist.items.slice(0, 3)) {
                    if (item.notes_enabled) {
                        const noteData = await base44.integrations.Core.InvokeLLM({
                            prompt: `Generate a brief, realistic inspection note for this checklist item: "${item.text}". Keep it under 50 words.`,
                            response_json_schema: {
                                type: "object",
                                properties: {
                                    note: { type: "string" }
                                }
                            }
                        });
                        itemNotes[item.id] = noteData.note;
                    }
                }
                
                // Create the sample submission
                const submission = await base44.asServiceRole.entities.ChecklistSubmission.create({
                    checklist_template_id: checklist.id,
                    checklist_title: checklist.title,
                    completed_items: completedItems,
                    item_notes: itemNotes,
                    submitted_by_name: 'Sample Inspector',
                    completion_percentage: Math.round((completedCount / itemIds.length) * 100),
                    status: completedCount === itemIds.length ? 'completed' : 'in_progress',
                    priority: 'medium'
                });
                
                results.push({
                    checklist: checklist.title,
                    submissionId: submission.id,
                    completionRate: `${completedCount}/${itemIds.length}`,
                    category: category?.name
                });
            }
            
            return Response.json({ 
                success: true, 
                message: `Generated ${results.length} sample checklist submissions`,
                results 
            });
        }
        
        return Response.json({ error: 'Invalid type. Use "forms" or "checklists"' }, { status: 400 });
        
    } catch (error) {
        console.error('Sample data generation error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});