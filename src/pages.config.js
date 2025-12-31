import Admin from './pages/Admin';
import DailyTasks from './pages/DailyTasks';
import Documents from './pages/Documents';
import EditCategory from './pages/EditCategory';
import EditChecklist from './pages/EditChecklist';
import EditForm from './pages/EditForm';
import FillChecklist from './pages/FillChecklist';
import FillForm from './pages/FillForm';
import Home from './pages/Home';
import ManageDailyTasks from './pages/ManageDailyTasks';
import ManageFolders from './pages/ManageFolders';
import MyTasks from './pages/MyTasks';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Submissions from './pages/Submissions';
import UploadDocument from './pages/UploadDocument';
import UserManagement from './pages/UserManagement';
import ViewChecklistSubmission from './pages/ViewChecklistSubmission';
import ViewDocument from './pages/ViewDocument';
import ViewFormSubmission from './pages/ViewFormSubmission';
import Calendar from './pages/Calendar';
import TikTokDashboard from './pages/TikTokDashboard';
import ManageAutomations from './pages/ManageAutomations';
import EditAutomation from './pages/EditAutomation';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "DailyTasks": DailyTasks,
    "Documents": Documents,
    "EditCategory": EditCategory,
    "EditChecklist": EditChecklist,
    "EditForm": EditForm,
    "FillChecklist": FillChecklist,
    "FillForm": FillForm,
    "Home": Home,
    "ManageDailyTasks": ManageDailyTasks,
    "ManageFolders": ManageFolders,
    "MyTasks": MyTasks,
    "Reports": Reports,
    "Settings": Settings,
    "Submissions": Submissions,
    "UploadDocument": UploadDocument,
    "UserManagement": UserManagement,
    "ViewChecklistSubmission": ViewChecklistSubmission,
    "ViewDocument": ViewDocument,
    "ViewFormSubmission": ViewFormSubmission,
    "Calendar": Calendar,
    "TikTokDashboard": TikTokDashboard,
    "ManageAutomations": ManageAutomations,
    "EditAutomation": EditAutomation,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};