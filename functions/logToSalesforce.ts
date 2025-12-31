import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { submission_id, submission_type, subject, description, priority, contact_email, contact_name } = await req.json();

        // Get Salesforce access token
        const accessToken = await base44.asServiceRole.connectors.getAccessToken('salesforce');

        // Get submission details if ID provided
        let submissionData = {};
        if (submission_id && submission_type) {
            const entity = submission_type === 'form' ? 'FormSubmission' : 'ChecklistSubmission';
            submissionData = await base44.asServiceRole.entities[entity].filter({ id: submission_id }).then(r => r[0]);
        }

        // Prepare Salesforce Case data
        const caseData = {
            Subject: subject || submissionData.form_title || submissionData.checklist_title || 'Support Request',
            Description: description || `Form submission from InForm Me\n\nSubmitted by: ${submissionData.submitted_by_name || contact_name}\nStatus: ${submissionData.status || 'New'}\n\nSubmission ID: ${submission_id}`,
            Priority: priority || submissionData.priority || 'Medium',
            Origin: 'Web',
            Status: 'New',
            SuppliedEmail: contact_email || submissionData.submitted_by_name || user.email,
            SuppliedName: contact_name || submissionData.submitted_by_name || user.full_name
        };

        // Get Salesforce instance URL from token endpoint
        const tokenInfoResponse = await fetch('https://login.salesforce.com/services/oauth2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const tokenInfo = await tokenInfoResponse.json();
        const instanceUrl = tokenInfo.urls?.custom_domain || 'https://login.salesforce.com';

        // Create Case in Salesforce
        const response = await fetch(`${instanceUrl}/services/data/v59.0/sobjects/Case`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(caseData)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Salesforce API error: ${error}`);
        }

        const result = await response.json();

        // Log activity
        await base44.asServiceRole.entities.ActivityLog.create({
            user_email: user.email,
            user_name: user.full_name,
            action_type: 'automation_created',
            description: `Support case logged to Salesforce: ${result.id}`,
            entity_type: 'salesforce_case',
            entity_id: result.id,
            metadata: { 
                salesforce_case_id: result.id,
                submission_id,
                submission_type 
            }
        });

        return Response.json({
            success: true,
            salesforce_case_id: result.id,
            message: 'Support request logged to Salesforce successfully'
        });

    } catch (error) {
        console.error('Salesforce integration error:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});