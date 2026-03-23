import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Generate verification token
        const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        // Update user with verification token
        await base44.asServiceRole.entities.User.update(user.id, {
            verification_token: token,
            verification_sent_at: new Date().toISOString()
        });

        // Get app URL (you may need to adjust this based on your deployment)
        const appUrl = req.headers.get('origin') || 'https://your-app.base44.app';
        const verificationUrl = `${appUrl}/#/VerifyEmail?token=${token}&email=${encodeURIComponent(user.email)}`;

        // Send verification email
        await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: 'Verify your email - InForm Me',
            body: `
Hello ${user.full_name || 'there'},

Thank you for signing up for InForm Me! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.

Best regards,
The InForm Me Team
            `.trim()
        });

        return Response.json({ 
            success: true,
            message: 'Verification email sent' 
        });
    } catch (error) {
        console.error('Verification email error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});