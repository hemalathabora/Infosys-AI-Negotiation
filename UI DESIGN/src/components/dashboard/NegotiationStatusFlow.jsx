const steps = [
  { label: "Scenario", done: true },
  { label: "Agent Configuration", done: true },
  { label: "Negotiation", done: true, active: true },
  { label: "Outcome Analysis", done: false },
];

export default function NegotiationStatusFlow() {
  return (
    <div className="rounded-2xl border border-[#1d374d] bg-[#0b1d2d] p-5">
      <h3 className="text-xl font-black text-white">Negotiation Workflow</h3>
      <div className="mt-5 space-y-4">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-3">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs font-bold ${
              step.active
                ? "border-[#c4ff3a] bg-[#c4ff3a] text-[#061018]"
                : step.done
                  ? "border-[#1d374d] bg-[#112d3d] text-[#c4ff3a]"
                  : "border-[#1d374d] bg-[#0d1d2e] text-[#7fa7c0]"
            }`}>
              {step.done && !step.active ? "✓" : index + 1}
            </div>
            <span className={`text-sm font-semibold ${step.active ? "text-white" : step.done ? "text-[#dfeaf5]" : "text-[#7fa7c0]"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
