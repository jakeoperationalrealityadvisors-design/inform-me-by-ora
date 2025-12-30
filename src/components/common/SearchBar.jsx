import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
        </div>
    );
}