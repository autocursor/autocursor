/**
 * Example: Listening to Auto Cursor events
 */

import { eventBus, EventType, autoCursor } from '../src';

async function main() {
  // Initialize
  await autoCursor.initialize();

  // Listen for purpose selection
  eventBus.on(EventType.PURPOSE_SELECTED, (payload) => {
    console.log(`\n🎯 Purpose Selected: ${payload.purposeName}`);
    console.log(`   User Message: ${payload.userMessage}`);
  });

  // Listen for project creation
  eventBus.on(EventType.PROJECT_CREATED, () => {
    console.log('\n✨ Project Created!');
  });

  // Listen for phase completions
  const phases = [
    EventType.PHASE_REQUIREMENTS_COMPLETE,
    EventType.PHASE_ARCHITECTURE_COMPLETE,
    EventType.PHASE_DEVELOPMENT_COMPLETE,
    EventType.PHASE_TESTING_COMPLETE,
    EventType.PHASE_DEVOPS_COMPLETE,
    EventType.PHASE_DOCUMENTATION_COMPLETE,
  ];

  phases.forEach((phaseEvent) => {
    eventBus.on(phaseEvent, (payload) => {
      console.log(`\n✓ Phase Completed: ${payload.phase}`);
    });
  });

  // Listen for agent events
  eventBus.on(EventType.AGENT_CREATED, (payload) => {
    console.log(`\n🤖 Agent Created: ${payload.agentRole}`);
  });

  eventBus.on(EventType.AGENT_STARTED, (payload) => {
    console.log(`\n▶️  Agent Started: ${payload.agentRole}`);
  });

  eventBus.on(EventType.AGENT_COMPLETED, (payload) => {
    console.log(`\n✅ Agent Completed: ${payload.agentRole}`);
  });

  // Simulate user interaction
  console.log('Starting Auto Cursor with event listeners...\n');
  
  const leadAgent = autoCursor.getLeadAgent();
  await leadAgent.execute({
    userMessage: 'Build me a mobile fitness tracking app for iOS',
  });

  // Wait a bit to see events
  await new Promise((resolve) => setTimeout(resolve, 5000));

  // Cleanup
  await autoCursor.shutdown();
}

main().catch(console.error);

