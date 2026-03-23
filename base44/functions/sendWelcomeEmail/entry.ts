import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { userId } = await req.json();

        if (!userId) {
            return Response.json({ error: 'User ID required' }, { status: 400 });
        }

        // Get user details
        const users = await base44.asServiceRole.entities.User.filter({ id: userId });
        if (users.length === 0) {
            return Response.json({ error: 'User not found' }, { status: 404 });
        }

        const user = users[0];

        // Generate verification token and send verification email
        const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        await base44.asServiceRole.entities.User.update(user.id, {
            verification_token: token,
            verification_sent_at: new Date().toISOString()
        });

        const appUrl = req.headers.get('origin') || 'https://your-app.base44.app';
        const verificationUrl = `${appUrl}/#/VerifyEmail?token=${token}&email=${encodeURIComponent(user.email)}`;

        // Send welcome + verification email
        await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: 'Welcome to InForm Me!',
            body: `
Hello ${user.full_name || 'there'},

Welcome to InForm Me! We're excited to have you on board.

To get started, please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

Once verified, you'll have full access to:
✓ Create custom forms and checklists
✓ Manage documents and tasks
✓ Automate workflows
✓ Collaborate with your team

Need help? Visit our support page or reply to this email.

Best regards,
The InForm Me Team
            `.trim()
        });

        return Response.json({ 
            success: true,
            message: 'Welcome email sent' 
        });
    } catch (error) {
        console.error('Welcome email error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});