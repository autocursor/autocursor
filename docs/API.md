# Auto Cursor API Reference

Complete API documentation for Auto Cursor.

## Table of Contents

- [Core Classes](#core-classes)
- [Agents](#agents)
- [Event System](#event-system)
- [Memory Store](#memory-store)
- [Registry](#registry)
- [Types](#types)

## Core Classes

### `AutoCursor`

Main plugin class for initializing and managing the system.

#### Methods

##### `initialize(): Promise<void>`

Initialize the Auto Cursor system.

```typescript
import { autoCursor } from 'autocursor';

await autoCursor.initialize();
```

##### `getLeadAgent(): LeadAgent`

Get the Lead Agent instance for user interaction.

```typescript
const leadAgent = autoCursor.getLeadAgent();
```

##### `getCurrentProject(): ProjectContext | null`

Get the current active project.

```typescript
const project = autoCursor.getCurrentProject();
if (project) {
  console.log(project.purposeName);
}
```

##### `getPurposes(): Purpose[]`

Get all available project purposes.

```typescript
const purposes = autoCursor.getPurposes();
purposes.forEach(p => console.log(p.name));
```

##### `getStatistics(): object`

Get system statistics.

```typescript
const stats = autoCursor.getStatistics();
// { projects: 5, agents: {...}, purposes: 8 }
```

##### `shutdown(): Promise<void>`

Cleanup and shutdown the system.

```typescript
await autoCursor.shutdown();
```

---

## Agents

### `LeadAgent`

User-facing agent that handles all user interactions.

#### Constructor

```typescript
const leadAgent = new LeadAgent();
```

#### Methods

##### `execute(input: AgentInput): Promise<AgentOutput>`

Process user input and return response.

```typescript
const result = await leadAgent.execute({
  userMessage: "I want to build a web app",
  projectContext: currentProject
});

console.log(result.message); // Response to user
```

### `BaseAgent`

Abstract base class for all agents.

#### Methods

##### `getName(): string`

Get agent name.

##### `getSystemPrompt(): string`

Get agent's system prompt.

##### `setSystemPrompt(prompt: string): void`

Update agent's system prompt.

---

## Event System

### `EventBus`

Central pub/sub system for inter-component communication.

#### Methods

##### `on<T>(event: EventType, handler: (payload: T) => void): void`

Subscribe to an event.

```typescript
import { eventBus, EventType } from 'autocursor';

eventBus.on(EventType.PURPOSE_SELECTED, (payload) => {
  console.log(`Purpose: ${payload.purposeName}`);
});
```

##### `once<T>(event: EventType, handler: (payload: T) => void): void`

Subscribe to an event (one-time).

```typescript
eventBus.once(EventType.PROJECT_CREATED, (payload) => {
  console.log('Project created!');
});
```

##### `off<T>(event: EventType, handler: (payload: T) => void): void`

Unsubscribe from an event.

```typescript
const handler = (payload) => console.log(payload);
eventBus.on(EventType.USER_MESSAGE, handler);
// Later...
eventBus.off(EventType.USER_MESSAGE, handler);
```

##### `emit<T>(event: EventType, payload: T): void`

Emit an event.

```typescript
eventBus.emit(EventType.USER_MESSAGE, {
  timestamp: Date.now(),
  message: "Hello",
  sessionId: "123"
});
```

##### `waitFor<T>(event: EventType, timeout?: number): Promise<T>`

Wait for a specific event.

```typescript
const payload = await eventBus.waitFor(
  EventType.PHASE_REQUIREMENTS_COMPLETE,
  5000 // 5 second timeout
);
```

##### `getHistory(filterEvent?: EventType): Array<{event: string, payload: EventPayload}>`

Get event history.

```typescript
const allEvents = eventBus.getHistory();
const purposeEvents = eventBus.getHistory(EventType.PURPOSE_SELECTED);
```

### Event Types

```typescript
enum EventType {
  // System
  SYSTEM_INIT = 'system.init',
  SYSTEM_ERROR = 'system.error',
  
  // Purpose and project
  PURPOSE_SELECTED = 'purpose.selected',
  PROJECT_REALIGN = 'project.realign',
  PROJECT_CREATED = 'project.created',
  
  // Agent lifecycle
  AGENT_CREATED = 'agent.created',
  AGENT_STARTED = 'agent.started',
  AGENT_COMPLETED = 'agent.completed',
  AGENT_FAILED = 'agent.failed',
  
  // Workflow phases
  PHASE_REQUIREMENTS_START = 'phase.requirements.start',
  PHASE_REQUIREMENTS_COMPLETE = 'phase.requirements.complete',
  PHASE_ARCHITECTURE_START = 'phase.architecture.start',
  PHASE_ARCHITECTURE_COMPLETE = 'phase.architecture.complete',
  // ... and more
  
  // User interaction
  USER_MESSAGE = 'user.message',
  LEAD_RESPONSE = 'lead.response',
}
```

---

## Memory Store

### `MemoryStore`

Persistent storage for project context and artifacts.

#### Methods

##### `createProject(purposeId: string, purposeName: string, techStack: TechStack): ProjectContext`

Create a new project.

```typescript
import { memoryStore } from 'autocursor';

const project = memoryStore.createProject(
  'web-development',
  'Web Development',
  {
    backend: ['Go'],
    frontend: ['React'],
    database: ['PostgreSQL']
  }
);
```

##### `getCurrentProject(): ProjectContext | null`

Get current active project.

##### `getProject(projectId: string): ProjectContext | null`

Get project by ID.

##### `updateProjectStatus(projectId: string, status: ProjectStatus): void`

Update project status.

##### `updatePhase(projectId: string, phaseName: string, phaseData: Partial<PhaseData>): void`

Update phase data.

##### `storeArtifact(projectId: string, artifactKey: string, artifactData: any): void`

Store an artifact.

```typescript
memoryStore.storeArtifact(project.id, 'architecture', architectureDoc);
```

##### `getArtifact(projectId: string, artifactKey: string): any`

Get an artifact.

```typescript
const architecture = memoryStore.getArtifact(project.id, 'architecture');
```

##### `addConversation(projectId: string, role: 'user' | 'lead' | 'system', message: string): void`

Add conversation entry.

##### `getConversationHistory(projectId: string): ConversationEntry[]`

Get conversation history.

---

## Registry

### `PurposeRegistry`

Registry for project purposes and tech stacks.

#### Methods

##### `register(purpose: Purpose): void`

Register a new purpose.

```typescript
import { purposeRegistry } from 'autocursor';

purposeRegistry.register({
  id: 'custom-purpose',
  name: 'Custom Purpose',
  description: 'My custom project type',
  category: 'Web',
  techStack: { /* ... */ },
  agentRoles: [/* ... */],
  prompts: { /* ... */ }
});
```

##### `get(purposeId: string): Purpose | undefined`

Get purpose by ID.

##### `getAll(): Purpose[]`

Get all purposes.

##### `getByCategory(category: string): Purpose[]`

Get purposes by category.

##### `search(query: string): Purpose[]`

Search purposes.

##### `getCategories(): string[]`

Get all categories.

---

## Types

### `AgentInput`

```typescript
interface AgentInput {
  projectContext?: any;
  previousPhaseResults?: any;
  userMessage?: string;
  metadata?: Record<string, any>;
}
```

### `AgentOutput`

```typescript
interface AgentOutput {
  success: boolean;
  result?: any;
  artifacts?: Record<string, any>;
  message?: string;
  error?: Error;
}
```

### `ProjectContext`

```typescript
interface ProjectContext {
  id: string;
  purposeId: string;
  purposeName: string;
  techStack: TechStack;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
  phases: Record<string, PhaseData>;
  artifacts: Record<string, any>;
  conversationHistory: ConversationEntry[];
  metadata: Record<string, any>;
}
```

### `Purpose`

```typescript
interface Purpose {
  id: string;
  name: string;
  description: string;
  category: string;
  techStack: TechStack;
  agentRoles: AgentRole[];
  prompts: {
    [key in AgentRole]?: string;
  };
  templates?: string[];
  defaultStructure?: ProjectStructure;
}
```

### `TechStack`

```typescript
interface TechStack {
  backend?: string[];
  frontend?: string[];
  database?: string[];
  infrastructure?: string[];
  testing?: string[];
  other?: string[];
}
```

### `ProjectStatus`

```typescript
enum ProjectStatus {
  INITIALIZING = 'initializing',
  REQUIREMENTS = 'requirements',
  ARCHITECTURE = 'architecture',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  DEVOPS = 'devops',
  DOCUMENTATION = 'documentation',
  COMPLETED = 'completed',
  FAILED = 'failed',
}
```

### `AgentRole`

```typescript
enum AgentRole {
  LEAD = 'lead',
  REQUIREMENTS = 'requirements',
  ARCHITECT = 'architect',
  BACKEND = 'backend',
  FRONTEND = 'frontend',
  MOBILE = 'mobile',
  GAME = 'game',
  TESTER = 'tester',
  DEVOPS = 'devops',
  DOCS = 'docs',
  SUMMARIZER = 'summarizer',
}
```

---

## Examples

### Complete Example

```typescript
import { 
  autoCursor, 
  eventBus, 
  EventType,
  memoryStore 
} from 'autocursor';

async function main() {
  // Initialize
  await autoCursor.initialize();
  
  // Listen for events
  eventBus.on(EventType.PURPOSE_SELECTED, (payload) => {
    console.log('Purpose:', payload.purposeName);
  });
  
  eventBus.on(EventType.PROJECT_CREATED, () => {
    const project = memoryStore.getCurrentProject();
    console.log('Project ID:', project?.id);
  });
  
  // Get lead agent
  const leadAgent = autoCursor.getLeadAgent();
  
  // Process user message
  const result = await leadAgent.execute({
    userMessage: "Build a web application"
  });
  
  console.log(result.message);
  
  // Get project details
  const project = autoCursor.getCurrentProject();
  if (project) {
    console.log('Tech Stack:', project.techStack);
    console.log('Status:', project.status);
  }
  
  // Cleanup
  await autoCursor.shutdown();
}

main();
```

---

For more examples, see the [examples](../examples/) directory.

