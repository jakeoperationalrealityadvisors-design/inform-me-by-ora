import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowLeft, Play, Square, TrendingUp, Users, Zap, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import RoleGuard from '@/components/auth/RoleGuard';
import { toast } from 'sonner';

const testScenarios = [
    {
        name: 'Light Load',
        users: 10,
        duration: 60,
        description: '10 concurrent users for 1 minute',
        icon: Users,
        color: 'text-green-400'
    },
    {
        name: 'Moderate Load',
        users: 50,
        duration: 180,
        description: '50 concurrent users for 3 minutes',
        icon: Users,
        color: 'text-yellow-400'
    },
    {
        name: 'Heavy Load',
        users: 100,
        duration: 300,
        description: '100 concurrent users for 5 minutes',
        icon: Users,
        color: 'text-orange-400'
    },
    {
        name: 'Stress Test',
        users: 200,
        duration: 600,
        description: '200 concurrent users for 10 minutes',
        icon: AlertTriangle,
        color: 'text-red-400'
    }
];

function LoadTestingContent() {
    const [activeTest, setActiveTest] = useState(null);
    const [testResults, setTestResults] = useState(null);
    const [progress, setProgress] = useState(0);

    const runLoadTest = useMutation({
        mutationFn: async (scenario) => {
            setActiveTest(scenario);
            setProgress(0);
            setTestResults(null);

            // Simulate load test
            const startTime = Date.now();
            const interval = setInterval(() => {
                const elapsed = Date.now() - startTime;
                const percent = Math.min((elapsed / (scenario.duration * 1000)) * 100, 100);
                setProgress(percent);

                if (percent >= 100) {
                    clearInterval(interval);
                }
            }, 100);

            // Simulate test execution
            await new Promise(resolve => setTimeout(resolve, scenario.duration * 1000));

            // Generate mock results
            const avgResponseTime = 100 + Math.random() * 400;
            const successRate = 95 + Math.random() * 5;
            const errorRate = 100 - successRate;
            const throughput = scenario.users * (60 / (avgResponseTime / 1000));

            return {
                scenario: scenario.name,
                users: scenario.users,
                duration: scenario.duration,
                avgResponseTime: Math.round(avgResponseTime),
                minResponseTime: Math.round(avgResponseTime * 0.3),
                maxResponseTime: Math.round(avgResponseTime * 2.5),
                p95ResponseTime: Math.round(avgResponseTime * 1.8),
                successRate: successRate.toFixed(2),
                errorRate: errorRate.toFixed(2),
                throughput: Math.round(throughput),
                totalRequests: Math.round(throughput * (scenario.duration / 60)),
                timestamp: new Date().toISOString()
            };
        },
        onSuccess: (results) => {
            setTestResults(results);
            setActiveTest(null);
            setProgress(0);
            toast.success('Load test completed successfully');
        },
        onError: (error) => {
            setActiveTest(null);
            setProgress(0);
            toast.error('Load test failed: ' + error.message);
        }
    });

    const stopTest = () => {
        setActiveTest(null);
        setProgress(0);
        toast.info('Test stopped');
    };

    return (
        <div className="min-h-screen bg-[#0a0e17] py-8 px-4">
            <div className="max-w-5xl mx-auto">
                <Link to={createPageUrl('Settings')}>
                    <Button variant="ghost" className="mb-6 text-blue-400">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Settings
                    </Button>
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Load Testing</h1>
                    <p className="text-blue-400">Simulate concurrent users and measure performance</p>
                </div>

                {/* Active Test Progress */}
                {activeTest && (
                    <Card className="bg-[#0f1419] border-blue-900/30 mb-8">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-white">Running: {activeTest.name}</CardTitle>
                                <Button
                                    onClick={stopTest}
                                    variant="destructive"
                                    size="sm"
                                >
                                    <Square className="w-4 h-4 mr-2" />
                                    Stop Test
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-blue-300">Progress</span>
                                    <span className="text-white font-bold">{Math.round(progress)}%</span>
                                </div>
                                <Progress value={progress} className="h-3" />
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-white">{activeTest.users}</div>
                                    <div className="text-sm text-blue-400">Concurrent Users</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-white">{activeTest.duration}s</div>
                                    <div className="text-sm text-blue-400">Duration</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-[#FF8C00]">
                                        {Math.round((activeTest.duration * progress) / 100)}s
                                    </div>
                                    <div className="text-sm text-blue-400">Elapsed</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Test Scenarios */}
                <Card className="bg-[#0f1419] border-blue-900/30 mb-8">
                    <CardHeader>
                        <CardTitle className="text-white">Test Scenarios</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {testScenarios.map((scenario) => {
                            const Icon = scenario.icon;
                            return (
                                <div
                                    key={scenario.name}
                                    className="bg-[#0a0e17] rounded-lg p-6 border border-blue-900/30"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon className={`w-5 h-5 ${scenario.color}`} />
                                                <h3 className="font-bold text-white">{scenario.name}</h3>
                                            </div>
                                            <p className="text-sm text-blue-400">{scenario.description}</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => runLoadTest.mutate(scenario)}
                                        disabled={!!activeTest || runLoadTest.isPending}
                                        className="w-full bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]"
                                    >
                                        <Play className="w-4 h-4 mr-2" />
                                        Run Test
                                    </Button>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>

                {/* Test Results */}
                {testResults && (
                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-white">Test Results: {testResults.scenario}</CardTitle>
                            <p className="text-sm text-blue-400">
                                Completed at {new Date(testResults.timestamp).toLocaleTimeString()}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Performance Metrics */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-[#0a0e17] rounded-lg p-4 border border-blue-900/30">
                                    <Clock className="w-5 h-5 text-blue-400 mb-2" />
                                    <div className="text-2xl font-bold text-white">{testResults.avgResponseTime}ms</div>
                                    <div className="text-sm text-blue-400">Avg Response</div>
                                </div>
                                <div className="bg-[#0a0e17] rounded-lg p-4 border border-blue-900/30">
                                    <TrendingUp className="w-5 h-5 text-green-400 mb-2" />
                                    <div className="text-2xl font-bold text-white">{testResults.successRate}%</div>
                                    <div className="text-sm text-blue-400">Success Rate</div>
                                </div>
                                <div className="bg-[#0a0e17] rounded-lg p-4 border border-blue-900/30">
                                    <Zap className="w-5 h-5 text-[#FF8C00] mb-2" />
                                    <div className="text-2xl font-bold text-white">{testResults.throughput}</div>
                                    <div className="text-sm text-blue-400">Req/min</div>
                                </div>
                                <div className="bg-[#0a0e17] rounded-lg p-4 border border-blue-900/30">
                                    <Users className="w-5 h-5 text-purple-400 mb-2" />
                                    <div className="text-2xl font-bold text-white">{testResults.totalRequests}</div>
                                    <div className="text-sm text-blue-400">Total Requests</div>
                                </div>
                            </div>

                            {/* Response Times */}
                            <div>
                                <h4 className="text-white font-semibold mb-3">Response Time Breakdown</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-300">Minimum</span>
                                        <Badge variant="outline">{testResults.minResponseTime}ms</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-300">Average</span>
                                        <Badge variant="outline">{testResults.avgResponseTime}ms</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-300">95th Percentile</span>
                                        <Badge variant="outline">{testResults.p95ResponseTime}ms</Badge>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-blue-300">Maximum</span>
                                        <Badge variant="outline">{testResults.maxResponseTime}ms</Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Error Rate */}
                            <div>
                                <h4 className="text-white font-semibold mb-3">Error Analysis</h4>
                                <div className="bg-[#0a0e17] rounded-lg p-4 border border-blue-900/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-blue-300">Error Rate</span>
                                        <span className={`font-bold ${parseFloat(testResults.errorRate) > 5 ? 'text-red-400' : 'text-green-400'}`}>
                                            {testResults.errorRate}%
                                        </span>
                                    </div>
                                    <Progress 
                                        value={parseFloat(testResults.errorRate)} 
                                        className="h-2"
                                    />
                                    <p className="text-xs text-blue-500 mt-2">
                                        {parseFloat(testResults.errorRate) > 5 
                                            ? 'Error rate is above acceptable threshold (5%)'
                                            : 'Error rate is within acceptable range'}
                                    </p>
                                </div>
                            </div>

                            {/* Recommendations */}
                            <div className="bg-blue-950/30 rounded-lg p-4 border border-blue-900/30">
                                <h4 className="text-white font-semibold mb-2">Recommendations</h4>
                                <div className="space-y-1 text-sm text-blue-300">
                                    {testResults.avgResponseTime > 500 && (
                                        <p>⚠️ Average response time exceeds 500ms - consider optimization</p>
                                    )}
                                    {parseFloat(testResults.errorRate) > 5 && (
                                        <p>⚠️ Error rate is high - investigate error logs</p>
                                    )}
                                    {testResults.p95ResponseTime > 1000 && (
                                        <p>⚠️ 95th percentile exceeds 1s - check for bottlenecks</p>
                                    )}
                                    {testResults.avgResponseTime < 500 && parseFloat(testResults.errorRate) < 5 && (
                                        <p>✅ Performance is within acceptable range</p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Info Card */}
                {!activeTest && !testResults && (
                    <Card className="bg-[#0f1419] border-blue-900/30">
                        <CardHeader>
                            <CardTitle className="text-white">About Load Testing</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-blue-300">
                            <p>
                                Load testing simulates multiple concurrent users to measure system performance under stress.
                            </p>
                            <p>
                                <strong className="text-white">Key Metrics:</strong>
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-2">
                                <li>Response Time - How fast the system responds</li>
                                <li>Throughput - Requests handled per minute</li>
                                <li>Success Rate - Percentage of successful requests</li>
                                <li>Error Rate - Percentage of failed requests</li>
                            </ul>
                            <p className="text-sm text-blue-400">
                                Note: This is a simulated test environment. For production load testing, use dedicated tools like Apache JMeter, Gatling, or k6.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function LoadTesting() {
    return (
        <RoleGuard allowedRoles={['admin']}>
            <LoadTestingContent />
        </RoleGuard>
    );
}