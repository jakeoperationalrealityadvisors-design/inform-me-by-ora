import React from 'react';
import { Button } from "@/components/ui/button";

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-950/30 flex items-center justify-center mb-6">
                <Icon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-blue-300/70 text-center max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} className="bg-blue-600 hover:bg-blue-700">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
}