import { useState } from "react";
import AgentHeader, { AgentIdentity } from "./AgentHeader";
import GoalSection from "./GoalSection";
import ConstraintList from "./ConstraintList";
import PersonalityBadge from "./PersonalityBadge";

export default function AgentCard({ agent, index, onConstraintChange }) {
  const [personality, setPersonality] = useState(agent.personality);

  const isConfigured = Boolean(
    agent.name &&
    agent.role &&
    agent.goal &&
    agent.constraints?.length &&
    personality,
  );

  const handleConstraintChange = (constraintIndex, nextValue) => {
    onConstraintChange?.(agent.id, constraintIndex, nextValue);
  };

  return (
    <article
      className="animate-fadeIn flex flex-col gap-5 rounded-2xl border border-[#2D2C36] bg-[#201F25] p-5 sm:p-6 shadow-md transition-all hover:border-[#3E3D49]"
      aria-labelledby={`agent-${agent.id}-name`}
    >
      <AgentHeader index={index} />
      <AgentIdentity
        name={agent.name}
        role={agent.role}
        headingId={`agent-${agent.id}-name`}
      />

      <div className="h-px w-full bg-[#2B2A33]" />

      <GoalSection goal={agent.goal} />

      <ConstraintList
        constraints={agent.constraints}
        onChange={handleConstraintChange}
      />

      <PersonalityBadge personality={personality} onChange={setPersonality} />

      <div className="h-px w-full bg-[#2B2A33]" />

      <div className="flex items-center gap-2 text-xs font-mono">
        {isConfigured ? (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-emerald-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="font-semibold">CONFIGURATION COMPLETE</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 px-3 py-1 text-amber-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="font-semibold">INCOMPLETE CONFIGURATION</span>
          </div>
        )}
      </div>
    </article>
  );
}
