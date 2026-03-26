import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Sparkles, Plus, Trash2, GripVertical, CheckCircle2,
  ArrowLeft, Save, Wand2, RotateCcw, ChevronDown, ChevronUp
} from "lucide-react";

function ItemRow({ item, index, onUpdate, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
  return (
    <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg group">
      <div className="flex flex-col gap-1 pt-1">
        <button onClick={onMoveUp} disabled={isFirst} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors">
          <ChevronUp className="w-4 h-4" />
        </button>
        <button onClick={onMoveDown} disabled={isLast} className="text-gray-300 hover:text-gray-600 disabled:opacity-20 transition-colors">
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0 mt-1" />
      <div className="flex-1 min-w-0">
        <Input
          value={item.text}
          onChange={e => onUpdate({ ...item, text: e.target.value })}
          placeholder="Checklist item..."
          className="border-0 p-0 h-auto text-sm font-medium focus-visible:ring-0 bg-transparent"
        />
        <div className="flex items-center gap-3 mt-1">
          <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={item.required}
              onChange={e => onUpdate({ ...item, required: e.target.checked })}
              className="w-3 h-3"
            />
            Required
          </label>
          <label className="flex items-center gap-1 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={item.notes_enabled}
              onChange={e => onUpdate({ ...item, notes_enabled: e.target.checked })}
              className="w-3 h-3"
            />
            Notes
          </label>
        </div>
      </div>
      <button
        onClick={onDelete}
        className="text-gray-300 hover:text-red-500 transition-colors mt-1 flex-shrink-0"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function CreateChecklistAI() {
  const navigate = useNavigate();
  const [step, setStep] = useState("describe"); // describe | build
  const [prompt, setPrompt] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);

  const loadCategories = async () => {
    if (categoriesLoaded) return;
    const cats = await base44.entities.Category.list();
    setCategories(cats);
    setCategoriesLoaded(true);
  };

  const generateChecklist = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a professional operations checklist expert. Generate a detailed, practical checklist based on this description:

"${prompt}"

Return a JSON object with:
- title: concise checklist title (max 8 words)
- description: one sentence describing the checklist's purpose
- items: array of 8-15 checklist items, each with:
  - text: the checklist item text (clear, actionable, starts with a verb or noun phrase)
  - required: true if critical/safety-related, false if optional
  - notes_enabled: true if the item typically needs documentation

Make items practical, specific, and ordered logically (safety first, then process steps, then completion/sign-off).`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          description: { type: "string" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                text: { type: "string" },
                required: { type: "boolean" },
                notes_enabled: { type: "boolean" }
              }
            }
          }
        }
      }
    });

    const generated = result;
    setTitle(generated.title || "");
    setDescription(generated.description || "");
    setItems((generated.items || []).map((item, i) => ({ ...item, id: `item_${Date.now()}_${i}` })));
    setStep("build");
    setGenerating(false);
    loadCategories();
  };

  const addItem = () => {
    setItems(prev => [...prev, { id: `item_${Date.now()}`, text: "", required: false, notes_enabled: false }]);
  };

  const updateItem = (index, updated) => {
    setItems(prev => prev.map((item, i) => i === index ? updated : item));
  };

  const deleteItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const moveItem = (index, direction) => {
    setItems(prev => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const saveChecklist = async () => {
    if (!title.trim() || items.filter(i => i.text.trim()).length === 0) return;
    setSaving(true);
    await base44.entities.ChecklistTemplate.create({
      title: title.trim(),
      description: description.trim(),
      category_id: selectedCategory || undefined,
      items: items.filter(i => i.text.trim()),
      status: "active"
    });
    navigate("/EditChecklist");
  };

  const regenerate = () => {
    setStep("describe");
    setItems([]);
    setTitle("");
    setDescription("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-900">Build a Checklist</h1>
            <p className="text-xs text-gray-500">AI-powered checklist builder</p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 space-y-4">

        {/* Step 1: Describe */}
        {step === "describe" && (
          <div className="space-y-4 pt-4">
            <div className="text-center space-y-2 pb-2">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">What do you need a checklist for?</h2>
              <p className="text-sm text-gray-500">Describe the task, industry, or process — AI will build it for you.</p>
            </div>

            <Card className="border-2 border-violet-100 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <Textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Daily pre-shift safety inspection for a concrete pouring crew on a commercial construction site..."
                  className="min-h-[120px] resize-none text-sm border-gray-200 focus-visible:ring-violet-500"
                  onKeyDown={e => {
                    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) generateChecklist();
                  }}
                />
                <Button
                  onClick={generateChecklist}
                  disabled={!prompt.trim() || generating}
                  className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                >
                  {generating ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate Checklist</>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Prompt examples */}
            <div>
              <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">Try these examples</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Opening a coffee shop each morning",
                  "Welding job safety pre-check",
                  "New employee onboarding",
                  "Vessel pre-departure check",
                  "Food truck health inspection",
                  "Forklift pre-shift inspection"
                ].map(example => (
                  <button
                    key={example}
                    onClick={() => setPrompt(example)}
                    className="text-xs px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-600 hover:border-violet-400 hover:text-violet-700 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Build / Edit */}
        {step === "build" && (
          <div className="space-y-4 pt-2">
            {/* Title & description */}
            <Card className="border border-gray-200">
              <CardContent className="p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Checklist Title</label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Checklist title..."
                    className="mt-1 text-base font-semibold border-gray-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description (optional)</label>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="What is this checklist for?"
                    className="mt-1 text-sm border-gray-200 resize-none min-h-[60px]"
                  />
                </div>
                {categories.length > 0 && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={e => setSelectedCategory(e.target.value)}
                      className="mt-1 w-full border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                    >
                      <option value="">No category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.data?.name || cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-800">Checklist Items</p>
                  <Badge variant="secondary" className="text-xs">{items.filter(i => i.text.trim()).length} items</Badge>
                  <Badge className="text-xs bg-red-100 text-red-700 border-0">
                    {items.filter(i => i.required && i.text.trim()).length} required
                  </Badge>
                </div>
                <button
                  onClick={regenerate}
                  className="text-xs text-violet-600 hover:text-violet-800 flex items-center gap-1 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" /> Regenerate
                </button>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => (
                  <ItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    onUpdate={updated => updateItem(index, updated)}
                    onDelete={() => deleteItem(index)}
                    onMoveUp={() => moveItem(index, -1)}
                    onMoveDown={() => moveItem(index, 1)}
                    isFirst={index === 0}
                    isLast={index === items.length - 1}
                  />
                ))}
              </div>

              <button
                onClick={addItem}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-violet-400 hover:text-violet-600 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add item
              </button>
            </div>

            {/* Save */}
            <div className="pb-6">
              <Button
                onClick={saveChecklist}
                disabled={saving || !title.trim() || items.filter(i => i.text.trim()).length === 0}
                className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white h-12 text-base"
              >
                {saving ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <><CheckCircle2 className="w-5 h-5" /> Save Checklist</>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}