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
import AIAssistantTest from './pages/AIAssistantTest';
import AIWorkflowBuilder from './pages/AIWorkflowBuilder';
import ActivityLog from './pages/ActivityLog';
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
import DocumentWorkflows from './pages/DocumentWorkflows';
import Documentation from './pages/Documentation';
import Documents from './pages/Documents';
import EditAutomation from './pages/EditAutomation';
import EditCategory from './pages/EditCategory';
import EditChecklist from './pages/EditChecklist';
import EditForm from './pages/EditForm';
import ExportData from './pages/ExportData';
import FillChecklist from './pages/FillChecklist';
import FillForm from './pages/FillForm';
import Home from './pages/Home';
import HopCode from './pages/HopCode';
import Integrations from './pages/Integrations';
import KnowledgeBase from './pages/KnowledgeBase';
import LoadTesting from './pages/LoadTesting';
import ManageAutomations from './pages/ManageAutomations';
import ManageDailyTasks from './pages/ManageDailyTasks';
import ManageFolders from './pages/ManageFolders';
import Messages from './pages/Messages';
import MobileReadiness from './pages/MobileReadiness';
import MyTasks from './pages/MyTasks';
import NetworkOnboarding from './pages/NetworkOnboarding';
import OrganizationSettings from './pages/OrganizationSettings';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProductionChecklist from './pages/ProductionChecklist';
import PublicChecklist from './pages/PublicChecklist';
import PublicForm from './pages/PublicForm';
import PublicSubmission from './pages/PublicSubmission';
import Reports from './pages/Reports';
import RoleManagement from './pages/RoleManagement';
import Scanner from './pages/Scanner';
import SendFax from './pages/SendFax';
import Settings from './pages/Settings';
import Submissions from './pages/Submissions';
import Support from './pages/Support';
import SystemHealth from './pages/SystemHealth';
import TermsOfService from './pages/TermsOfService';
import TikTokDashboard from './pages/TikTokDashboard';
import UploadDocument from './pages/UploadDocument';
import UserManagement from './pages/UserManagement';
import VerifyEmail from './pages/VerifyEmail';
import ViewChecklistSubmission from './pages/ViewChecklistSubmission';
import ViewDocument from './pages/ViewDocument';
import ViewFormSubmission from './pages/ViewFormSubmission';
import OversightDashboard from './pages/OversightDashboard';
import SetupWizard from './pages/SetupWizard';
import HelpFAQ from './pages/HelpFAQ';
import AppAudit from './pages/AppAudit';
import ConnectivityTool from './pages/ConnectivityTool';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AIAssistantPage": AIAssistantPage,
    "AIAssistantTest": AIAssistantTest,
    "AIWorkflowBuilder": AIWorkflowBuilder,
    "ActivityLog": ActivityLog,
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
    "DocumentWorkflows": DocumentWorkflows,
    "Documentation": Documentation,
    "Documents": Documents,
    "EditAutomation": EditAutomation,
    "EditCategory": EditCategory,
    "EditChecklist": EditChecklist,
    "EditForm": EditForm,
    "ExportData": ExportData,
    "FillChecklist": FillChecklist,
    "FillForm": FillForm,
    "Home": Home,
    "HopCode": HopCode,
    "Integrations": Integrations,
    "KnowledgeBase": KnowledgeBase,
    "LoadTesting": LoadTesting,
    "ManageAutomations": ManageAutomations,
    "ManageDailyTasks": ManageDailyTasks,
    "ManageFolders": ManageFolders,
    "Messages": Messages,
    "MobileReadiness": MobileReadiness,
    "MyTasks": MyTasks,
    "NetworkOnboarding": NetworkOnboarding,
    "OrganizationSettings": OrganizationSettings,
    "Pricing": Pricing,
    "PrivacyPolicy": PrivacyPolicy,
    "ProductionChecklist": ProductionChecklist,
    "PublicChecklist": PublicChecklist,
    "PublicForm": PublicForm,
    "PublicSubmission": PublicSubmission,
    "Reports": Reports,
    "RoleManagement": RoleManagement,
    "Scanner": Scanner,
    "SendFax": SendFax,
    "Settings": Settings,
    "Submissions": Submissions,
    "Support": Support,
    "SystemHealth": SystemHealth,
    "TermsOfService": TermsOfService,
    "TikTokDashboard": TikTokDashboard,
    "UploadDocument": UploadDocument,
    "UserManagement": UserManagement,
    "VerifyEmail": VerifyEmail,
    "ViewChecklistSubmission": ViewChecklistSubmission,
    "ViewDocument": ViewDocument,
    "ViewFormSubmission": ViewFormSubmission,
    "OversightDashboard": OversightDashboard,
    "SetupWizard": SetupWizard,
    "HelpFAQ": HelpFAQ,
    "AppAudit": AppAudit,
    "ConnectivityTool": ConnectivityTool,
}

export const pagesConfig = {
    mainPage: "AIAssistantPage",
    Pages: PAGES,
    Layout: __Layout,
};