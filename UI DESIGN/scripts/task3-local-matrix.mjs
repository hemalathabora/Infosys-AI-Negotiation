import { scenarios } from "../src/data/scenarios.js";
import { Orchestrator } from "../src/engine/orchestrator.js";

const personalities = ["Aggressive", "Collaborative", "Risk-averse"];
const terminalStatuses = new Set([
  "agreement",
  "accepted",
  "rejected",
  "deadlock",
  "breakdown",
  "completed",
  "finished",
]);

let cases = 0;

for (const scenario of Object.values(scenarios)) {
  for (const firstPersonality of personalities) {
    for (const secondPersonality of personalities) {
      const testScenario = structuredClone(scenario);
      testScenario.agents[0].personality = firstPersonality;
      testScenario.agents[1].personality = secondPersonality;

      const engine = new Orchestrator(testScenario);
      let steps = 0;

      while (!terminalStatuses.has(String(engine.getState().status).toLowerCase()) && steps < 20) {
        await engine.step();
        steps += 1;
      }

      const state = engine.getState();
      const hasInvalidOffer = state.history.some((turn) => !Number.isFinite(Number(turn.value)));
      if (steps === 0 || steps >= 20 || state.history.length === 0 || hasInvalidOffer) {
        throw new Error(`${testScenario.scenario_id}:${firstPersonality}/${secondPersonality} did not complete safely`);
      }

      cases += 1;
    }
  }
}

console.log(`Local matrix passed: ${cases} cases`);
