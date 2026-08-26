import { useState } from "react";
import AgentHeader, { AgentIdentity } from "./AgentHeader";
import GoalSection from "./GoalSection";
import ConstraintList from "./ConstraintList";
import PersonalityBadge from "./PersonalityBadge";

/**
 * @param {{ agent: import('../types/negotiation').Agent, index: number }} props
 */
export default function AgentCard({ agent, index }) {
  const [personality, setPersonality] = useState(agent.personality);

  const isConfigured = Boolean(
    agent.name && agent.role && agent.goal && agent.constraints?.length && personality
  );

  return (
    <article
      className="animate-fadeIn flex flex-col gap-5 rounded-2xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-cardHover sm:p-6"
      aria-labelledby={`agent-${agent.id}-name`}
    >
      <AgentHeader index={index} />
      <AgentIdentity
        index={index}
        name={agent.name}
        role={agent.role}
        headingId={`agent-${agent.id}-name`}
      />

      <div className="h-px w-full bg-border" />

      <GoalSection goal={agent.goal} />
      <ConstraintList constraints={agent.constraints} />
      <PersonalityBadge personality={personality} onChange={setPersonality} />

      <div className="h-px w-full bg-border" />

      <div className="flex items-center gap-2 text-sm">
        {isConfigured ? (
          <>
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-success"
              aria-hidden="true"
            >
              ✓
            </span>
            <span className="font-semibold text-success">Configured</span>
          </>
        ) : (
          <>
            <span className="text-warning" aria-hidden="true">⚠</span>
            <span className="font-semibold text-warning">Incomplete configuration</span>
          </>
        )}
      </div>
    </article>
  );
}
