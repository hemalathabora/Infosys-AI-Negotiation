// Designed by TEAM 4
import { useState } from "react";
import AgentHeader, { AgentIdentity } from "./AgentHeader";
import GoalSection from "./GoalSection";
import ConstraintList from "./ConstraintList";
import PersonalityBadge from "./PersonalityBadge";

/**
 * @param {{ agent: import('../types/negotiation').Agent, index: number }} props
 */
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
      className="animate-fadeIn flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-cardHover sm:p-6"
      aria-labelledby={`agent-${agent.id}-name`}
    >
      <AgentHeader index={index} />
      <AgentIdentity
        name={agent.name}
        role={agent.role}
        headingId={`agent-${agent.id}-name`}
      />

      <div className="h-px w-full bg-border" />

      <GoalSection goal={agent.goal} />
      <ConstraintList
        constraints={agent.constraints}
        onChange={handleConstraintChange}
      />
      <PersonalityBadge personality={personality} onChange={setPersonality} />

      <div className="h-px w-full bg-border" />

      <div className="flex items-center gap-2 text-sm">
        {isConfigured ? (
          <>
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-success"
              aria-hidden="true"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="font-semibold text-success">Configured</span>
          </>
        ) : (
          <>
            <span className="text-warning" aria-hidden="true">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 4l9 16H3L12 4z"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 9v5M12 17h.01"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            <span className="font-semibold text-warning">
              Incomplete configuration
            </span>
          </>
        )}
      </div>
    </article>
  );
}
// Designed by TEAM 4
// Designed by TEAM 4
