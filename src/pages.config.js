import AppShell from "@/app/AppShell"

// IMPORT YOUR PAGES
import Dashboard from "@/pages/Dashboard"
import MyTasks from "@/pages/MyTasks"
import CreateTask from "@/pages/CreateTask"
import Submissions from "@/pages/Submissions"
import Settings from "@/pages/Settings"

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
    Settings
  }
}
