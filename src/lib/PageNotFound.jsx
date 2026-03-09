import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    const { data: authData, isFetched } = useQuery({
        queryKey: ['user'],
        queryFn: async () => {
            try {
                const user = await base44.auth.me();
                return { user, isAuthenticated: true };
            } catch {
                return { user: null, isAuthenticated: false };
            }
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[#0a0e17]">
            <div className="max-w-md w-full">
                <div className="text-center space-y-6">
                    <div className="space-y-2">
                        <h1 className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FF8C00] to-[#1E40AF]">404</h1>
                        <div className="h-0.5 w-16 bg-gradient-to-r from-[#FF8C00] to-[#1E40AF] mx-auto rounded-full"></div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-2xl font-semibold text-white">Page Not Found</h2>
                        <p className="text-slate-400 leading-relaxed">
                            The page <span className="font-medium text-[#FF8C00]">"{pageName}"</span> could not be found.
                        </p>
                    </div>

                    {isFetched && authData?.isAuthenticated && authData?.user?.role === 'admin' && (
                        <div className="p-4 bg-[#FF8C00]/10 rounded-xl border border-[#FF8C00]/30">
                            <div className="flex items-start gap-3 text-left">
                                <div className="w-2 h-2 rounded-full bg-[#FF8C00] mt-1.5 flex-shrink-0"></div>
                                <div>
                                    <p className="text-sm font-semibold text-[#FF8C00]">Admin Note</p>
                                    <p className="text-sm text-slate-400 leading-relaxed mt-0.5">
                                        This page may not be implemented yet. Ask the AI to build it in the chat.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="pt-4">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-black bg-gradient-to-r from-[#FF8C00] to-[#FFB347] rounded-xl hover:opacity-90 transition-opacity"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}