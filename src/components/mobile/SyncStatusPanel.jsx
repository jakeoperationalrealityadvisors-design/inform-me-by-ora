import React, { useState, useEffect } from 'react';
import { offlineStorage } from './OfflineStorage';
import { useBackgroundSync } from './BackgroundSync';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
    RefreshCw, Clock, CheckCircle2, XCircle, AlertTriangle, 
    Trash2, RotateCcw, X 
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function SyncStatusPanel({ open, onOpenChange }) {
    const [queueItems, setQueueItems] = useState([]);
    const [conflicts, setConflicts] = useState([]);
    const [failed, setFailed] = useState([]);
    const [syncing, setSyncing] = useState(false);
    const { syncQueue } = useBackgroundSync();

    const loadQueue = async () => {
        const queue = await offlineStorage.getSyncQueue();
        const pending = queue.filter(item => !item.synced && !item.error);
        const conflicted = queue.filter(item => item.error === 'conflict');
        const failedItems = queue.filter(item => item.error && item.error !== 'conflict');
        
        setQueueItems(pending);
        setConflicts(conflicted);
        setFailed(failedItems);
    };

    useEffect(() => {
        if (open) {
            loadQueue();
        }
    }, [open]);

    const handleSyncNow = async () => {
        setSyncing(true);
        try {
            await syncQueue();
            await loadQueue();
        } finally {
            setSyncing(false);
        }
    };

    const handleRetry = async (itemId) => {
        await offlineStorage.updateSyncItem(itemId, { error: null, attempts: 0 });
        await handleSyncNow();
    };

    const handleRemove = async (itemId) => {
        await offlineStorage.deleteData('syncQueue', itemId);
        await loadQueue();
        toast.success('Item removed from queue');
    };

    const handleResolveConflict = async (item, useLocal) => {
        if (useLocal) {
            // Force update with local data
            await offlineStorage.updateSyncItem(item.id, { error: null });
            await handleSyncNow();
        } else {
            // Discard local changes
            await offlineStorage.deleteData('syncQueue', item.id);
            await loadQueue();
            toast.info('Local changes discarded');
        }
    };

    const totalPending = queueItems.length + conflicts.length + failed.length;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-[#0f1419] text-white border-blue-900/20">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        <span>Sync Status</span>
                        {totalPending > 0 && (
                            <Button 
                                onClick={handleSyncNow} 
                                disabled={syncing || !navigator.onLine}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {syncing ? (
                                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                )}
                                Sync Now
                            </Button>
                        )}
                    </DialogTitle>
                </DialogHeader>

                {!navigator.onLine && (
                    <div className="bg-yellow-950/30 border border-yellow-900/50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-yellow-300 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" />
                            You're offline. Changes will sync when connection is restored.
                        </p>
                    </div>
                )}

                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid grid-cols-3 w-full bg-[#0a0e17]">
                        <TabsTrigger value="pending">
                            Pending ({queueItems.length})
                        </TabsTrigger>
                        <TabsTrigger value="conflicts">
                            Conflicts ({conflicts.length})
                        </TabsTrigger>
                        <TabsTrigger value="failed">
                            Failed ({failed.length})
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-2 mt-4">
                        {queueItems.length === 0 ? (
                            <div className="text-center py-8 text-blue-400/60">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No pending items</p>
                            </div>
                        ) : (
                            queueItems.map((item) => (
                                <div key={item.id} className="bg-[#0a0e17] border border-blue-900/20 rounded-lg p-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge className="bg-blue-600">
                                                    {item.action}
                                                </Badge>
                                                <span className="text-sm text-blue-300">{item.entity}</span>
                                            </div>
                                            {item.metadata?.description && (
                                                <p className="text-xs text-blue-400 mb-1">{item.metadata.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 text-xs text-blue-500">
                                                <Clock className="w-3 h-3" />
                                                {format(new Date(item.timestamp), 'MMM d, h:mm a')}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemove(item.id)}
                                            className="text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="conflicts" className="space-y-2 mt-4">
                        {conflicts.length === 0 ? (
                            <div className="text-center py-8 text-blue-400/60">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No conflicts</p>
                            </div>
                        ) : (
                            conflicts.map((item) => (
                                <div key={item.id} className="bg-orange-950/20 border border-orange-900/30 rounded-lg p-3">
                                    <div className="flex items-start gap-3 mb-3">
                                        <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-1" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-orange-300 mb-1">
                                                {item.entity} Conflict
                                            </h4>
                                            <p className="text-xs text-orange-400 mb-2">
                                                The server version was modified after your local changes
                                            </p>
                                            {item.metadata?.description && (
                                                <p className="text-xs text-orange-500">{item.metadata.description}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleResolveConflict(item, true)}
                                            className="flex-1 border-green-600 text-green-300"
                                        >
                                            Keep Local
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleResolveConflict(item, false)}
                                            className="flex-1 border-red-600 text-red-300"
                                        >
                                            Keep Server
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>

                    <TabsContent value="failed" className="space-y-2 mt-4">
                        {failed.length === 0 ? (
                            <div className="text-center py-8 text-blue-400/60">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No failed items</p>
                            </div>
                        ) : (
                            failed.map((item) => (
                                <div key={item.id} className="bg-red-950/20 border border-red-900/30 rounded-lg p-3">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <XCircle className="w-4 h-4 text-red-400" />
                                                <Badge className="bg-red-600">
                                                    {item.action}
                                                </Badge>
                                                <span className="text-sm text-red-300">{item.entity}</span>
                                            </div>
                                            {item.metadata?.description && (
                                                <p className="text-xs text-red-400 mb-1">{item.metadata.description}</p>
                                            )}
                                            <p className="text-xs text-red-500 mb-1">
                                                Error: {item.error}
                                            </p>
                                            <p className="text-xs text-red-600">
                                                Attempts: {item.attempts || 0}/{MAX_RETRY_ATTEMPTS}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRetry(item.id)}
                                            className="flex-1 border-blue-600 text-blue-300"
                                        >
                                            <RotateCcw className="w-3 h-3 mr-2" />
                                            Retry
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRemove(item.id)}
                                            className="flex-1 border-red-600 text-red-300"
                                        >
                                            <X className="w-3 h-3 mr-2" />
                                            Remove
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

const MAX_RETRY_ATTEMPTS = 3;