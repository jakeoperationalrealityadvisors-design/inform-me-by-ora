import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList, Wand2, FileText, CheckCircle2, Users,
  ArrowRight, ArrowLeft, X, Sparkles, BarChart2, MessageSquare
} from "lucide-react";

const STORAGE_KEY = "ora_walkthrough_complete";

const steps = [
  {
    icon: Sparkles,
    color: "from-violet-500 to-purple-600",
    title: "Welcome to Inform' Me by ORA",
    subtitle: "Your all-in-one field operations platform",
    description: "Let's take 60 seconds to show you how to get your team working smarter from day one.",
    action: null,
    image: null
  },
  {
    icon: ClipboardList,
    color: "from-blue-500 to-blue-600",
    title: "Ready-Made Checklists",
    subtitle: "100+ industry checklists, ready to use",
    description: "Browse our library of professional checklists across construction, healthcare, food service, trades, and more. Assign them to your team instantly.",
    action: { label: "Browse Checklists", path: "/EditChecklist" },
    bullets: [
      "22 industries covered",
      "Safety, compliance & operations",
      "Assign to field workers in seconds"
    ]
  },
  {
    icon: Wand2,
    color: "from-violet-500 to-purple-600",
    title: "Build with AI",
    subtitle: "Describe it — AI builds it for you",
    description: "Don't see what you need? Just describe your process in plain language and our AI will generate a complete, professional checklist tailored to your operation.",
    action: { label: "Try AI Builder", path: "/CreateChecklistAI" },
    bullets: [
      "Describe any process in plain English",
      "AI generates 8–15 structured items",
      "Edit, reorder, and save in minutes"
    ]
  },
  {
    icon: FileText,
    color: "from-emerald-500 to-green-600",
    title: "Forms & Submissions",
    subtitle: "Capture data from the field",
    description: "Create custom forms for inspections, incident reports, audits, and more. Field workers fill them out on mobile and submissions flow back to you in real time.",
    action: { label: "See Forms", path: "/CreateForm" },
    bullets: [
      "Drag-and-drop form builder",
      "Mobile-optimized for field use",
      "Real-time submission tracking"
    ]
  },
  {
    icon: Users,
    color: "from-orange-500 to-amber-600",
    title: "Manage Your Team",
    subtitle: "Assign tasks, track progress",
    description: "Add your team members, assign checklists and tasks, and monitor completion in real time from your admin dashboard.",
    action: { label: "Manage Users", path: "/AdminUsers" },
    bullets: [
      "Role-based access (admin / field worker)",
      "Assign tasks with due dates",
      "Track completion from dashboard"
    ]
  },
  {
    icon: BarChart2,
    color: "from-rose-500 to-pink-600",
    title: "Reports & Insights",
    subtitle: "See what's happening in the field",
    description: "Track submission rates, completion percentages, overdue items, and team performance. Export reports or use AI to surface key insights.",
    action: { label: "View Reports", path: "/Reports" },
    bullets: [
      "Live completion metrics",
      "AI-generated summaries",
      "CSV export for compliance"
    ]
  },
  {
    icon: CheckCircle2,
    color: "from-teal-500 to-emerald-600",
    title: "You're all set!",
    subtitle: "Start with your first checklist",
    description: "Your platform is ready. Start by browsing the checklist library or letting AI build your first custom checklist.",
    action: { label: "Go to Dashboard", path: "/" },
    secondaryAction: { label: "Build a Checklist with AI", path: "/CreateChecklistAI" }
  }
];

export default function UserFlowWalkthrough({ onClose, forceShow = false }) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (forceShow || !done) {
      setVisible(true);
    }
  }, [forceShow]);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
    onClose?.();
  };

  const goTo = (path) => {
    close();
    navigate(path);
  };

  if (!visible) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isFirst = step === 0;
  const isLast = step === steps.length - 1;
  const progress = ((step) / (steps.length - 1)) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Close */}
        <button
          onClick={close}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        {/* Hero */}
        <div className={`bg-gradient-to-br ${current.color} p-8 flex flex-col items-center text-center`}>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
            <Icon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white leading-tight">{current.title}</h2>
          <p className="text-sm text-white/80 mt-1">{current.subtitle}</p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-sm text-gray-600 leading-relaxed">{current.description}</p>

          {current.bullets && (
            <ul className="mt-4 space-y-2">
              {current.bullets.map((b, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
                  {b}
                </li>
              ))}
            </ul>
          )}

          {/* Actions */}
          <div className="mt-6 space-y-2">
            {current.action && (
              <Button
                onClick={() => goTo(current.action.path)}
                className={`w-full bg-gradient-to-r ${current.color} text-white border-0 hover:opacity-90`}
              >
                {current.action.label} <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {current.secondaryAction && (
              <Button
                variant="outline"
                onClick={() => goTo(current.secondaryAction.path)}
                className="w-full border-violet-200 text-violet-700 hover:bg-violet-50"
              >
                <Wand2 className="w-4 h-4" /> {current.secondaryAction.label}
              </Button>
            )}
          </div>

          {/* Nav */}
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={() => setStep(s => s - 1)}
              disabled={isFirst}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 disabled:opacity-0 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            {/* Dots */}
            <div className="flex gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`rounded-full transition-all duration-200 ${
                    i === step
                      ? "w-5 h-2 bg-violet-600"
                      : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>

            {isLast ? (
              <button
                onClick={close}
                className="text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
              >
                Done
              </button>
            ) : (
              <button
                onClick={() => setStep(s => s + 1)}
                className="flex items-center gap-1 text-sm font-medium text-violet-600 hover:text-violet-800 transition-colors"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Skip */}
          {!isLast && (
            <div className="text-center mt-3">
              <button onClick={close} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Skip walkthrough
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for re-triggering
export function resetWalkthrough() {
  localStorage.removeItem(STORAGE_KEY);
}