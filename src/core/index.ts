/**
 * Core module exports
 */

export { EventBus, eventBus, EventType } from './eventBus';
export { MemoryStore, memoryStore, ProjectStatus } from './memoryStore';
export { AgentManager, agentManager, AgentRole } from './agentManager';
export { AutoFlow, autoFlow } from './autoFlow';

export type {
  EventPayload,
  PurposeSelectedPayload,
  AgentEventPayload,
  PhaseEventPayload,
  UserMessagePayload,
  LeadResponsePayload,
} from './eventBus';

export type {
  ProjectContext,
  TechStack,
  PhaseData,
  ConversationEntry,
} from './memoryStore';

export type {
  AgentConfig,
  AgentInstance,
} from './agentManager';

export type {
  WorkflowPhase,
} from './autoFlow';

