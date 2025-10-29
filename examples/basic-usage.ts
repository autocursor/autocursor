/**
 * Basic usage example of Auto Cursor
 */

import { autoCursor, LeadAgent } from '../src';

async function main() {
  // Initialize Auto Cursor
  console.log('Initializing Auto Cursor...');
  await autoCursor.initialize();

  // Get Lead Agent
  const leadAgent = autoCursor.getLeadAgent();

  // Simulate user wanting to build a web app
  console.log('\n--- User Message ---');
  const userMessage = 'I want to build a task management web application';
  console.log(`User: ${userMessage}`);

  // Process with Lead Agent
  const result = await leadAgent.execute({ userMessage });

  console.log('\n--- Lead Agent Response ---');
  console.log(`Auto Cursor: ${result.message}`);

  // Get current project
  const project = autoCursor.getCurrentProject();
  if (project) {
    console.log('\n--- Project Info ---');
    console.log(`Purpose: ${project.purposeName}`);
    console.log(`Status: ${project.status}`);
    console.log(`Tech Stack:`, project.techStack);
  }

  // Get statistics
  const stats = autoCursor.getStatistics();
  console.log('\n--- System Statistics ---');
  console.log(JSON.stringify(stats, null, 2));

  // Shutdown
  await autoCursor.shutdown();
}

main().catch(console.error);

