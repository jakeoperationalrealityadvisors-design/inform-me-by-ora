import React from 'react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function CategoryFilter({ categories, selected, onSelect }) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
                variant="ghost"
                size="sm"
                onClick={() => onSelect(null)}
                className={cn(
                    "rounded-full px-4 whitespace-nowrap transition-all",
                    !selected 
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30" 
                        : "bg-[#0f1419] text-blue-300 hover:bg-blue-950/50 border border-blue-900/30"
                )}
            >
                All
            </Button>
            {categories.map(cat => (
                <Button
                    key={cat.id}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSelect(cat.id)}
                    className={cn(
                        "rounded-full px-4 whitespace-nowrap transition-all",
                        selected === cat.id 
                            ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30" 
                            : "bg-[#0f1419] text-blue-300 hover:bg-blue-950/50 border border-blue-900/30"
                    )}
                >
                    {cat.name}
                </Button>
            ))}
        </div>
    );
}