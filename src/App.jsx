import { Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { pagesConfig } from './pages.config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './lib/AuthContext';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

export default function App() {
  const { Pages, Layout: AppLayout, mainPage } = pagesConfig;

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppLayout>
          <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400"></div></div>}>
            <Routes>
              {Object.entries(Pages).map(([key, Component]) => (
                <Route
                  key={key}
                  path={key === mainPage ? '/' : `/${key}`}
                  element={<Component />}
                />
              ))}
              <Route path="*" element={<div>Page not found</div>} />
            </Routes>
          </Suspense>
        </AppLayout>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
