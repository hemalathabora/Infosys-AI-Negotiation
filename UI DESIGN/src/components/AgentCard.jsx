import { useState } from "react";
import AgentHeader, { AgentIdentity } from "./AgentHeader";
import GoalSection from "./GoalSection";
import ConstraintList from "./ConstraintList";
import PersonalityBadge from "./PersonalityBadge";

/**
 * Agent configuration card.
 *
 * Personality and constraints are controlled by the parent
 * AgentConfiguration / useScenarioConfiguration state.
 *
 * This is important because the final selected agent configuration
 * must be passed into the NegotiationState and then to the Orchestrator.
 *
 * @param {{
 *   agent: import("../types/negotiation").Agent,
 *   index: number,
 *   onConstraintChange?: (agentId: string, constraintIndex: number, nextValue: string) => void,
 *   onPersonalityChange?: (agentId: string, nextPersonality: string) => void
 * }} props
 */
export default function AgentCard({
  agent,
  index,
  onConstraintChange,
  onPersonalityChange,
}) {
  /**
   * The parent owns the actual personality value.
   *
   * We intentionally do NOT keep personality in local component state.
   *
   * Flow:
   *
   * PersonalityBadge
   *       ↓
   * AgentCard
   *       ↓
   * onPersonalityChange
   *       ↓
   * AgentConfiguration
   *       ↓
   * selectedScenario.agents
   *       ↓
   * NegotiationState
   *       ↓
   * Orchestrator
   */
  const personality = agent.personality;

  const isConfigured = Boolean(
    agent.name &&
      agent.role &&
      agent.goal &&
      agent.constraints?.length &&
      personality,
  );

  /**
   * Sends constraint changes to the parent.
   */
  const handleConstraintChange = (constraintIndex, nextValue) => {
    onConstraintChange?.(
      agent.id,
      constraintIndex,
      nextValue,
    );
  };

  /**
   * Sends personality changes to the parent.
   *
   * This is the important Milestone 1 integration change.
   */
  const handlePersonalityChange = (nextPersonality) => {
    onPersonalityChange?.(
      agent.id,
      nextPersonality,
    );
  };

  return (
    <article
      className="animate-fadeIn flex flex-col gap-5 rounded-2xl border border-[#2D2C36] bg-[#201F25] p-5 sm:p-6 shadow-md transition-all hover:border-[#3E3D49]"
      aria-labelledby={`agent-${agent.id}-name`}
    >
      {/* Agent number / header */}
      <AgentHeader index={index} />

      {/* Agent name and role */}
      <AgentIdentity
        name={agent.name}
        role={agent.role}
        headingId={`agent-${agent.id}-name`}
      />

      <div className="h-px w-full bg-[#2B2A33]" />

      {/* Agent goal */}
      <GoalSection goal={agent.goal} />

      {/* Agent constraints */}
      <ConstraintList
        constraints={agent.constraints}
        onChange={handleConstraintChange}
      />

      {/* Agent personality */}
      <PersonalityBadge
        personality={personality}
        onChange={handlePersonalityChange}
      />

      <div className="h-px w-full bg-[#2B2A33]" />

      {/* Configuration status */}
      <div className="flex items-center gap-2 text-sm">
        {isConfigured ? (
          <>
            <span
              className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20 text-success"
              aria-hidden="true"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M5 12.5l4.5 4.5L19 7.5"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <span className="font-semibold text-success">
              Configured
            </span>
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
