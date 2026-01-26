// src/sampleData.ts
export const sampleData = {
  org: {
    id: "ora-001",
    name: "Operational Reality Advisors",
    region: "Canada",
    industry: "Fleet & Operations"
  },

  users: [
    {
      id: "user-001",
      name: "Jake",
      role: "admin"
    }
  ],

  /* =========================
     FORMS
     ========================= */
  forms: [
    {
      id: "form-001",
      title: "Daily Driver Log",
      description: "End-of-day driver activity and duty log",
      category: "Daily Operations",
      active: true
    },
    {
      id: "form-002",
      title: "Incident Report",
      description: "Accidents, damages, or near misses",
      category: "Safety",
      active: true
    },
    {
      id: "form-003",
      title: "Pre-Trip Inspection",
      description: "Daily pre-trip vehicle inspection",
      category: "Compliance",
      active: true
    },
    {
      id: "form-004",
      title: "Post-Trip Inspection",
      description: "End-of-shift vehicle inspection",
      category: "Maintenance",
      active: true
    }
  ],

  /* =========================
     DAILY TASKS
     ========================= */
  dailyTasks: [
    {
      id: "task-001",
      title: "Complete Pre-Trip Inspection",
      description: "Inspect vehicle before leaving yard",
      category: "Safety",
      order: 0,
      active: true
    },
    {
      id: "task-002",
      title: "Check Load Securement",
      description: "Verify straps, chains, and binders",
      category: "Safety",
      order: 1,
      active: true
    },
    {
      id: "task-003",
      title: "Submit Daily Driver Log",
      description: "End-of-day log submission",
      category: "Compliance",
      order: 2,
      active: true
    },
    {
      id: "task-004",
      title: "Fuel & DEF Check",
      description: "Ensure sufficient fuel and DEF",
      category: "Maintenance",
      order: 3,
      active: true
    }
  ],

  /* =========================
     SUBMISSIONS
     ========================= */
  submissions: [
    {
      id: "sub-001",
      formId: "form-001",
      formTitle: "Daily Driver Log",
      submittedBy: "Jake",
      date: "2026-01-24",
      status: "Submitted"
    },
    {
      id: "sub-002",
      formId: "form-002",
      formTitle: "Incident Report",
      submittedBy: "Jake",
      date: "2026-01-22",
      status: "Reviewed"
    },
    {
      id: "sub-003",
      formId: "form-003",
      formTitle: "Pre-Trip Inspection",
      submittedBy: "Jake",
      date: "2026-01-25",
      status: "Submitted"
    }
  ],

  /* =========================
     CHECKLISTS
     ========================= */
  checklists: [
    {
      id: "checklist-001",
      title: "Daily Safety Checklist",
      items: [
        "Seatbelt worn",
        "Mirrors adjusted",
        "Fire extinguisher present",
        "Emergency triangles onboard"
      ]
    },
    {
      id: "checklist-002",
      title: "Vehicle Inspection Checklist",
      items: [
        "Brakes",
        "Lights",
        "Tires",
        "Fluids",
        "Windshield"
      ]
    }
  ]
};

