import { ClipboardList, FileText, AlertTriangle, PlusCircle } from "lucide-react"
import { Link } from "react-router-dom"

export default function Dashboard() {
  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          <span className="text-blue-400">ORA</span>{" "}
          <span className="text-orange-400">Inform Me</span>
        </h1>
        <p className="text-blue-300/60 text-sm">
          Fleet & Construction Operations Dashboard
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Active Tasks"
          value="12"
          icon={ClipboardList}
          color="blue"
        />
        <StatCard
          title="Forms Submitted"
          value="5"
          icon={FileText}
          color="orange"
        />
        <StatCard
          title="Alerts"
          value="1"
          icon={AlertTriangle}
          color="red"
        />
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-[#0f1419] border border-blue-900/30 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white mb-3">
          Quick Actions
        </h2>

        <div className="flex flex-wrap gap-3">
          <QuickAction
            to="/CreateTask"
            label="Create Task"
            icon={PlusCircle}
          />
          <QuickAction
            to="/ManageDailyTasks"
            label="Daily Tasks"
            icon={ClipboardList}
          />
          <QuickAction
            to="/ViewForms"
            label="View Forms"
            icon={FileText}
          />
        </div>
      </div>

    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }) {
  const colorMap = {
    blue: "text-blue-400",
    orange: "text-orange-400",
    red: "text-red-400"
  }

  return (
    <div className="bg-[#0f1419] border border-blue-900/30 rounded-xl p-4 flex items-center gap-4">
      <Icon className={`w-8 h-8 ${colorMap[color]}`} />
      <div>
        <p className="text-sm text-blue-300/60">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

function QuickAction({ to, label, icon: Icon }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-900/20 border border-blue-900/40 text-blue-300 hover:text-white hover:bg-blue-900/40 transition"
    >
      <Icon className="w-4 h-4 text-orange-400" />
      <span>{label}</span>
    </Link>
  )
}
