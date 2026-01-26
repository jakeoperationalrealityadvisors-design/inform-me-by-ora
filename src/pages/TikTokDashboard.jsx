import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { httpClient } from '@/api/httpClient';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Users, Heart, Video, UserPlus, RefreshCw, TrendingUp } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function TikTokDashboard() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ['tiktok-stats'],
        queryFn: async () => {
            const response = await httpClient.functions.invoke('getTikTokStats', {});
            return response.data;
        },
        staleTime: 300000, // 5 minutes
        retry: 1
    });

    const formatNumber = (num) => {
        if (!num) return '0';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Header */}
            <div className="bg-black/30 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to={createPageUrl('Home')}>
                                <Button variant="ghost" size="icon" className="rounded-full text-white hover:bg-white/10">
                                    <ArrowLeft className="w-5 h-5" />
                                </Button>
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                    <span className="text-2xl">🎵</span> TikTok Dashboard
                                </h1>
                                <p className="text-sm text-purple-300">Your profile analytics</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => refetch()}
                            disabled={isLoading}
                            variant="outline"
                            size="sm"
                            className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[1, 2, 3, 4].map(i => (
                            <Card key={i} className="bg-white/10 border-white/20 backdrop-blur-sm animate-pulse">
                                <CardHeader className="pb-3">
                                    <div className="h-4 w-20 bg-white/20 rounded" />
                                </CardHeader>
                                <CardContent>
                                    <div className="h-8 w-24 bg-white/20 rounded" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : error ? (
                    <Card className="bg-red-950/30 border-red-500/50 backdrop-blur-sm">
                        <CardHeader>
                            <CardTitle className="text-red-400">Error Loading TikTok Data</CardTitle>
                            <CardDescription className="text-red-300">
                                {data?.error || error.message || 'Failed to fetch TikTok stats'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                onClick={() => refetch()}
                                variant="outline"
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                                Try Again
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        {/* Profile Card */}
                        <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-6">
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar className="w-20 h-20 border-4 border-purple-500">
                                        <AvatarImage src={data?.profile?.avatar_url} />
                                        <AvatarFallback className="bg-purple-600 text-white text-2xl">
                                            {data?.profile?.display_name?.[0] || 'T'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-white text-2xl mb-1">
                                            {data?.profile?.display_name || 'TikTok User'}
                                        </CardTitle>
                                        <Badge className="bg-purple-600 text-white">
                                            <TrendingUp className="w-3 h-3 mr-1" />
                                            Creator Account
                                        </Badge>
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>

                        {/* Stats Grid */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {/* Followers */}
                            <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
                                <CardHeader className="pb-3">
                                    <CardDescription className="text-pink-200 flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Followers
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-white">
                                        {formatNumber(data?.stats?.follower_count)}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Following */}
                            <Card className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
                                <CardHeader className="pb-3">
                                    <CardDescription className="text-blue-200 flex items-center gap-2">
                                        <UserPlus className="w-4 h-4" />
                                        Following
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-white">
                                        {formatNumber(data?.stats?.following_count)}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Total Likes */}
                            <Card className="bg-gradient-to-br from-red-500/20 to-pink-500/20 border-red-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
                                <CardHeader className="pb-3">
                                    <CardDescription className="text-red-200 flex items-center gap-2">
                                        <Heart className="w-4 h-4" />
                                        Total Likes
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-white">
                                        {formatNumber(data?.stats?.likes_count)}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Video Count */}
                            <Card className="bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border-purple-500/30 backdrop-blur-sm hover:scale-105 transition-transform">
                                <CardHeader className="pb-3">
                                    <CardDescription className="text-purple-200 flex items-center gap-2">
                                        <Video className="w-4 h-4" />
                                        Videos
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-4xl font-bold text-white">
                                        {formatNumber(data?.stats?.video_count)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Additional Info */}
                        <Card className="bg-white/5 border-white/10 backdrop-blur-sm mt-6">
                            <CardHeader>
                                <CardTitle className="text-white text-sm">Quick Stats</CardTitle>
                            </CardHeader>
                            <CardContent className="text-sm text-purple-200">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-white/60">Engagement Rate</p>
                                        <p className="text-lg font-semibold">
                                            {data?.stats?.follower_count > 0
                                                ? ((data?.stats?.likes_count / (data?.stats?.video_count || 1) / data?.stats?.follower_count) * 100).toFixed(2)
                                                : '0'}%
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-white/60">Avg Likes per Video</p>
                                        <p className="text-lg font-semibold">
                                            {formatNumber(Math.round(data?.stats?.likes_count / (data?.stats?.video_count || 1)))}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
}