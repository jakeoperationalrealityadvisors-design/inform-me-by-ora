import { useEffect } from 'react';
import { httpClient } from '@/api/httpClient';
import { offlineStorage } from './OfflineStorage';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const MAX_RETRY_ATTEMPTS = 3;

export function useBackgroundSync() {
    const queryClient = useQueryClient();

    const syncQueue = async () => {
        if (!navigator.onLine) return { success: false, reason: 'offline' };

        try {
            const queue = await offlineStorage.getSyncQueue();
            const unsyncedItems = queue.filter(item => !item.synced);

            if (unsyncedItems.length === 0) {
                return { success: true, synced: 0 };
            }

            const results = {
                success: true,
                synced: 0,
                failed: 0,
                conflicts: []
            };

            for (const item of unsyncedItems) {
                try {
                    let result;
                    
                    // Execute the queued action
                    if (item.action === 'create') {
                        result = await httpClient.entities[item.entity].create(item.data);
                    } else if (item.action === 'update') {
                        // Check for conflicts before updating
                        try {
                            const existing = await httpClient.entities[item.entity].filter({ id: item.data.id });
                            if (existing.length > 0) {
                                const serverVersion = existing[0];
                                const serverModified = new Date(serverVersion.updated_date).getTime();
                                const localModified = item.timestamp;
                                
                                // Conflict detection
                                if (serverModified > localModified) {
                                    results.conflicts.push({
                                        item,
                                        serverData: serverVersion,
                                        localData: item.data
                                    });
                                    await offlineStorage.updateSyncItem(item.id, {
                                        error: 'conflict',
                                        serverData: serverVersion
                                    });
                                    continue;
                                }
                            }
                        } catch (checkError) {
                            console.warn('Could not check for conflicts:', checkError);
                        }
                        
                        result = await httpClient.entities[item.entity].update(item.data.id, item.data);
                    } else if (item.action === 'delete') {
                        result = await httpClient.entities[item.entity].delete(item.data.id);
                    }
                    
                    // Mark as synced and remove from queue
                    await offlineStorage.deleteData('syncQueue', item.id);
                    results.synced++;
                    
                    // Invalidate relevant queries
                    queryClient.invalidateQueries([item.entity.toLowerCase() + 's']);
                    
                } catch (error) {
                    console.error('Sync failed for item:', item, error);
                    results.failed++;
                    
                    // Update retry count
                    const attempts = (item.attempts || 0) + 1;
                    
                    if (attempts >= MAX_RETRY_ATTEMPTS) {
                        await offlineStorage.updateSyncItem(item.id, {
                            attempts,
                            error: error.message || 'Sync failed after max retries'
                        });
                    } else {
                        await offlineStorage.updateSyncItem(item.id, {
                            attempts
                        });
                    }
                }
            }

            // Show notification based on results
            if (results.synced > 0) {
                toast.success(`Synced ${results.synced} item(s)`);
            }
            
            if (results.conflicts.length > 0) {
                toast.warning(`${results.conflicts.length} conflict(s) detected`);
            }
            
            if (results.failed > 0 && results.synced === 0) {
                toast.error(`${results.failed} item(s) failed to sync`);
            }

            return results;
        } catch (error) {
            console.error('Background sync error:', error);
            return { success: false, error };
        }
    };

    // Auto-sync on network reconnection
    useEffect(() => {
        const handleOnline = async () => {
            const queue = await offlineStorage.getSyncQueue();
            const pending = queue.filter(item => !item.synced).length;
            
            if (pending > 0) {
                toast.info('Connection restored. Syncing...');
                await syncQueue();
            }
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    // Periodic sync check (every 5 minutes when online)
    useEffect(() => {
        const interval = setInterval(async () => {
            if (navigator.onLine) {
                const queue = await offlineStorage.getSyncQueue();
                const pending = queue.filter(item => !item.synced && !item.error).length;
                if (pending > 0) {
                    await syncQueue();
                }
            }
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return { syncQueue };
}

// Helper function to queue actions
export async function queueOfflineAction(action, entity, data, description) {
    await offlineStorage.addToSyncQueue(action, entity, data, {
        description,
        queuedAt: new Date().toISOString()
    });
    
    toast.success('Action queued for sync', {
        description: description || `${action} ${entity}`,
        duration: 2000
    });
}