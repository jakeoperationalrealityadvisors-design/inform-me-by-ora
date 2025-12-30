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
                        ? "bg-slate-900 text-white hover:bg-slate-800" 
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
                            ? "bg-slate-900 text-white hover:bg-slate-800" 
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    )}
                >
                    {cat.name}
                </Button>
            ))}
        </div>
    );
}