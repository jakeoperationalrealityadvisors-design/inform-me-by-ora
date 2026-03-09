/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AIAssistantPage from './pages/AIAssistantPage';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import AutomationOptimizer from './pages/AutomationOptimizer';
import BillingTest from './pages/BillingTest';
import Calendar from './pages/Calendar';
import CreateDocumentWorkflow from './pages/CreateDocumentWorkflow';
import CreateForm from './pages/CreateForm';
import CreateTask from './pages/CreateTask';
import CustomerPortal from './pages/CustomerPortal';
import DailyTasks from './pages/DailyTasks';
import Dashboard from './pages/Dashboard';
import DocumentEditor from './pages/DocumentEditor';
import DocumentSearch from './pages/DocumentSearch';
import Documentation from './pages/Documentation';
import EditCategory from './pages/EditCategory';
import EditChecklist from './pages/EditChecklist';
import ExportData from './pages/ExportData';
import FillChecklist from './pages/FillChecklist';
import FillForm from './pages/FillForm';
import Home from './pages/Home';
import HopCode from './pages/HopCode';
import LoadTesting from './pages/LoadTesting';
import Messages from './pages/Messages';
import Settings from './pages/Settings';
import Integrations from './pages/Integrations';
import MyTasks from './pages/MyTasks';
import Pricing from './pages/Pricing';
import Scanner from './pages/Scanner';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProductionChecklist from './pages/ProductionChecklist';
import Submissions from './pages/Submissions';
import SystemHealth from './pages/SystemHealth';
import VerifyEmail from './pages/VerifyEmail';
import TermsOfService from './pages/TermsOfService';
import DocumentWorkflows from './pages/DocumentWorkflows';
import Documents from './pages/Documents';
import EditAutomation from './pages/EditAutomation';
import EditForm from './pages/EditForm';
import KnowledgeBase from './pages/KnowledgeBase';
import ManageAutomations from './pages/ManageAutomations';
import ManageDailyTasks from './pages/ManageDailyTasks';
import ManageFolders from './pages/ManageFolders';
import NetworkOnboarding from './pages/NetworkOnboarding';
import PublicChecklist from './pages/PublicChecklist';
import PublicForm from './pages/PublicForm';
import Reports from './pages/Reports';
import RoleManagement from './pages/RoleManagement';
import Support from './pages/Support';
import TikTokDashboard from './pages/TikTokDashboard';
import UserManagement from './pages/UserManagement';
import ViewChecklistSubmission from './pages/ViewChecklistSubmission';
import ViewDocument from './pages/ViewDocument';
import ViewFormSubmission from './pages/ViewFormSubmission';
import AIAssistantTest from './pages/AIAssistantTest';
import AIWorkflowBuilder from './pages/AIWorkflowBuilder';
import OrganizationSettings from './pages/OrganizationSettings';
import PublicSubmission from './pages/PublicSubmission';
import SendFax from './pages/SendFax';
import UploadDocument from './pages/UploadDocument';
import ActivityLog from './pages/ActivityLog';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAssistantPage": AIAssistantPage,
    "Admin": Admin,
    "AdminDashboard": AdminDashboard,
    "AnalyticsDashboard": AnalyticsDashboard,
    "AutomationOptimizer": AutomationOptimizer,
    "BillingTest": BillingTest,
    "Calendar": Calendar,
    "CreateDocumentWorkflow": CreateDocumentWorkflow,
    "CreateForm": CreateForm,
    "CreateTask": CreateTask,
    "CustomerPortal": CustomerPortal,
    "DailyTasks": DailyTasks,
    "Dashboard": Dashboard,
    "DocumentEditor": DocumentEditor,
    "DocumentSearch": DocumentSearch,
    "Documentation": Documentation,
    "EditCategory": EditCategory,
    "EditChecklist": EditChecklist,
    "ExportData": ExportData,
    "FillChecklist": FillChecklist,
    "FillForm": FillForm,
    "Home": Home,
    "HopCode": HopCode,
    "LoadTesting": LoadTesting,
    "Messages": Messages,
    "Settings": Settings,
    "Integrations": Integrations,
    "MyTasks": MyTasks,
    "Pricing": Pricing,
    "Scanner": Scanner,
    "PrivacyPolicy": PrivacyPolicy,
    "ProductionChecklist": ProductionChecklist,
    "Submissions": Submissions,
    "SystemHealth": SystemHealth,
    "VerifyEmail": VerifyEmail,
    "TermsOfService": TermsOfService,
    "DocumentWorkflows": DocumentWorkflows,
    "Documents": Documents,
    "EditAutomation": EditAutomation,
    "EditForm": EditForm,
    "KnowledgeBase": KnowledgeBase,
    "ManageAutomations": ManageAutomations,
    "ManageDailyTasks": ManageDailyTasks,
    "ManageFolders": ManageFolders,
    "NetworkOnboarding": NetworkOnboarding,
    "PublicChecklist": PublicChecklist,
    "PublicForm": PublicForm,
    "Reports": Reports,
    "RoleManagement": RoleManagement,
    "Support": Support,
    "TikTokDashboard": TikTokDashboard,
    "UserManagement": UserManagement,
    "ViewChecklistSubmission": ViewChecklistSubmission,
    "ViewDocument": ViewDocument,
    "ViewFormSubmission": ViewFormSubmission,
    "AIAssistantTest": AIAssistantTest,
    "AIWorkflowBuilder": AIWorkflowBuilder,
    "OrganizationSettings": OrganizationSettings,
    "PublicSubmission": PublicSubmission,
    "SendFax": SendFax,
    "UploadDocument": UploadDocument,
    "ActivityLog": ActivityLog,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};