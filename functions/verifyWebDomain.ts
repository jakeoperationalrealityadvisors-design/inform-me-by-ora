import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();
        
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }
        
        const { organization_id } = await req.json();
        
        if (!organization_id) {
            return Response.json({ error: 'Organization ID is required' }, { status: 400 });
        }
        
        // Get organization
        const org = await base44.asServiceRole.entities.Organization.filter({ id: organization_id }).then(o => o[0]);
        
        if (!org) {
            return Response.json({ error: 'Organization not found' }, { status: 404 });
        }
        
        const domain = org.settings?.custom_domain;
        const verificationToken = org.settings?.domain_verification_token;
        const verificationMethod = org.settings?.verification_method || 'dns';
        
        if (!domain || !verificationToken) {
            return Response.json({ error: 'No domain pending verification' }, { status: 400 });
        }
        
        let verified = false;
        
        if (verificationMethod === 'dns') {
            // Check DNS TXT record
            try {
                const dnsQuery = await fetch(`https://dns.google/resolve?name=_base44-verification.${domain}&type=TXT`);
                const dnsData = await dnsQuery.json();
                
                if (dnsData.Answer) {
                    const txtRecords = dnsData.Answer
                        .filter(record => record.type === 16) // TXT records
                        .map(record => record.data.replace(/"/g, ''));
                    
                    verified = txtRecords.some(record => record === verificationToken);
                }
            } catch (error) {
                console.error('DNS verification error:', error);
                return Response.json({ 
                    error: 'Failed to verify DNS record',
                    details: error.message 
                }, { status: 500 });
            }
        } else {
            // Check HTML meta tag
            try {
                const response = await fetch(`https://${domain}`, {
                    headers: { 'User-Agent': 'Base44-Bot/1.0' }
                });
                const html = await response.text();
                
                const metaTagPattern = new RegExp(`<meta\\s+name=["']base44-verification["']\\s+content=["']${verificationToken}["']`, 'i');
                verified = metaTagPattern.test(html);
            } catch (error) {
                console.error('HTML verification error:', error);
                return Response.json({ 
                    error: 'Failed to fetch domain HTML',
                    details: error.message 
                }, { status: 500 });
            }
        }
        
        if (verified) {
            // Update organization to mark domain as verified
            await base44.asServiceRole.entities.Organization.update(organization_id, {
                settings: {
                    ...org.settings,
                    domain_verified: true,
                    domain_verified_at: new Date().toISOString()
                }
            });
            
            return Response.json({
                success: true,
                verified: true,
                domain,
                message: 'Domain verified successfully!'
            });
        } else {
            return Response.json({
                success: false,
                verified: false,
                domain,
                message: 'Domain verification failed. Please check your DNS/HTML settings and try again.'
            }, { status: 400 });
        }
        
    } catch (error) {
        console.error('Domain verification error:', error);
        return Response.json({ 
            error: error.message || 'Failed to verify domain' 
        }, { status: 500 });
    }
});