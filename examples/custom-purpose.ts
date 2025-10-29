/**
 * Example: Registering a custom purpose
 */

import { purposeRegistry, AgentRole } from '../src';

// Register a custom purpose for a Rust backend with React frontend
purposeRegistry.register({
  id: 'rust-web-app',
  name: 'Rust Web Application',
  description: 'High-performance web application with Rust backend',
  category: 'Web',
  techStack: {
    backend: ['Rust', 'Actix-Web', 'Diesel'],
    frontend: ['React', 'TypeScript', 'TailwindCSS'],
    database: ['PostgreSQL'],
    infrastructure: ['Docker', 'Kubernetes'],
    testing: ['cargo test', 'Jest'],
  },
  agentRoles: [
    AgentRole.REQUIREMENTS,
    AgentRole.ARCHITECT,
    AgentRole.BACKEND,
    AgentRole.FRONTEND,
    AgentRole.TESTER,
    AgentRole.DEVOPS,
    AgentRole.DOCS,
    AgentRole.SUMMARIZER,
  ],
  prompts: {
    [AgentRole.BACKEND]: 'rust_backend',
    [AgentRole.FRONTEND]: 'react_frontend',
  },
  defaultStructure: {
    directories: [
      'backend/src',
      'backend/migrations',
      'frontend/src/components',
      'frontend/src/pages',
      'docker',
      'k8s',
    ],
  },
});

console.log('Custom purpose registered!');

// List all purposes including custom
const allPurposes = purposeRegistry.getAll();
console.log('\nAvailable Purposes:');
allPurposes.forEach((purpose) => {
  console.log(`- ${purpose.name} (${purpose.id})`);
});

