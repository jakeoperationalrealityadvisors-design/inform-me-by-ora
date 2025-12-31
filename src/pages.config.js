import ActivityLog from './pages/ActivityLog';
import Admin from './pages/Admin';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Calendar from './pages/Calendar';
import CreateForm from './pages/CreateForm';
import CreateTask from './pages/CreateTask';
import DailyTasks from './pages/DailyTasks';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import EditAutomation from './pages/EditAutomation';
import EditCategory from './pages/EditCategory';
import EditChecklist from './pages/EditChecklist';
import EditForm from './pages/EditForm';
import FillChecklist from './pages/FillChecklist';
import FillForm from './pages/FillForm';
import Home from './pages/Home';
import ManageAutomations from './pages/ManageAutomations';
import ManageDailyTasks from './pages/ManageDailyTasks';
import ManageFolders from './pages/ManageFolders';
import MyTasks from './pages/MyTasks';
import Reports from './pages/Reports';
import RoleManagement from './pages/RoleManagement';
import Settings from './pages/Settings';
import Submissions from './pages/Submissions';
import TikTokDashboard from './pages/TikTokDashboard';
import UploadDocument from './pages/UploadDocument';
import UserManagement from './pages/UserManagement';
import ViewChecklistSubmission from './pages/ViewChecklistSubmission';
import ViewDocument from './pages/ViewDocument';
import ViewFormSubmission from './pages/ViewFormSubmission';
import NetworkOnboarding from './pages/NetworkOnboarding';
import OrganizationSettings from './pages/OrganizationSettings';
import CustomerPortal from './pages/CustomerPortal';
import __Layout from './Layout.jsx';


export const PAGES = {
    "ActivityLog": ActivityLog,
    "Admin": Admin,
    "AnalyticsDashboard": AnalyticsDashboard,
    "Calendar": Calendar,
    "CreateForm": CreateForm,
    "CreateTask": CreateTask,
    "DailyTasks": DailyTasks,
    "Dashboard": Dashboard,
    "Documents": Documents,
    "EditAutomation": EditAutomation,
    "EditCategory": EditCategory,
    "EditChecklist": EditChecklist,
    "EditForm": EditForm,
    "FillChecklist": FillChecklist,
    "FillForm": FillForm,
    "Home": Home,
    "ManageAutomations": ManageAutomations,
    "ManageDailyTasks": ManageDailyTasks,
    "ManageFolders": ManageFolders,
    "MyTasks": MyTasks,
    "Reports": Reports,
    "RoleManagement": RoleManagement,
    "Settings": Settings,
    "Submissions": Submissions,
    "TikTokDashboard": TikTokDashboard,
    "UploadDocument": UploadDocument,
    "UserManagement": UserManagement,
    "ViewChecklistSubmission": ViewChecklistSubmission,
    "ViewDocument": ViewDocument,
    "ViewFormSubmission": ViewFormSubmission,
    "NetworkOnboarding": NetworkOnboarding,
    "OrganizationSettings": OrganizationSettings,
    "CustomerPortal": CustomerPortal,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};