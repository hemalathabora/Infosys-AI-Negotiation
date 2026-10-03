import { useState } from "react";
import { createCustomScenario, updateCustomScenario } from "../../services/api";

const CATEGORIES = [
  "Business",
  "Employment",
  "Purchasing",
  "Real Estate",
  "Finance",
  "Freelancing",
  "Project Management",
  "Personal",
  "Other"
];

const PERSONALITIES = ["Collaborative", "Aggressive", "Risk-Averse"];
const VARIABLE_TYPES = ["Currency", "Number", "Percentage", "Date", "Text"];

export default function CustomScenarioBuilder({
  editingScenario = null,
  onClose,
  onSaveSuccess,
  onStartNegotiation,
  isDark = true
}) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Form State
  const [name, setName] = useState(editingScenario?.name || editingScenario?.scenario_name || "");
  const [category, setCategory] = useState(editingScenario?.category || "Business");
  const [description, setDescription] = useState(editingScenario?.description || "");
  const [maxRounds, setMaxRounds] = useState(editingScenario?.max_rounds || 10);
  const [mode, setMode] = useState(editingScenario?.mode || "simulation");
  const [humanRole, setHumanRole] = useState(editingScenario?.human_role || "");

  // Step 2: Participants (default 2)
  const [participants, setParticipants] = useState(() => {
    if (editingScenario?.participants && editingScenario.participants.length >= 2) {
      return editingScenario.participants.map((p, idx) => ({
        name: p.name || `Participant ${idx + 1}`,
        role: p.role || (idx === 0 ? "Buyer" : "Seller"),
        personality: p.personality || p.persona || "Collaborative",
        objective: p.objective || p.goal || "Achieve target price",
        secondary_objective: p.secondary_objective || "",
        min_value: p.min_value ?? (idx === 1 ? 40000 : null),
        max_value: p.max_value ?? (idx === 0 ? 50000 : null)
      }));
    }
    return [
      {
        name: "Alex Vance",
        role: "Buyer",
        personality: "Risk-Averse",
        objective: "Secure lowest price within budget limit",
        secondary_objective: "Get free warranty",
        min_value: null,
        max_value: 50000
      },
      {
        name: "Daniel Carter",
        role: "Seller",
        personality: "Aggressive",
        objective: "Maximize total deal price and profit",
        secondary_objective: "Close transaction quickly",
        min_value: 42000,
        max_value: null
      }
    ];
  });

  // Step 3: Variables
  const [variables, setVariables] = useState(() => {
    if (editingScenario?.variables && editingScenario.variables.length > 0) {
      return editingScenario.variables.map((v) => (typeof v === "string" ? { name: v, type: "Currency", importance: "High" } : v));
    }
    return [
      { name: "Price", type: "Currency", starting_value: 45000, min_value: 40000, max_value: 50000, importance: "High" },
      { name: "Warranty", type: "Text", starting_value: "1 Year", importance: "Medium" }
    ];
  });

  const handleAddParticipant = () => {
    const idx = participants.length + 1;
    setParticipants((prev) => [
      ...prev,
      {
        name: `Participant ${idx}`,
        role: `Role ${idx}`,
        personality: "Collaborative",
        objective: "Achieve optimal terms",
        secondary_objective: "",
        min_value: null,
        max_value: null
      }
    ]);
  };

  const handleRemoveParticipant = (idx) => {
    if (participants.length <= 2) {
      setErrorMsg("A negotiation scenario requires at least 2 participants.");
      return;
    }
    setParticipants((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateParticipant = (idx, field, value) => {
    setParticipants((prev) =>
      prev.map((p, i) => (i === idx ? { ...p, [field]: value } : p))
    );
  };

  const handleAddVariable = () => {
    setVariables((prev) => [
      ...prev,
      { name: "", type: "Currency", starting_value: "", min_value: "", max_value: "", importance: "Medium" }
    ]);
  };

  const handleRemoveVariable = (idx) => {
    setVariables((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateVariable = (idx, field, value) => {
    setVariables((prev) =>
      prev.map((v, i) => (i === idx ? { ...v, [field]: value } : v))
    );
  };

  // Validation before step transition & save
  const validateStep = (currentStep) => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!name.trim()) {
        setErrorMsg("Please enter a scenario name.");
        return false;
      }
      if (!description.trim()) {
        setErrorMsg("Please enter a scenario description.");
        return false;
      }
      if (Number(maxRounds) <= 0) {
        setErrorMsg("Max negotiation rounds must be greater than 0.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (participants.length < 2) {
        setErrorMsg("At least 2 participants are required.");
        return false;
      }
      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        if (!p.role.trim() || !p.name.trim()) {
          setErrorMsg(`Participant ${i + 1} must have a name and role.`);
          return false;
        }
        if (!p.objective.trim()) {
          setErrorMsg(`Participant '${p.name}' must have a primary objective.`);
          return false;
        }
        if (p.min_value !== null && p.max_value !== null && Number(p.min_value) > Number(p.max_value)) {
          setErrorMsg(`Participant '${p.name}' has minimum acceptable value ($${p.min_value}) greater than maximum ($${p.max_value}).`);
          return false;
        }
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 7));
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const constructPayload = () => {
    return {
      name: name.trim(),
      category,
      description: description.trim(),
      max_rounds: Number(maxRounds),
      mode,
      participants: participants.map((p) => ({
        name: p.name.trim(),
        role: p.role.trim(),
        personality: p.personality,
        objective: p.objective.trim(),
        secondary_objective: p.secondary_objective ? p.secondary_objective.trim() : null,
        min_value: p.min_value !== "" && p.min_value !== null ? Number(p.min_value) : null,
        max_value: p.max_value !== "" && p.max_value !== null ? Number(p.max_value) : null
      })),
      variables: variables.filter((v) => v.name.trim()).map((v) => ({
        name: v.name.trim(),
        type: v.type,
        starting_value: v.starting_value,
        min_value: v.min_value ? Number(v.min_value) : null,
        max_value: v.max_value ? Number(v.max_value) : null,
        importance: v.importance || "Medium"
      })),
      objectives: {
        participants: participants.map((p) => ({
          role: p.role,
          primary: p.objective,
          secondary: p.secondary_objective
        }))
      },
      constraints: {
        participant_constraints: participants.map((p) => ({
          role: p.role,
          min_value: p.min_value,
          max_value: p.max_value
        }))
      }
    };
  };

  const handleSaveDraft = async () => {
    if (!validateStep(1) || !validateStep(2)) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = constructPayload();
      let saved;
      if (editingScenario?.id) {
        saved = await updateCustomScenario(editingScenario.id, payload);
      } else {
        saved = await createCustomScenario(payload);
      }
      onSaveSuccess?.(saved);
      onClose?.();
    } catch (err) {
      setErrorMsg(err.message || "Failed to save custom scenario.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNegotiationSubmit = async () => {
    if (!validateStep(1) || !validateStep(2)) return;
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const payload = constructPayload();
      let saved;
      if (editingScenario?.id) {
        saved = await updateCustomScenario(editingScenario.id, payload);
      } else {
        saved = await createCustomScenario(payload);
      }

      // Convert custom scenario to standard engine scenario format
      const fullScenario = {
        scenario_id: saved.id || saved.scenario_id,
        scenario_name: saved.name || saved.scenario_name,
        name: saved.name || saved.scenario_name,
        description: saved.description,
        category: saved.category,
        isCustom: true,
        participants: saved.participants.map((p) => p.role),
        agents: (saved.agents && saved.agents.length >= 2) ? saved.agents : saved.participants.map((p, i) => ({
          id: p.role.toLowerCase().replace(/\s+/g, "_"),
          name: p.name,
          role: p.role,
          persona: p.personality || "Collaborative",
          goal: p.objective,
          constraints: [
            ...(p.max_value ? [{ text: `Maximum $${Number(p.max_value).toLocaleString()}`, defaultValue: p.max_value }] : []),
            ...(p.min_value ? [{ text: `Minimum $${Number(p.min_value).toLocaleString()}`, defaultValue: p.min_value }] : [])
          ],
          personality: p.personality || "Collaborative"
        }))
      };

      onStartNegotiation?.(fullScenario, mode, humanRole || (mode === "practice" ? fullScenario.agents[0].role : null), Number(maxRounds));
      onClose?.();
    } catch (err) {
      setErrorMsg(err.message || "Failed to start custom negotiation.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 backdrop-blur-md overflow-y-auto">
      <div className={`w-full max-w-4xl rounded-2xl border p-5 sm:p-8 shadow-2xl transition-all my-auto max-h-[92vh] flex flex-col ${isDark ? "border-[#2A2935] bg-[#121118] text-white" : "border-slate-300 bg-white text-slate-900"}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 border-white/10">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Custom Scenario Builder
            </span>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {editingScenario ? "Edit Custom Scenario" : "Create New Negotiation Scenario"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Step Progress Indicator (1 ── 2 ── 3 ── 4 ── 5 ── 6 ── 7) */}
        <div className="my-5 overflow-x-auto py-2">
          <div className="flex items-center justify-between min-w-[500px]">
            {[
              "Basic Info",
              "Participants",
              "Variables",
              "Objectives",
              "Constraints",
              "Mode",
              "Review & Start"
            ].map((label, i) => {
              const stepNum = i + 1;
              const isActive = step === stepNum;
              const isPast = step > stepNum;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div
                    onClick={() => validateStep(step) && setStep(stepNum)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold cursor-pointer transition ${
                      isActive
                        ? "bg-emerald-500 text-black shadow-[0_0_12px_rgba(16,185,129,0.5)]"
                        : isPast
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-500/50"
                        : "bg-white/5 text-slate-500 border border-white/10"
                    }`}
                  >
                    {isPast ? "✓" : stepNum}
                  </div>
                  <span className={`text-[11px] font-medium whitespace-nowrap ${isActive ? "text-emerald-400 font-bold" : isPast ? "text-slate-300" : "text-slate-500"}`}>
                    {label}
                  </span>
                  {i < 6 && <div className={`h-[1px] w-6 sm:w-10 mx-1 ${isPast ? "bg-emerald-500/60" : "bg-white/10"}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 text-xs text-rose-300 font-medium flex items-center justify-between">
            <span>⚠️ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-rose-400 hover:text-white font-bold ml-2">✕</button>
          </div>
        )}

        {/* Wizard Form Body */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-6">
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Scenario Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Commercial Lease Renewal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#1A1924] px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain the background context, goals, and stakes of this negotiation..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Maximum Negotiation Rounds *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={maxRounds}
                    onChange={(e) => setMaxRounds(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Number of Participants
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${participants.length} Participants Configured`}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Participants */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Configure at least 2 negotiators with custom roles, personalities, and financial boundaries.
                </p>
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                >
                  + Add Participant
                </button>
              </div>

              <div className="space-y-4">
                {participants.map((p, idx) => (
                  <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">
                        Participant #{idx + 1}
                      </span>
                      {participants.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveParticipant(idx)}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Name</label>
                        <input
                          type="text"
                          value={p.name}
                          onChange={(e) => handleUpdateParticipant(idx, "name", e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Role Title</label>
                        <input
                          type="text"
                          value={p.role}
                          onChange={(e) => handleUpdateParticipant(idx, "role", e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Personality Policy</label>
                        <select
                          value={p.personality}
                          onChange={(e) => handleUpdateParticipant(idx, "personality", e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-[#1A1924] px-3 py-1.5 text-xs text-white"
                        >
                          {PERSONALITIES.map((pers) => (
                            <option key={pers} value={pers}>{pers}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1">Primary Objective *</label>
                      <input
                        type="text"
                        placeholder="e.g. Secure lowest possible unit price"
                        value={p.objective}
                        onChange={(e) => handleUpdateParticipant(idx, "objective", e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Minimum Floor Limit ($)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 42000"
                          value={p.min_value ?? ""}
                          onChange={(e) => handleUpdateParticipant(idx, "min_value", e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">
                          Maximum Ceiling Limit ($)
                        </label>
                        <input
                          type="number"
                          placeholder="e.g. 50000"
                          value={p.max_value ?? ""}
                          onChange={(e) => handleUpdateParticipant(idx, "max_value", e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Variables */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Define terms to be negotiated (Price, Budget, Warranty, Delivery Timeline, etc.).
                </p>
                <button
                  type="button"
                  onClick={handleAddVariable}
                  className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:bg-emerald-500/20"
                >
                  + Add Variable
                </button>
              </div>

              {variables.map((v, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
                  <input
                    type="text"
                    placeholder="Variable Name (e.g. Unit Price)"
                    value={v.name}
                    onChange={(e) => handleUpdateVariable(idx, "name", e.target.value)}
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
                  />
                  <select
                    value={v.type}
                    onChange={(e) => handleUpdateVariable(idx, "type", e.target.value)}
                    className="rounded-lg border border-white/10 bg-[#1A1924] px-3 py-1.5 text-xs text-white"
                  >
                    {VARIABLE_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Starting Value"
                    value={v.starting_value ?? ""}
                    onChange={(e) => handleUpdateVariable(idx, "starting_value", e.target.value)}
                    className="w-28 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveVariable(idx)}
                    className="text-xs text-rose-400 hover:underline"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: Objectives */}
          {step === 4 && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Review and refine primary and secondary objectives for each negotiator.
              </p>
              {participants.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                  <h4 className="text-sm font-bold text-emerald-400">{p.name} ({p.role})</h4>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Primary Objective</label>
                    <input
                      type="text"
                      value={p.objective}
                      onChange={(e) => handleUpdateParticipant(idx, "objective", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Secondary Objective (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Include 12-month free maintenance support"
                      value={p.secondary_objective || ""}
                      onChange={(e) => handleUpdateParticipant(idx, "secondary_objective", e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 5: Constraints */}
          {step === 5 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <h4 className="text-sm font-bold text-emerald-300">🛡️ Backend Constraint Guardrails</h4>
                <p className="text-xs text-emerald-200/80 mt-1">
                  Constraints defined below are strictly enforced by NegoMind AI engine. Out-of-bound proposals from LLM or human players are automatically validated, clamped, and flagged.
                </p>
              </div>

              {participants.map((p, idx) => (
                <div key={idx} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{p.name} ({p.role})</span>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase">{p.personality}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                      <span className="text-slate-400 text-[10px]">Floor Limit:</span>
                      <p className="font-mono font-bold text-white">{p.min_value ? `$${Number(p.min_value).toLocaleString()}` : "No Floor"}</p>
                    </div>
                    <div className="rounded-lg bg-black/40 p-2 border border-white/5">
                      <span className="text-slate-400 text-[10px]">Ceiling Budget:</span>
                      <p className="font-mono font-bold text-white">{p.max_value ? `$${Number(p.max_value).toLocaleString()}` : "No Ceiling"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* STEP 6: Mode Selection */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Negotiation Mode *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div
                    onClick={() => setMode("simulation")}
                    className={`rounded-xl border p-4 cursor-pointer transition ${mode === "simulation" ? "border-emerald-500 bg-emerald-500/10 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}
                  >
                    <div className="font-bold text-sm text-emerald-400">🤖 Simulation Mode</div>
                    <p className="text-xs text-slate-300 mt-1">Autonomous AI vs AI negotiation between agents.</p>
                  </div>
                  <div
                    onClick={() => setMode("practice")}
                    className={`rounded-xl border p-4 cursor-pointer transition ${mode === "practice" ? "border-emerald-500 bg-emerald-500/10 text-white" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}
                  >
                    <div className="font-bold text-sm text-emerald-400">👤 Practice Mode</div>
                    <p className="text-xs text-slate-300 mt-1">Interactive Human vs AI practice arena.</p>
                  </div>
                </div>
              </div>

              {mode === "practice" && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Select Your Human Negotiator Role
                  </label>
                  <select
                    value={humanRole}
                    onChange={(e) => setHumanRole(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#1A1924] px-4 py-2.5 text-sm text-white"
                  >
                    <option value="">Select Role...</option>
                    {participants.map((p) => (
                      <option key={p.role} value={p.role}>{p.name} ({p.role})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* STEP 7: Review & Start */}
          {step === 7 && (
            <div className="space-y-5">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <h3 className="text-base font-black text-emerald-300">SCENARIO REVIEW SUMMARY</h3>
                <p className="text-xs text-emerald-200/80">Review scenario parameters before launching in Arena.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="text-slate-400 text-[10px]">SCENARIO</span>
                  <p className="font-bold text-white truncate">{name}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="text-slate-400 text-[10px]">CATEGORY</span>
                  <p className="font-bold text-emerald-400">{category}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="text-slate-400 text-[10px]">PARTICIPANTS</span>
                  <p className="font-bold text-white">{participants.length} Players</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
                  <span className="text-slate-400 text-[10px]">MAX ROUNDS</span>
                  <p className="font-bold text-white">{maxRounds} Rounds</p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Configured Negotiators</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {participants.map((p, idx) => (
                    <div key={idx} className="rounded-lg bg-black/40 p-3 border border-white/5 text-xs">
                      <div className="font-bold text-white">{p.name} ({p.role})</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Policy: <span className="text-emerald-400 font-bold">{p.personality}</span></div>
                      <div className="text-[11px] text-slate-300 mt-1">Goal: {p.objective}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between border-t pt-4 border-white/10 mt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10 transition"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : "Save Draft"}
            </button>

            {step < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-emerald-500 px-5 py-2 text-xs font-bold text-black shadow-lg hover:bg-emerald-400 transition"
              >
                Next →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartNegotiationSubmit}
                disabled={isSubmitting}
                className="rounded-xl bg-emerald-400 px-5 py-2 text-xs font-black text-black shadow-[0_0_20px_rgba(52,211,153,0.5)] hover:bg-emerald-300 transition disabled:opacity-50"
              >
                🚀 Start Negotiation
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
