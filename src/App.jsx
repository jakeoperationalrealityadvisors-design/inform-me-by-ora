import { Routes, Route } from 'react-router-dom';
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
          <Routes>
            {Object.entries(Pages).map(([key, Component]) => (
              <Route
                key={key}
                path={key === mainPage ? '/' : `/${key}`}
                element={<Component />}
              />
            ))}
            <Route
              path="*"
              element={
                <div className="min-h-[60vh] flex items-center justify-center text-blue-300">
                  Page not found
                </div>
              }
            />
          </Routes>
        </AppLayout>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
