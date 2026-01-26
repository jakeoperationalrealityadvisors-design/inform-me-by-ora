import { useEffect, useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';

export function useCollaboration(entityType, entityId, user) {
    const queryClient = useQueryClient();
    const sessionIdRef = useRef(null);
    const [cursorPosition, setCursorPosition] = useState(null);

    // Fetch active sessions
    const { data: sessions = [] } = useQuery({
        queryKey: ['collaboration-sessions', entityType, entityId],
        queryFn: async () => {
            const now = new Date();
            const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
            
            const all = await httpClient.entities.CollaborationSession.filter({
                entity_type: entityType,
                entity_id: entityId
            });

            return all.filter(s => {
                const lastHeartbeat = new Date(s.last_heartbeat || s.created_date);
                return lastHeartbeat > fiveMinutesAgo;
            });
        },
        refetchInterval: 3000,
        enabled: !!entityId && !!user
    });

    const createSessionMutation = useMutation({
        mutationFn: (data) => httpClient.entities.CollaborationSession.create(data),
        onSuccess: (data) => {
            sessionIdRef.current = data.id;
            queryClient.invalidateQueries(['collaboration-sessions']);
        }
    });

    const updateSessionMutation = useMutation({
        mutationFn: ({ id, data }) => httpClient.entities.CollaborationSession.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['collaboration-sessions']);
        }
    });

    const deleteSessionMutation = useMutation({
        mutationFn: (id) => httpClient.entities.CollaborationSession.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['collaboration-sessions']);
        }
    });

    // Join session on mount
    useEffect(() => {
        if (!entityId || !user) return;

        const joinSession = async () => {
            // Check if user already has a session
            const existingSession = sessions.find(s => s.user_email === user.email);
            
            if (existingSession) {
                sessionIdRef.current = existingSession.id;
                // Update heartbeat
                updateSessionMutation.mutate({
                    id: existingSession.id,
                    data: { last_heartbeat: new Date().toISOString(), is_editing: true }
                });
            } else {
                // Create new session
                createSessionMutation.mutate({
                    entity_type: entityType,
                    entity_id: entityId,
                    user_email: user.email,
                    user_name: user.full_name || user.email,
                    last_heartbeat: new Date().toISOString(),
                    is_editing: true
                });
            }
        };

        joinSession();

        // Heartbeat interval
        const heartbeatInterval = setInterval(() => {
            if (sessionIdRef.current) {
                updateSessionMutation.mutate({
                    id: sessionIdRef.current,
                    data: { last_heartbeat: new Date().toISOString() }
                });
            }
        }, 30000); // Every 30 seconds

        // Cleanup on unmount
        return () => {
            clearInterval(heartbeatInterval);
            if (sessionIdRef.current) {
                deleteSessionMutation.mutate(sessionIdRef.current);
                sessionIdRef.current = null;
            }
        };
    }, [entityId, user?.email]);

    // Update cursor position
    const updateCursor = (position) => {
        setCursorPosition(position);
        if (sessionIdRef.current) {
            updateSessionMutation.mutate({
                id: sessionIdRef.current,
                data: { 
                    cursor_position: position,
                    last_heartbeat: new Date().toISOString()
                }
            });
        }
    };

    const otherUsers = sessions.filter(s => s.user_email !== user?.email);

    return {
        sessions,
        otherUsers,
        updateCursor,
        cursorPosition,
        isCollaborating: otherUsers.length > 0
    };
}