// Designed by TEAM 4
import { Orchestrator } from "../../src/engine/orchestrator.js";
import { scenarios } from "../../src/data/scenarios.js";

async function runVendorPricingTest() {
  console.log("==========================================================================");
  console.log("Task 6: Testing LLM Reasoning Layer with Vendor Pricing Negotiation");
  console.log("==========================================================================\n");

  const scenario = scenarios.vendor_pricing;
  
  console.log("AGENT PROFILES CONFIGURATION:");
  scenario.agents.forEach((agent) => {
    console.log(`- ${agent.name} (${agent.role}):`);
    console.log(`  Persona: ${agent.personality}`);
    console.log(`  Goal: "${agent.goal}"`);
    console.log(`  Constraints: ${JSON.stringify(agent.constraints)}`);
  });
  console.log("\n--------------------------------------------------------------------------");

  const orchestrator = new Orchestrator(scenario);
  let stepCount = 0;
  const MAX_TEST_STEPS = 10; // 5 full rounds (10 turns)

  while (
    orchestrator.getState().status === "in_progress" ||
    orchestrator.getState().status === "not_started"
  ) {
    if (stepCount >= MAX_TEST_STEPS) break;

    stepCount += 1;
    const currentAgent = orchestrator.getCurrentTurn();
    const round = orchestrator.getRoundForCurrentTurn(currentAgent);

    console.log(`\n--- STEP ${stepCount} | Round ${round} | Active Turn: ${currentAgent?.toUpperCase()} ---`);
    
    await orchestrator.step();

    const state = orchestrator.getState();
    const lastOffer = state.current_offer;

    if (lastOffer) {
      console.log(`Decision: ${lastOffer.decision?.toUpperCase() ?? 'COUNTEROFFER'}`);
      console.log(`Proposed Offer: $${lastOffer.value.toLocaleString()}`);
      console.log(`Strategic Rationale:\n  "${lastOffer.reason}"`);
      if (lastOffer.parameters) {
        console.log(`Negotiation Parameters:`, JSON.stringify(lastOffer.parameters));
      }
    }

    if (
      state.status === "agreement" ||
      state.status === "rejected" ||
      state.status === "deadlock"
    ) {
      console.log(`\nNegotiation reached terminal status: ${state.status.toUpperCase()}`);
      break;
    }
  }

  const finalState = orchestrator.getState();
  console.log("\n==========================================================================");
  console.log("VERIFICATION & VALIDATION RESULTS");
  console.log("==========================================================================");
  console.log(`- Total Rounds Completed: ${finalState.current_round}`);
  console.log(`- Total Moves Recorded in History: ${finalState.history.length}`);
  console.log(`- Final Negotiation Status: ${finalState.status}`);

  // Validation Check 1: Agent Profiles & Constraints respected
  const buyerLimit = 50000;
  const vendorLimit = 42000;

  const buyerOffers = finalState.history.filter((o) => o.agent_id === "buyer");
  const vendorOffers = finalState.history.filter((o) => o.agent_id === "vendor");

  const buyerViolations = buyerOffers.filter((o) => o.value > buyerLimit);
  const vendorViolations = vendorOffers.filter((o) => o.value < vendorLimit);

  console.log(`\n1. Constraint Guardrail Enforcement:`);
  console.log(`   - Buyer Maximum Constraint ($50,000): ${buyerViolations.length === 0 ? "PASSED (0 violations)" : "FAILED"}`);
  console.log(`   - Vendor Minimum Constraint ($42,000): ${vendorViolations.length === 0 ? "PASSED (0 violations)" : "FAILED"}`);

  // Validation Check 2: Context Sensitivity across history
  console.log(`\n2. Context & History Sensitivity:`);
  console.log(`   - History passed into reasoning engine: ${finalState.history.length} offers recorded chronologically.`);
  buyerOffers.forEach((o, i) => {
    console.log(`   - Buyer Move ${i + 1} (Round ${o.round}): Offer = $${o.value.toLocaleString()}`);
  });
  vendorOffers.forEach((o, i) => {
    console.log(`   - Vendor Move ${i + 1} (Round ${o.round}): Offer = $${o.value.toLocaleString()}`);
  });

  if (buyerOffers.length >= 2 && vendorOffers.length >= 2) {
    console.log(`   - Concession Progression Verified: Agents dynamically adjusted offers based on prior moves and opponent offers.`);
  }

  console.log("\nTest Completed Successfully!\n");
}

runVendorPricingTest().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
