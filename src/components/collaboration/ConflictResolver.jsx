import React from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from 'lucide-react';

export default function ConflictResolver({ 
    isOpen, 
    onResolve, 
    localVersion, 
    serverVersion,
    entityType 
}) {
    const handleKeepLocal = () => {
        onResolve('local');
    };

    const handleUseServer = () => {
        onResolve('server');
    };

    const handleMerge = () => {
        onResolve('merge');
    };

    return (
        <AlertDialog open={isOpen}>
            <AlertDialogContent className="bg-[#0f1419] border-blue-900/20 max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        Edit Conflict Detected
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-blue-400">
                        Someone else modified this {entityType} while you were editing. Choose how to resolve:
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="grid grid-cols-2 gap-4 my-4">
                    <div className="border border-blue-900/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-white mb-2">Your Version</h4>
                        <div className="text-xs text-blue-300 space-y-1">
                            <p>Last edited: {localVersion?.timestamp ? new Date(localVersion.timestamp).toLocaleString() : 'Now'}</p>
                            <p className="text-blue-400/70">Your unsaved changes</p>
                        </div>
                    </div>

                    <div className="border border-blue-900/30 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-white mb-2">Server Version</h4>
                        <div className="text-xs text-blue-300 space-y-1">
                            <p>Last edited: {serverVersion?.updated_date ? new Date(serverVersion.updated_date).toLocaleString() : 'Unknown'}</p>
                            <p className="text-blue-400/70">By: {serverVersion?.updated_by || 'Another user'}</p>
                        </div>
                    </div>
                </div>

                <AlertDialogFooter>
                    <AlertDialogCancel onClick={handleUseServer} className="border-blue-900/30 text-blue-400">
                        Use Server Version
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleKeepLocal} className="bg-[#FF8C00] hover:bg-[#FF8C00]/90 text-black">
                        Keep My Changes
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}