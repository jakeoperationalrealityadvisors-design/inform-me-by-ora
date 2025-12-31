import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const accessToken = await base44.asServiceRole.connectors.getAccessToken('tiktok');

        // Fetch user info (username, display name, avatar)
        const userInfoResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!userInfoResponse.ok) {
            const error = await userInfoResponse.text();
            return Response.json({ error: 'Failed to fetch user info', details: error }, { status: 500 });
        }

        const userInfo = await userInfoResponse.json();

        // Fetch user stats (followers, likes, video count)
        const statsResponse = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=follower_count,following_count,likes_count,video_count', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!statsResponse.ok) {
            const error = await statsResponse.text();
            return Response.json({ error: 'Failed to fetch stats', details: error }, { status: 500 });
        }

        const stats = await statsResponse.json();

        return Response.json({
            profile: userInfo.data?.user || {},
            stats: stats.data?.user || {}
        });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});