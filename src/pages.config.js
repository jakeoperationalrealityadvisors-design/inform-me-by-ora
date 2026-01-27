import { lazy } from 'react';
import AppShell from "@/app/AppShell"

// IMPORT YOUR PAGES
const Dashboard = lazy(() => import("@/pages/Dashboard"))
const MyTasks = lazy(() => import("@/pages/MyTasks"))
const CreateTask = lazy(() => import("@/pages/CreateTask"))
const Submissions = lazy(() => import("@/pages/Submissions"))
const Settings = lazy(() => import("@/pages/Settings"))
const Home = lazy(() => import("@/pages/Home"))
const Admin = lazy(() => import("@/pages/Admin"))
const AnalyticsDashboard = lazy(() => import("@/pages/AnalyticsDashboard"))
const Documents = lazy(() => import("@/pages/Documents"))
const Forms = lazy(() => import("@/pages/Forms"))
const Checklists = lazy(() => import("@/pages/Checklists"))
const Tasks = lazy(() => import("@/pages/Tasks"))
const Calendar = lazy(() => import("@/pages/Calendar"))
const Messages = lazy(() => import("@/pages/Messages"))
const Reports = lazy(() => import("@/pages/Reports"))
const UserManagement = lazy(() => import("@/pages/UserManagement"))
const RoleManagement = lazy(() => import("@/pages/RoleManagement"))
const OrganizationSettings = lazy(() => import("@/pages/OrganizationSettings"))
const Integrations = lazy(() => import("@/pages/Integrations"))
const Support = lazy(() => import("@/pages/Support"))
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"))
const ActivityLog = lazy(() => import("@/pages/ActivityLog"))
const AIAssistantPage = lazy(() => import("@/pages/AIAssistantPage"))
const AutomationOptimizer = lazy(() => import("@/pages/AutomationOptimizer"))
const ManageAutomations = lazy(() => import("@/pages/ManageAutomations"))
const EditAutomation = lazy(() => import("@/pages/EditAutomation"))
const CreateDocumentWorkflow = lazy(() => import("@/pages/CreateDocumentWorkflow"))
const DocumentWorkflows = lazy(() => import("@/pages/DocumentWorkflows"))
const DocumentEditor = lazy(() => import("@/pages/DocumentEditor"))
const DocumentSearch = lazy(() => import("@/pages/DocumentSearch"))
const UploadDocument = lazy(() => import("@/pages/UploadDocument"))
const ViewDocument = lazy(() => import("@/pages/ViewDocument"))
const CreateForm = lazy(() => import("@/pages/CreateForm"))
const EditForm = lazy(() => import("@/pages/EditForm"))
const FillForm = lazy(() => import("@/pages/FillForm"))
const PublicForm = lazy(() => import("@/pages/PublicForm"))
const ViewFormSubmission = lazy(() => import("@/pages/ViewFormSubmission"))
const CreateChecklist = lazy(() => import("@/pages/CreateChecklist"))
const EditChecklist = lazy(() => import("@/pages/EditChecklist"))
const FillChecklist = lazy(() => import("@/pages/FillChecklist"))
const PublicChecklist = lazy(() => import("@/pages/PublicChecklist"))
const ViewChecklistSubmission = lazy(() => import("@/pages/ViewChecklistSubmission"))
const EditCategory = lazy(() => import("@/pages/EditCategory"))
const ManageFolders = lazy(() => import("@/pages/ManageFolders"))
const Scanner = lazy(() => import("@/pages/Scanner"))
const SendFax = lazy(() => import("@/pages/SendFax"))
const TikTokDashboard = lazy(() => import("@/pages/TikTokDashboard"))
const CustomerPortal = lazy(() => import("@/pages/CustomerPortal"))
const BillingTest = lazy(() => import("@/pages/BillingTest"))
const Pricing = lazy(() => import("@/pages/Pricing"))
const TermsOfService = lazy(() => import("@/pages/TermsOfService"))
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"))
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"))
const NetworkOnboarding = lazy(() => import("@/pages/NetworkOnboarding"))
const HopCode = lazy(() => import("@/pages/HopCode"))
const ProductionChecklist = lazy(() => import("@/pages/ProductionChecklist"))
const LoadTesting = lazy(() => import("@/pages/LoadTesting"))
const SystemHealth = lazy(() => import("@/pages/SystemHealth"))
const ExportData = lazy(() => import("@/pages/ExportData"))
const AIAssistantTest = lazy(() => import("@/pages/AIAssistantTest"))
const AIWorkflowBuilder = lazy(() => import("@/pages/AIWorkflowBuilder"))
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"))
const DailyTasks = lazy(() => import("@/pages/DailyTasks"))
const ManageDailyTasks = lazy(() => import("@/pages/ManageDailyTasks"))
const Documentation = lazy(() => import("@/pages/Documentation"))

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
