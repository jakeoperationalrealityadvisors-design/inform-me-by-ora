import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import NavigationTracker from '@/lib/NavigationTracker'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTasks from './pages/AdminTasks';
import AdminMessages from './pages/AdminMessages';
import AdminReports from './pages/AdminReports';
import AdminSettings from './pages/AdminSettings';
import UserHome from './pages/UserHome';
import UserTasks from './pages/UserTasks';
import UserScan from './pages/UserScan';
import UserMessages from './pages/UserMessages';
import UserProfile from './pages/UserProfile';
import RoleRedirect from './pages/RoleRedirect';
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
      <Route path="/AdminDashboard" element={<LayoutWrapper currentPageName="AdminDashboard"><AdminDashboard /></LayoutWrapper>} />
      <Route path="/AdminUsers" element={<LayoutWrapper currentPageName="AdminUsers"><AdminUsers /></LayoutWrapper>} />
      <Route path="/AdminTasks" element={<LayoutWrapper currentPageName="AdminTasks"><AdminTasks /></LayoutWrapper>} />
      <Route path="/AdminMessages" element={<LayoutWrapper currentPageName="AdminMessages"><AdminMessages /></LayoutWrapper>} />
      <Route path="/AdminReports" element={<LayoutWrapper currentPageName="AdminReports"><AdminReports /></LayoutWrapper>} />
      <Route path="/AdminSettings" element={<LayoutWrapper currentPageName="AdminSettings"><AdminSettings /></LayoutWrapper>} />
      <Route path="/UserHome" element={<LayoutWrapper currentPageName="UserHome"><UserHome /></LayoutWrapper>} />
      <Route path="/UserTasks" element={<LayoutWrapper currentPageName="UserTasks"><UserTasks /></LayoutWrapper>} />
      <Route path="/UserScan" element={<LayoutWrapper currentPageName="UserScan"><UserScan /></LayoutWrapper>} />
      <Route path="/UserMessages" element={<LayoutWrapper currentPageName="UserMessages"><UserMessages /></LayoutWrapper>} />
      <Route path="/UserProfile" element={<LayoutWrapper currentPageName="UserProfile"><UserProfile /></LayoutWrapper>} />
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