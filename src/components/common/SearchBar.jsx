import React from 'react';
import { Search } from 'lucide-react';
import { Input } from "@/components/ui/input";

export default function SearchBar({ value, onChange, placeholder = "Search..." }) {
    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-400" />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-10 bg-[#0f1419] border-blue-900/30 focus:bg-black/40 text-white placeholder:text-blue-400/50 transition-colors focus:border-blue-600"
            />
        </div>
    );
}