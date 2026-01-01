import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { token, email } = await req.json();

        if (!token || !email) {
            return Response.json({ 
                error: 'Token and email are required' 
            }, { status: 400 });
        }

        // Find user with matching token and email
        const users = await base44.asServiceRole.entities.User.filter({ 
            email: email,
            verification_token: token
        });

        if (users.length === 0) {
            return Response.json({ 
                error: 'Invalid or expired verification token' 
            }, { status: 400 });
        }

        const user = users[0];

        // Check if token is expired (24 hours)
        if (user.verification_sent_at) {
            const sentAt = new Date(user.verification_sent_at);
            const now = new Date();
            const hoursDiff = (now - sentAt) / (1000 * 60 * 60);

            if (hoursDiff > 24) {
                return Response.json({ 
                    error: 'Verification token has expired. Please request a new one.' 
                }, { status: 400 });
            }
        }

        // Mark email as verified
        await base44.asServiceRole.entities.User.update(user.id, {
            email_verified: true,
            verification_token: null,
            verification_sent_at: null
        });

        return Response.json({ 
            success: true,
            message: 'Email verified successfully!' 
        });
    } catch (error) {
        console.error('Email verification error:', error);
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});