import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckSquare, ChevronRight } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

export default function ChecklistCard({ checklist, category }) {
    const itemCount = checklist.items?.length || 0;
    
    return (
        <Link 
            to={createPageUrl(`FillChecklist?id=${checklist.id}`)}
            className="block group"
        >
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <CheckSquare className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-emerald-600 transition-colors">
                    {checklist.title}
                </h3>
                {checklist.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{checklist.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                    {category && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs">
                            {category.name}
                        </Badge>
                    )}
                </div>
            </div>
        </Link>
    );
}