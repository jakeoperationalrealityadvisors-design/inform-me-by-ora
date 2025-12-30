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
            <div className="bg-[#0f1419] rounded-2xl border border-blue-900/20 p-5 hover:border-blue-600/50 hover:shadow-lg hover:shadow-blue-600/10 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-600/30">
                        <FileText className="w-6 h-6 text-white" />
                    </div>
                    <ChevronRight className="w-5 h-5 text-blue-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-blue-400 transition-colors">
                    {form.title}
                </h3>
                {form.description && (
                    <p className="text-sm text-blue-300/70 line-clamp-2 mb-3">{form.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-blue-400/60">
                    <span>{fieldCount} field{fieldCount !== 1 ? 's' : ''}</span>
                    {category && (
                        <Badge variant="secondary" className="bg-blue-950/50 text-blue-300 text-xs border-blue-800/30">
                            {category.name}
                        </Badge>
                    )}
                </div>
            </div>
        </Link>
    );
}