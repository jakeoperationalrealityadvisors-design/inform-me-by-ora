import Admin from './pages/Admin';
import EditCategory from './pages/EditCategory';
import EditChecklist from './pages/EditChecklist';
import EditForm from './pages/EditForm';
import FillChecklist from './pages/FillChecklist';
import FillForm from './pages/FillForm';
import Home from './pages/Home';
import MyTasks from './pages/MyTasks';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Submissions from './pages/Submissions';
import UserManagement from './pages/UserManagement';
import ViewChecklistSubmission from './pages/ViewChecklistSubmission';
import ViewFormSubmission from './pages/ViewFormSubmission';
import DailyTasks from './pages/DailyTasks';
import ManageDailyTasks from './pages/ManageDailyTasks';
import Documents from './pages/Documents';
import UploadDocument from './pages/UploadDocument';
import ViewDocument from './pages/ViewDocument';
import ManageFolders from './pages/ManageFolders';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Admin": Admin,
    "EditCategory": EditCategory,
    "EditChecklist": EditChecklist,
    "EditForm": EditForm,
    "FillChecklist": FillChecklist,
    "FillForm": FillForm,
    "Home": Home,
    "MyTasks": MyTasks,
    "Reports": Reports,
    "Settings": Settings,
    "Submissions": Submissions,
    "UserManagement": UserManagement,
    "ViewChecklistSubmission": ViewChecklistSubmission,
    "ViewFormSubmission": ViewFormSubmission,
    "DailyTasks": DailyTasks,
    "ManageDailyTasks": ManageDailyTasks,
    "Documents": Documents,
    "UploadDocument": UploadDocument,
    "ViewDocument": ViewDocument,
    "ManageFolders": ManageFolders,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};