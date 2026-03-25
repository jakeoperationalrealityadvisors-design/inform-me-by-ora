import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import PushForm from './pages/PushForm';
import AdminBilling from './pages/AdminBilling';
import AdminOverview from './pages/AdminOverview';
import UserDashboard from './pages/UserDashboard';
import PushCenter from './pages/PushCenter';
import HopCodes from './pages/HopCodes';
import HopCodeJoin from './pages/HopCodeJoin';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="/PushForm" element={<LayoutWrapper currentPageName="PushForm"><PushForm /></LayoutWrapper>} />
      <Route path="/AdminBilling" element={<LayoutWrapper currentPageName="AdminBilling"><AdminBilling /></LayoutWrapper>} />
      <Route path="/AdminOverview" element={<LayoutWrapper currentPageName="AdminOverview"><AdminOverview /></LayoutWrapper>} />
      <Route path="/UserDashboard" element={<LayoutWrapper currentPageName="UserDashboard"><UserDashboard /></LayoutWrapper>} />
      <Route path="/PushCenter" element={<LayoutWrapper currentPageName="PushCenter"><PushCenter /></LayoutWrapper>} />
      <Route path="/HopCodes" element={<LayoutWrapper currentPageName="HopCodes"><HopCodes /></LayoutWrapper>} />
      <Route path="/HopCodeJoin" element={<HopCodeJoin />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <NavigationTracker />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App