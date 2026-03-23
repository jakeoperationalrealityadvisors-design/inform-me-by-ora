import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { domain, organization_id, verification_method } = await req.json();
        
        if (!domain) {
            return Response.json({ error: 'Domain is required' }, { status: 400 });
        }
        
        // Validate domain format
        const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
        if (!domainRegex.test(domain)) {
            return Response.json({ error: 'Invalid domain format' }, { status: 400 });
        }
        
        // Generate verification token
        const verificationToken = crypto.randomUUID();
        
        // Create or update organization with domain settings
        if (organization_id) {
            const org = await base44.asServiceRole.entities.Organization.filter({ id: organization_id }).then(o => o[0]);
            
            if (!org) {
                return Response.json({ error: 'Organization not found' }, { status: 404 });
            }
            
            // Update organization settings with domain info
            await base44.asServiceRole.entities.Organization.update(organization_id, {
                settings: {
                    ...org.settings,
                    custom_domain: domain,
                    domain_verification_token: verificationToken,
                    domain_verified: false,
                    verification_method: verification_method || 'dns'
                }
            });
        }
        
        // Return verification instructions based on method
        const verificationInstructions = verification_method === 'dns' 
            ? {
                type: 'DNS Record',
                record_type: 'TXT',
                name: '_base44-verification',
                value: verificationToken,
                instructions: `Add a TXT record to your DNS with name "_base44-verification" and value "${verificationToken}"`
            }
            : {
                type: 'HTML Meta Tag',
                tag: `<meta name="base44-verification" content="${verificationToken}">`,
                instructions: `Add this meta tag to the <head> section of your website's homepage`
            };
        
        return Response.json({
            success: true,
            domain,
            verification_token: verificationToken,
            verification_instructions: verificationInstructions,
            status: 'pending_verification',
            message: 'Domain linked successfully. Please complete verification to activate.'
        });
        
    } catch (error) {
        console.error('Domain linking error:', error);
        return Response.json({ 
            error: error.message || 'Failed to link domain' 
        }, { status: 500 });
    }
});