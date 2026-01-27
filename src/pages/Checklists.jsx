import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { CheckSquare, Plus, Filter } from 'lucide-react';
import { Button } from "@/components/ui/button";
import SearchBar from '@/components/common/SearchBar';
import ChecklistCard from '@/components/forms/ChecklistCard';
import EmptyState from '@/components/common/EmptyState';
import { useUserRole } from '@/components/auth/RoleGuard';
import BottomNav from '@/components/navigation/BottomNav';
import OrgSwitcher from '@/components/navigation/OrgSwitcher';
import { useLanguage } from '@/components/language/LanguageContext';
import { useSimpleMode } from '@/components/tutorial/SimpleModeWrapper';
import { useNavigate } from 'react-router-dom';

export default function Checklists() {
    const { isAdmin, canViewAll, canCreateChecklists, user } = useUserRole();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { isSeniorMode, isSimpleMode, isExpertMode, technicalLevel } = useSimpleMode();
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [viewMode, setViewMode] = useState(isSimpleMode ? 'grid' : 'list');
    
    const { data: checklists = [], isLoading } = useQuery({
        queryKey: ['checklists', search, selectedCategory],
        queryFn: async () => {
            let query = {};
            if (search) {
                query.name = { $regex: search, $options: 'i' };
            }
            if (selectedCategory) {
                query.category_id = selectedCategory;
            }
            return await httpClient.entities.ChecklistTemplate.list('-created_date', 100, query);
        }
    });
    
    const filteredChecklists = checklists.filter(checklist => 
        canViewAll || checklist.created_by === user?.email || checklist.assigned_to?.includes(user?.email)
    );
    
    return (
        <div className="min-h-screen bg-[#0a0e17]">
            {/* Header */}
            <div className="bg-[#0f1419] border-b border-blue-900/20 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Home')}>
                                <Button variant="ghost" size="icon">
                                    <CheckSquare className="w-5 h-5" />
                                </Button>
                            </Link>
                            <h1 className="text-xl font-semibold text-white">Checklists</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <OrgSwitcher />
                            <Button 
                                onClick={() => navigate(createPageUrl('EditChecklist'))}
                                className="bg-blue-600 hover:bg-blue-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                New Checklist
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Search and Filters */}
            <div className="bg-[#0f1419] border-b border-blue-900/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <SearchBar 
                                value={search}
                                onChange={setSearch}
                                placeholder="Search checklists..."
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                                <Filter className="w-4 h-4 mr-2" />
                                Filter
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                            >
                                {viewMode === 'grid' ? 'List' : 'Grid'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredChecklists.length === 0 ? (
                    <EmptyState
                        icon={CheckSquare}
                        title="No checklists found"
                        description={search ? "Try adjusting your search terms" : "Create your first checklist to get started"}
                        actionLabel="Create Checklist"
                        onAction={() => navigate(createPageUrl('EditChecklist'))}
                    />
                ) : (
                    <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                        {filteredChecklists.map(checklist => (
                            <ChecklistCard 
                                key={checklist.id}
                                checklist={checklist}
                                category={null}
                                viewMode={viewMode}
                            />
                        ))}
                    </div>
                )}
            </div>
            
            <BottomNav />
        </div>
    );
}