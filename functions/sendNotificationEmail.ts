import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { recipient_email, subject, message, action_url } = await req.json();

        if (!recipient_email || !subject || !message) {
            return Response.json({ 
                error: 'Missing required fields: recipient_email, subject, message' 
            }, { status: 400 });
        }

        // Check if user has email notifications enabled
        const settings = await base44.asServiceRole.entities.NotificationSettings.filter({
            created_by: recipient_email
        });

        const emailEnabled = settings.length === 0 || settings[0].email_notifications !== false;

        if (!emailEnabled) {
            return Response.json({ 
                success: false, 
                message: 'User has disabled email notifications' 
            });
        }

        // Build email body
        const emailBody = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #FF8C00 0%, #1E40AF 100%); padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">InForm Me</h1>
                </div>
                <div style="padding: 30px; background: #f8fafc;">
                    <h2 style="color: #1e293b; margin-bottom: 20px;">${subject}</h2>
                    <p style="color: #475569; line-height: 1.6;">${message}</p>
                    ${action_url ? `
                        <div style="margin-top: 30px; text-align: center;">
                            <a href="${action_url}" 
                               style="display: inline-block; background: #FF8C00; color: white; 
                                      padding: 12px 30px; text-decoration: none; border-radius: 8px;
                                      font-weight: 600;">
                                View Details
                            </a>
                        </div>
                    ` : ''}
                </div>
                <div style="padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
                    <p>This is an automated notification from InForm Me. 
                       To manage your notification preferences, visit your settings.</p>
                </div>
            </div>
        `;

        // Send email using Core integration
        await base44.integrations.Core.SendEmail({
            to: recipient_email,
            subject: subject,
            body: emailBody
        });

        return Response.json({ 
            success: true,
            message: 'Email notification sent successfully'
        });

    } catch (error) {
        console.error('Email notification error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});