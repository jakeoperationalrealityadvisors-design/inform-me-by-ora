import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { FileText, ChevronRight, Clock } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

export default function FormCard({ form, category }) {
    const fieldCount = form.fields?.length || 0;
    
    return (
        <Link 
            to={createPageUrl(`FillForm?id=${form.id}`)}
            className="block group"
        >
            <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {form.title}
                </h3>
                {form.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{form.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{fieldCount} field{fieldCount !== 1 ? 's' : ''}</span>
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