import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { ArrowLeft, Search, FileText, Calendar } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function DocumentSearch() {
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    const { data: documents = [] } = useQuery({
        queryKey: ['documents'],
        queryFn: () => httpClient.entities.Document.list()
    });

    const performSearch = async () => {
        if (!searchTerm.trim()) return;

        setIsSearching(true);
        try {
            const searchLower = searchTerm.toLowerCase();
            
            // Filter and map in single pass for better performance
            const filtered = documents
                .filter(doc => {
                    const titleMatch = doc.title?.toLowerCase().includes(searchLower);
                    const descMatch = doc.description?.toLowerCase().includes(searchLower);
                    const tagMatch = doc.tags?.some(tag => tag.toLowerCase().includes(searchLower));
                    return titleMatch || descMatch || tagMatch;
                })
                .map(doc => {
                    // Extract snippet if found in description
                    if (doc.description?.toLowerCase().includes(searchLower)) {
                        const matchIndex = doc.description.toLowerCase().indexOf(searchLower);
                        return {
                            ...doc,
                            snippet: doc.description.substring(
                                Math.max(0, matchIndex - 50), 
                                Math.min(doc.description.length, matchIndex + 150)
                            ),
                            matchFound: true
                        };
                    }
                    return doc;
                })
                .slice(0, 50); // Limit results for performance

            setResults(filtered);
        } catch (error) {
            console.error('Search error:', error);
        }
        setIsSearching(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0e17]">
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Documents')}>
                            <Button variant="ghost" size="icon" className="rounded-full text-blue-400">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-white">Document Search</h1>
                            <p className="text-sm text-blue-400">Search within scanned documents</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
                {/* Search Input */}
                <Card className="bg-[#0f1419] border-blue-900/20">
                    <CardContent className="pt-6">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                                <Input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Search text within documents..."
                                    className="pl-10 bg-[#0a0e17] border-blue-900/30 text-white h-12"
                                />
                            </div>
                            <Button
                                onClick={performSearch}
                                disabled={isSearching || !searchTerm.trim()}
                                className="bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results */}
                {results.length > 0 ? (
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-white">
                            Found {results.length} result{results.length !== 1 ? 's' : ''}
                        </h2>
                        {results.map((doc) => (
                            <Card key={doc.id} className="bg-[#0f1419] border-blue-900/20 hover:border-blue-700/30 transition-colors">
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        {doc.file_url && doc.file_type?.includes('image') && (
                                            <img
                                                src={doc.file_url}
                                                alt={doc.title}
                                                className="w-20 h-20 object-cover rounded-lg"
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white mb-2">{doc.title}</h3>
                                            
                                            {doc.snippet && (
                                                <div className="bg-[#0a0e17] border border-blue-900/20 rounded-lg p-3 mb-2">
                                                    <p className="text-sm text-blue-300">
                                                        ...{doc.snippet}...
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center gap-2 text-xs text-blue-400 mb-2">
                                                <Calendar className="w-3 h-3" />
                                                {new Date(doc.created_date).toLocaleDateString()}
                                            </div>
                                            
                                            {doc.tags && doc.tags.length > 0 && (
                                                <div className="flex gap-2 flex-wrap">
                                                    {doc.tags.map((tag, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs">
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            )}
                                            
                                            <Link to={createPageUrl('ViewDocument') + `?id=${doc.id}`}>
                                                <Button size="sm" className="mt-3 bg-blue-600 hover:bg-blue-700">
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    View Document
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : searchTerm && !isSearching ? (
                    <Card className="bg-[#0f1419] border-blue-900/20">
                        <CardContent className="p-8 text-center">
                            <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                            <p className="text-blue-400">Try different search terms</p>
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </div>
    );
}