import React from 'react';
import { useConnection } from './ConnectionManager';
import { useWebSocket } from './WebSocketProvider';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ConnectionMonitor({ minimal = false }) {
    const { isOnline, effectiveType, rtt, downlink } = useConnection();
    const { isConnected, connectionStatus } = useWebSocket();

    if (minimal) {
        return (
            <div className="flex items-center gap-2">
                {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                )}
                {isConnected && (
                    <Zap className="w-3 h-3 text-blue-500" />
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Badge variant={isOnline ? 'default' : 'destructive'} className="gap-1">
                {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                {isOnline ? 'Online' : 'Offline'}
            </Badge>
            
            {effectiveType && effectiveType !== 'unknown' && (
                <Badge variant="outline" className="gap-1">
                    <Activity className="w-3 h-3" />
                    {effectiveType}
                </Badge>
            )}
            
            {isConnected && (
                <Badge variant="secondary" className="gap-1">
                    <Zap className="w-3 h-3" />
                    Real-time
                </Badge>
            )}
            
            {rtt > 0 && (
                <span className={cn(
                    "text-xs",
                    rtt < 100 ? "text-green-600" : rtt < 300 ? "text-yellow-600" : "text-red-600"
                )}>
                    {rtt}ms
                </span>
            )}
        </div>
    );
}