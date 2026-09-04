import { useState } from "react";
import AgentHeader, { AgentIdentity } from "./AgentHeader";
import GoalSection from "./GoalSection";
import ConstraintList from "./ConstraintList";
import PersonalityBadge from "./PersonalityBadge";

export default function AgentCard({
  agent,
  index,
  onConstraintChange,
  onPersonalityChange,
}) {
  const personality = agent.personality;

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

  const handlePersonalityChange = (nextPersonality) => {
    onPersonalityChange?.(agent.id, nextPersonality);
  };

  return (
    <article
      className="animate-fadeIn flex h-full flex-col justify-between gap-6 rounded-2xl border border-[#2D2C36] bg-[#201F25] p-6 shadow-md transition-all hover:border-[#3E3D49]"
      aria-labelledby={`agent-${agent.id}-name`}
    >
      <div className="space-y-5">
        {/* Agent header & Identity */}
        <div className="space-y-4">
          <AgentHeader index={index} />
          <AgentIdentity
            name={agent.name}
            role={agent.role}
            headingId={`agent-${agent.id}-name`}
          />
        </div>

        <div className="h-px w-full bg-[#2B2A33]" />

        {/* Goal */}
        <GoalSection goal={agent.goal} />

        {/* Constraints */}
        <ConstraintList
          constraints={agent.constraints}
          onChange={handleConstraintChange}
        />

        {/* Personality Badge */}
        <PersonalityBadge
          personality={personality}
          onChange={handlePersonalityChange}
        />
      </div>

      {/* Bottom Status */}
      <div className="space-y-4 pt-2">
        <div className="h-px w-full bg-[#2B2A33]" />
        <div className="flex items-center gap-2 text-xs font-mono">
          {isConfigured ? (
            <div className="flex w-full items-center justify-between rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-emerald-400">
              <span className="font-bold tracking-wider">CONFIGURED & READY</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          ) : (
            <div className="flex w-full items-center justify-between rounded-xl bg-amber-500/10 border border-amber-500/30 px-3.5 py-2 text-amber-400">
              <span className="font-bold tracking-wider">INCOMPLETE PARAMETERS</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
