import React, { useEffect, useState } from 'react';
import { httpClient } from '@/api/httpClient';
import { offlineStorage } from './OfflineStorage';
import { toast } from 'sonner';
import { RefreshCw, ListChecks } from 'lucide-react';
import SyncStatusPanel from './SyncStatusPanel';
import { useBackgroundSync } from './BackgroundSync';

export function useSyncManager() {
    const [syncing, setSyncing] = useState(false);
    const [pendingItems, setPendingItems] = useState(0);

    const checkPendingSync = async () => {
        const queue = await offlineStorage.getSyncQueue();
        setPendingItems(queue.filter(item => !item.synced).length);
    };

    useEffect(() => {
        checkPendingSync();
        const interval = setInterval(checkPendingSync, 30000); // Check every 30s
        return () => clearInterval(interval);
    }, []);

    const syncNow = async () => {
        if (!navigator.onLine) {
            toast.error('No internet connection');
            return;
        }

        setSyncing(true);
        try {
            const queue = await offlineStorage.getSyncQueue();
            const unsyncedItems = queue.filter(item => !item.synced);

            for (const item of unsyncedItems) {
                try {
                    if (item.action === 'create') {
                        await httpClient.entities[item.entity].create(item.data);
                    } else if (item.action === 'update') {
                        await httpClient.entities[item.entity].update(item.data.id, item.data);
                    } else if (item.action === 'delete') {
                        await httpClient.entities[item.entity].delete(item.data.id);
                    }
                    
                    await offlineStorage.deleteData('syncQueue', item.id);
                } catch (error) {
                    console.error('Sync failed for item:', item, error);
                }
            }

            await checkPendingSync();
            toast.success('Sync completed');
        } catch (error) {
            toast.error('Sync failed');
            console.error('Sync error:', error);
        } finally {
            setSyncing(false);
        }
    };

    // Auto-sync when coming online
    useEffect(() => {
        const handleOnline = () => {
            if (pendingItems > 0) {
                syncNow();
            }
        };

        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, [pendingItems]);

    return { syncing, pendingItems, syncNow };
}

export default function SyncIndicator() {
    const { syncing, pendingItems, syncNow } = useSyncManager();
    const [showPanel, setShowPanel] = useState(false);
    const { syncQueue } = useBackgroundSync();

    useEffect(() => {
        // Initialize background sync
        syncQueue();
    }, []);

    if (pendingItems === 0) return null;

    return (
        <>
            <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-2">
                <button
                    onClick={() => setShowPanel(true)}
                    className="bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-all"
                    title="View sync details"
                >
                    <ListChecks className="w-5 h-5" />
                </button>
                <button
                    onClick={syncNow}
                    disabled={syncing || !navigator.onLine}
                    className="bg-orange-600 text-white rounded-full p-3 shadow-lg hover:bg-orange-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    <RefreshCw className={`w-5 h-5 ${syncing ? 'animate-spin' : ''}`} />
                    <span className="text-sm font-medium pr-1">
                        {syncing ? 'Syncing...' : `${pendingItems}`}
                    </span>
                </button>
            </div>
            
            <SyncStatusPanel open={showPanel} onOpenChange={setShowPanel} />
        </>
    );
}