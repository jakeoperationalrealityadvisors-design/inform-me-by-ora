import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Library, Search, ArrowLeft, Download, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const LIBRARY = [
  {
    id: "hvac-pm",
    category: "HVAC",
    color: "bg-blue-500",
    title: "HVAC Preventive Maintenance",
    description: "Seasonal PM checklist for commercial HVAC units.",
    items: [
      { text: "Inspect and replace air filters", required: true, notes_enabled: false },
      { text: "Clean evaporator and condenser coils", required: true, notes_enabled: true },
      { text: "Check refrigerant levels and inspect for leaks", required: true, notes_enabled: true },
      { text: "Inspect belts and pulleys for wear", required: true, notes_enabled: false },
      { text: "Lubricate all moving parts", required: false, notes_enabled: false },
      { text: "Check thermostat calibration and operation", required: true, notes_enabled: false },
      { text: "Inspect electrical connections and controls", required: true, notes_enabled: true },
      { text: "Clean and flush condensate drain lines", required: true, notes_enabled: false },
      { text: "Test safety shut-off switches", required: true, notes_enabled: false },
      { text: "Document all readings and findings", required: true, notes_enabled: true },
    ]
  },
  {
    id: "roof-inspection",
    category: "Roofing",
    color: "bg-orange-500",
    title: "Roof Inspection Checklist",
    description: "Pre and post storm roof inspection for commercial properties.",
    items: [
      { text: "Confirm PPE and fall protection is in place", required: true, notes_enabled: false },
      { text: "Inspect roof membrane for punctures or tears", required: true, notes_enabled: true },
      { text: "Check all flashing and seals around penetrations", required: true, notes_enabled: true },
      { text: "Inspect gutters and downspouts for debris", required: true, notes_enabled: false },
      { text: "Check drainage points and scuppers", required: true, notes_enabled: false },
      { text: "Document any blistering or bubbling on surface", required: true, notes_enabled: true },
      { text: "Inspect skylights and vents", required: false, notes_enabled: true },
      { text: "Check parapet walls and coping", required: true, notes_enabled: false },
      { text: "Take photos of all deficiencies", required: true, notes_enabled: true },
      { text: "Complete written report and sign off", required: true, notes_enabled: true },
    ]
  },
  {
    id: "forklift-preshift",
    category: "Warehouse",
    color: "bg-yellow-500",
    title: "Forklift Pre-Shift Inspection",
    description: "Daily operator inspection before first use.",
    items: [
      { text: "Check fuel/charge level", required: true, notes_enabled: false },
      { text: "Inspect tires for damage or low pressure", required: true, notes_enabled: false },
      { text: "Test brakes (service and parking)", required: true, notes_enabled: false },
      { text: "Inspect forks for cracks or bends", required: true, notes_enabled: true },
      { text: "Test horn and warning lights", required: true, notes_enabled: false },
      { text: "Check overhead guard and backrest extension", required: true, notes_enabled: false },
      { text: "Inspect hydraulic system for leaks", required: true, notes_enabled: true },
      { text: "Check seat belt operation", required: true, notes_enabled: false },
      { text: "Test mast and lift controls", required: true, notes_enabled: false },
      { text: "Record mileage/hours and sign inspection tag", required: true, notes_enabled: true },
    ]
  },
  {
    id: "food-safety",
    category: "Food Service",
    color: "bg-green-500",
    title: "Daily Food Safety Opening",
    description: "Opening inspection for food service establishments.",
    items: [
      { text: "Verify refrigerator and freezer temperatures", required: true, notes_enabled: true },
      { text: "Check all food for proper labeling and dates", required: true, notes_enabled: false },
      { text: "Inspect handwashing stations are stocked", required: true, notes_enabled: false },
      { text: "Sanitize all food prep surfaces", required: true, notes_enabled: false },
      { text: "Check and log sanitizer concentration", required: true, notes_enabled: true },
      { text: "Inspect dishwasher temperature and chemical levels", required: true, notes_enabled: true },
      { text: "Verify hot holding equipment reaches 140°F+", required: true, notes_enabled: true },
      { text: "Check pest control bait stations", required: false, notes_enabled: false },
      { text: "Review staff illness log", required: true, notes_enabled: false },
      { text: "Complete opening inspection log", required: true, notes_enabled: true },
    ]
  },
  {
    id: "vehicle-inspection",
    category: "Fleet",
    color: "bg-slate-500",
    title: "Commercial Vehicle Pre-Trip",
    description: "DOT-compliant pre-trip vehicle inspection.",
    items: [
      { text: "Check engine oil, coolant, and fluid levels", required: true, notes_enabled: true },
      { text: "Inspect tires for tread depth and inflation", required: true, notes_enabled: true },
      { text: "Test all exterior lights and signals", required: true, notes_enabled: false },
      { text: "Check mirrors and windshield for damage", required: true, notes_enabled: false },
      { text: "Inspect brakes and air pressure", required: true, notes_enabled: true },
      { text: "Check coupling devices and trailer connections", required: true, notes_enabled: false },
      { text: "Verify load securement and tarps", required: true, notes_enabled: false },
      { text: "Confirm fire extinguisher and emergency kit present", required: true, notes_enabled: false },
      { text: "Review driver logs and hours of service", required: true, notes_enabled: false },
      { text: "Sign and date inspection form", required: true, notes_enabled: true },
    ]
  },
  {
    id: "electrical-safety",
    category: "Electrical",
    color: "bg-yellow-400",
    title: "Electrical Panel Inspection",
    description: "Routine safety inspection for electrical distribution panels.",
    items: [
      { text: "Verify lockout/tagout procedures are followed", required: true, notes_enabled: false },
      { text: "Inspect panel for signs of overheating or burning", required: true, notes_enabled: true },
      { text: "Check breaker labeling is accurate and legible", required: true, notes_enabled: false },
      { text: "Test ground fault circuit interrupters (GFCIs)", required: true, notes_enabled: true },
      { text: "Inspect wiring for signs of damage or fraying", required: true, notes_enabled: true },
      { text: "Check for proper grounding connections", required: true, notes_enabled: false },
      { text: "Verify clearance around panel (36 inch minimum)", required: true, notes_enabled: false },
      { text: "Document any tripped breakers or anomalies", required: true, notes_enabled: true },
      { text: "Record IR thermography readings if applicable", required: false, notes_enabled: true },
      { text: "Sign inspection log and update maintenance records", required: true, notes_enabled: true },
    ]
  },
  {
    id: "construction-site",
    category: "Construction",
    color: "bg-red-500",
    title: "Construction Site Safety",
    description: "Daily site safety walkthrough for general contractors.",
    items: [
      { text: "Verify all workers are wearing required PPE", required: true, notes_enabled: false },
      { text: "Inspect scaffolding and ladder placements", required: true, notes_enabled: true },
      { text: "Check excavation shoring and barriers", required: true, notes_enabled: true },
      { text: "Confirm first aid kits are stocked and accessible", required: true, notes_enabled: false },
      { text: "Inspect power tools for damage and grounding", required: true, notes_enabled: false },
      { text: "Verify fire extinguisher locations", required: true, notes_enabled: false },
      { text: "Check hazardous material storage compliance", required: true, notes_enabled: true },
      { text: "Inspect fall protection systems", required: true, notes_enabled: true },
      { text: "Confirm toolbox talk was completed", required: true, notes_enabled: false },
      { text: "Document any near-misses or incidents", required: true, notes_enabled: true },
    ]
  },
  {
    id: "vessel-predeparture",
    category: "Marine",
    color: "bg-cyan-500",
    title: "Vessel Pre-Departure",
    description: "Safety check before leaving dock for commercial vessels.",
    items: [
      { text: "Check fuel level and reserve supply", required: true, notes_enabled: false },
      { text: "Test all navigation lights", required: true, notes_enabled: false },
      { text: "Inspect life jackets for all persons on board", required: true, notes_enabled: false },
      { text: "Check VHF radio and emergency communications", required: true, notes_enabled: false },
      { text: "Inspect fire extinguishers", required: true, notes_enabled: false },
      { text: "Test bilge pumps", required: true, notes_enabled: false },
      { text: "Check weather forecast and file float plan", required: true, notes_enabled: true },
      { text: "Inspect engine compartment for leaks", required: true, notes_enabled: true },
      { text: "Verify flares and visual distress signals", required: true, notes_enabled: false },
      { text: "Confirm all passengers are briefed on safety", required: true, notes_enabled: false },
    ]
  },
  {
    id: "cleaning-hotel",
    category: "Hospitality",
    color: "bg-pink-500",
    title: "Hotel Room Turnover",
    description: "Housekeeping room inspection before guest arrival.",
    items: [
      { text: "Strip and replace all bed linens", required: true, notes_enabled: false },
      { text: "Clean and sanitize bathroom thoroughly", required: true, notes_enabled: false },
      { text: "Replenish all toiletries and amenities", required: true, notes_enabled: false },
      { text: "Vacuum and mop all floors", required: true, notes_enabled: false },
      { text: "Dust all surfaces including vents and baseboards", required: true, notes_enabled: false },
      { text: "Test all lighting and replace bulbs if needed", required: true, notes_enabled: false },
      { text: "Check TV and remote operation", required: false, notes_enabled: false },
      { text: "Inspect for maintenance issues (report if found)", required: true, notes_enabled: true },
      { text: "Restock mini-bar and coffee station", required: false, notes_enabled: false },
      { text: "Final walkthrough before signing off room", required: true, notes_enabled: true },
    ]
  },
  {
    id: "it-server",
    category: "IT / Tech",
    color: "bg-indigo-500",
    title: "Server Room Monthly Audit",
    description: "Monthly physical and environmental audit of server room.",
    items: [
      { text: "Check temperature and humidity readings", required: true, notes_enabled: true },
      { text: "Inspect UPS battery status and test alarms", required: true, notes_enabled: true },
      { text: "Verify all servers and network equipment are online", required: true, notes_enabled: true },
      { text: "Check cable management for loose or unlabeled cables", required: false, notes_enabled: false },
      { text: "Inspect raised floor tiles and cooling vents", required: true, notes_enabled: false },
      { text: "Review access log for unauthorized entries", required: true, notes_enabled: true },
      { text: "Test fire suppression system status", required: true, notes_enabled: false },
      { text: "Confirm offsite backup completion for the month", required: true, notes_enabled: true },
      { text: "Document any hardware warnings or failures", required: true, notes_enabled: true },
      { text: "Update maintenance log with all findings", required: true, notes_enabled: true },
    ]
  },
];

const CATEGORIES = ["All", ...Array.from(new Set(LIBRARY.map(t => t.category)))];

export default function ChecklistLibrary() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(null);
  const [saved, setSaved] = useState({});

  const filtered = LIBRARY.filter(t => {
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const loadTemplate = async (template) => {
    setLoading(template.id);
    await base44.entities.ChecklistTemplate.create({
      title: template.title,
      description: template.description,
      items: template.items.map((item, i) => ({ ...item, id: `item_${i}` })),
      status: "active"
    });
    setSaved(prev => ({ ...prev, [template.id]: true }));
    setLoading(null);
    toast.success(`"${template.title}" added to your checklists!`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-blue-600 flex items-center justify-center">
            <Library className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Checklist Library</h1>
            <p className="text-xs text-gray-500">{LIBRARY.length} industry-ready templates</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search templates..."
            className="pl-9 bg-white border-gray-200"
          />
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                activeCategory === cat
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Templates */}
        <div className="space-y-3">
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">No templates match your search.</div>
          )}
          {filtered.map(template => (
            <div key={template.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 flex items-start gap-3">
                <div className={`w-2 self-stretch rounded-full ${template.color} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-gray-900">{template.title}</h3>
                        <Badge variant="secondary" className="text-xs">{template.category}</Badge>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{template.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{template.items.length} items · {template.items.filter(i => i.required).length} required</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpanded(expanded === template.id ? null : template.id)}
                        className="text-xs text-gray-400 hover:text-gray-700 flex items-center gap-1 transition-colors"
                      >
                        {expanded === template.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <Button
                        size="sm"
                        onClick={() => loadTemplate(template)}
                        disabled={loading === template.id || saved[template.id]}
                        className={`h-8 text-xs ${saved[template.id] ? "bg-green-600 hover:bg-green-600" : "bg-gray-900 hover:bg-gray-700"} text-white`}
                      >
                        {saved[template.id] ? (
                          <><CheckCircle2 className="w-3 h-3" /> Saved</>
                        ) : loading === template.id ? (
                          <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <><Download className="w-3 h-3" /> Load</>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded preview */}
              {expanded === template.id && (
                <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Preview</p>
                  <ul className="space-y-1.5">
                    {template.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5" />
                        <span className="flex-1">{item.text}</span>
                        <div className="flex gap-1">
                          {item.required && <Badge className="text-[10px] py-0 px-1.5 bg-red-100 text-red-600 border-0 h-4">req</Badge>}
                          {item.notes_enabled && <Badge className="text-[10px] py-0 px-1.5 bg-blue-100 text-blue-600 border-0 h-4">notes</Badge>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}