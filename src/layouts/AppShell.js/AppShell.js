import { Link } from "react-router-dom"
import { Home, ClipboardList, PlusCircle, Settings } from "lucide-react"

export default function MainLayout({ children, currentPageName }) {
  return (
    <div className="min-h-screen flex bg-[#0a0e17] text-white">

      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0f1419] border-r border-blue-900/30 p-4 hidden md:flex flex-col">
        <div className="mb-6">
          <h1 className="text-xl font-bold">
            <span className="text-blue-400">ORA</span>{" "}
            <span className="text-orange-400">Inform Me</span>
          </h1>
          <p className="text-xs text-blue-300/60">
            Fleet & Construction Ops
          </p>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem to="/" label="Dashboard" icon={Home} />
          <NavItem to="/MyTasks" label="My Tasks" icon={ClipboardList} />
          <NavItem to="/CreateTask" label="Create Task" icon={PlusCircle} />
          <NavItem to="/Settings" label="Settings" icon={Settings} />
        </nav>

        <div className="mt-auto text-xs text-blue-300/40">
          © ORA Operations
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <header className="h-14 bg-[#0f1419] border-b border-blue-900/30 flex items-center px-4">
          <span className="text-sm text-blue-300">
            {currentPageName
              ? currentPageName.replace(/([A-Z])/g, " $1")
              : "Dashboard"}
          </span>
        </header>

        {/* PAGE CONTENT */}
        <section className="flex-1 p-4 md:p-6">
          {children}
        </section>

      </main>
    </div>
  )
}

/* ---------- NAV ITEM ---------- */
function NavItem({ to, label, icon: Icon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-md
                 text-blue-200 hover:bg-blue-900/20 hover:text-white
                 transition"
    >
      <Icon className="w-4 h-4 text-orange-400" />
      <span>{label}</span>
    </Link>
  )
}
