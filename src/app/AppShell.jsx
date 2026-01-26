import { Outlet, useLocation } from "react-router-dom"
import Layout from "@/Layout"

export default function AppShell() {
  const location = useLocation()

  // Convert route path → page name
  const currentPageName = location.pathname === "/"
    ? "Dashboard"
    : location.pathname.replace("/", "")

  return (
    <Layout currentPageName={currentPageName}>
      <Outlet />
    </Layout>
  )
}
