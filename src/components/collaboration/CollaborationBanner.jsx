import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Eye, Edit3 } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CollaborationBanner({ otherUsers, hasUnsavedChanges }) {
    if (otherUsers.length === 0 && !hasUnsavedChanges) return null;

    const editingUsers = otherUsers.filter(u => u.is_editing);
    const viewingUsers = otherUsers.filter(u => !u.is_editing);

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
        >
            {otherUsers.length > 0 && (
                <Alert className="bg-blue-950/30 border-blue-900/50">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-400" />
                        <AlertDescription className="text-blue-300 text-sm">
                            {editingUsers.length > 0 && (
                                <span className="flex items-center gap-1">
                                    <Edit3 className="w-3 h-3" />
                                    <strong>{editingUsers.map(u => u.user_name).join(', ')}</strong>
                                    {editingUsers.length === 1 ? ' is' : ' are'} editing this
                                </span>
                            )}
                            {viewingUsers.length > 0 && (
                                <span className="flex items-center gap-1 ml-3">
                                    <Eye className="w-3 h-3" />
                                    {viewingUsers.map(u => u.user_name).join(', ')} viewing
                                </span>
                            )}
                        </AlertDescription>
                    </div>
                </Alert>
            )}
            
            {hasUnsavedChanges && otherUsers.some(u => u.is_editing) && (
                <Alert className="bg-orange-950/30 border-orange-900/50 mt-2">
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                    <AlertDescription className="text-orange-300 text-sm">
                        <strong>Warning:</strong> Others are editing. Save frequently to avoid conflicts.
                    </AlertDescription>
                </Alert>
            )}
        </motion.div>
    );
}