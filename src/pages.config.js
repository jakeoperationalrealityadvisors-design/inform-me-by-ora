import AppShell from "@/app/AppShell"

// IMPORT YOUR PAGES
import Dashboard from "@/pages/Dashboard"
import MyTasks from "@/pages/MyTasks"
import CreateTask from "@/pages/CreateTask"
import Submissions from "@/pages/Submissions"
import Settings from "@/pages/Settings"
import Home from "@/pages/Home"
import Admin from "@/pages/Admin"
import AnalyticsDashboard from "@/pages/AnalyticsDashboard"
import Documents from "@/pages/Documents"
import Forms from "@/pages/Forms"
import Checklists from "@/pages/Checklists"
import Tasks from "@/pages/Tasks"
import Calendar from "@/pages/Calendar"
import Messages from "@/pages/Messages"
import Reports from "@/pages/Reports"
import UserManagement from "@/pages/UserManagement"
import RoleManagement from "@/pages/RoleManagement"
import OrganizationSettings from "@/pages/OrganizationSettings"
import Integrations from "@/pages/Integrations"
import Support from "@/pages/Support"
import KnowledgeBase from "@/pages/KnowledgeBase"
import ActivityLog from "@/pages/ActivityLog"
import AIAssistantPage from "@/pages/AIAssistantPage"
import AutomationOptimizer from "@/pages/AutomationOptimizer"
import ManageAutomations from "@/pages/ManageAutomations"
import EditAutomation from "@/pages/EditAutomation"
import CreateDocumentWorkflow from "@/pages/CreateDocumentWorkflow"
import DocumentWorkflows from "@/pages/DocumentWorkflows"
import DocumentEditor from "@/pages/DocumentEditor"
import DocumentSearch from "@/pages/DocumentSearch"
import UploadDocument from "@/pages/UploadDocument"
import ViewDocument from "@/pages/ViewDocument"
import CreateForm from "@/pages/CreateForm"
import EditForm from "@/pages/EditForm"
import FillForm from "@/pages/FillForm"
import PublicForm from "@/pages/PublicForm"
import ViewFormSubmission from "@/pages/ViewFormSubmission"
import CreateChecklist from "@/pages/CreateChecklist"
import EditChecklist from "@/pages/EditChecklist"
import FillChecklist from "@/pages/FillChecklist"
import PublicChecklist from "@/pages/PublicChecklist"
import ViewChecklistSubmission from "@/pages/ViewChecklistSubmission"
import EditCategory from "@/pages/EditCategory"
import ManageFolders from "@/pages/ManageFolders"
import Scanner from "@/pages/Scanner"
import SendFax from "@/pages/SendFax"
import TikTokDashboard from "@/pages/TikTokDashboard"
import CustomerPortal from "@/pages/CustomerPortal"
import BillingTest from "@/pages/BillingTest"
import Pricing from "@/pages/Pricing"
import TermsOfService from "@/pages/TermsOfService"
import PrivacyPolicy from "@/pages/PrivacyPolicy"
import VerifyEmail from "@/pages/VerifyEmail"
import NetworkOnboarding from "@/pages/NetworkOnboarding"
import HopCode from "@/pages/HopCode"
import ProductionChecklist from "@/pages/ProductionChecklist"
import LoadTesting from "@/pages/LoadTesting"
import SystemHealth from "@/pages/SystemHealth"
import ExportData from "@/pages/ExportData"
import AIAssistantTest from "@/pages/AIAssistantTest"
import AIWorkflowBuilder from "@/pages/AIWorkflowBuilder"
import AdminDashboard from "@/pages/AdminDashboard"
import DailyTasks from "@/pages/DailyTasks"
import ManageDailyTasks from "@/pages/ManageDailyTasks"
import Documentation from "@/pages/Documentation"

// 🔒 ORA INFORM ME – GLOBAL PAGE CONFIG
export const pagesConfig = {
  Layout: AppShell,

  // 👇 Landing page
  mainPage: "dashboard",

  Pages: {
    dashboard: Dashboard,
    MyTasks,
    CreateTask,
    Submissions,
    Settings,
    Home,
    Admin,
    AnalyticsDashboard,
    Documents,
    Forms,
    Checklists,
    Tasks,
    Calendar,
    Messages,
    Reports,
    UserManagement,
    RoleManagement,
    OrganizationSettings,
    Integrations,
    Support,
    KnowledgeBase,
    ActivityLog,
    AIAssistantPage,
    AutomationOptimizer,
    ManageAutomations,
    EditAutomation,
    CreateDocumentWorkflow,
    DocumentWorkflows,
    DocumentEditor,
    DocumentSearch,
    UploadDocument,
    ViewDocument,
    CreateForm,
    EditForm,
    FillForm,
    PublicForm,
    ViewFormSubmission,
    CreateChecklist,
    EditChecklist,
    FillChecklist,
    PublicChecklist,
    ViewChecklistSubmission,
    EditCategory,
    ManageFolders,
    Scanner,
    SendFax,
    TikTokDashboard,
    CustomerPortal,
    BillingTest,
    Pricing,
    TermsOfService,
    PrivacyPolicy,
    VerifyEmail,
    NetworkOnboarding,
    HopCode,
    ProductionChecklist,
    LoadTesting,
    SystemHealth,
    ExportData,
    AIAssistantTest,
    AIWorkflowBuilder,
    AdminDashboard,
    DailyTasks,
    ManageDailyTasks,
    Documentation
  }
}
