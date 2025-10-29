import EventEmitter from 'eventemitter3';

/**
 * Event types for the Auto Cursor system
 */
export enum EventType {
  // System events
  SYSTEM_INIT = 'system.init',
  SYSTEM_ERROR = 'system.error',

  // Purpose and project events
  PURPOSE_SELECTED = 'purpose.selected',
  PROJECT_REALIGN = 'project.realign',
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',

  // Agent lifecycle events
  AGENT_CREATED = 'agent.created',
  AGENT_STARTED = 'agent.started',
  AGENT_COMPLETED = 'agent.completed',
  AGENT_FAILED = 'agent.failed',

  // Workflow phase events
  PHASE_REQUIREMENTS_START = 'phase.requirements.start',
  PHASE_REQUIREMENTS_COMPLETE = 'phase.requirements.complete',
  PHASE_ARCHITECTURE_START = 'phase.architecture.start',
  PHASE_ARCHITECTURE_COMPLETE = 'phase.architecture.complete',
  PHASE_DEVELOPMENT_START = 'phase.development.start',
  PHASE_DEVELOPMENT_COMPLETE = 'phase.development.complete',
  PHASE_TESTING_START = 'phase.testing.start',
  PHASE_TESTING_COMPLETE = 'phase.testing.complete',
  PHASE_DEVOPS_START = 'phase.devops.start',
  PHASE_DEVOPS_COMPLETE = 'phase.devops.complete',
  PHASE_DOCUMENTATION_START = 'phase.documentation.start',
  PHASE_DOCUMENTATION_COMPLETE = 'phase.documentation.complete',

  // User interaction events
  USER_MESSAGE = 'user.message',
  LEAD_RESPONSE = 'lead.response',

  // Memory events
  MEMORY_SAVE = 'memory.save',
  MEMORY_LOAD = 'memory.load',
}

/**
 * Base event payload interface
 */
export interface EventPayload {
  timestamp: number;
  source?: string;
  metadata?: Record<string, any>;
}

/**
 * Purpose selection payload
 */
export interface PurposeSelectedPayload extends EventPayload {
  purposeId: string;
  purposeName: string;
  userMessage: string;
}

/**
 * Agent event payload
 */
export interface AgentEventPayload extends EventPayload {
  agentId: string;
  agentRole: string;
  data?: any;
  error?: Error;
}

/**
 * Phase event payload
 */
export interface PhaseEventPayload extends EventPayload {
  phase: string;
  result?: any;
  artifacts?: Record<string, any>;
}

/**
 * User message payload
 */
export interface UserMessagePayload extends EventPayload {
  message: string;
  sessionId: string;
}

/**
 * Lead response payload
 */
export interface LeadResponsePayload extends EventPayload {
  message: string;
  sessionId: string;
  internalSummary?: string;
}

/**
 * EventBus - Central pub/sub system for inter-agent communication
 */
export class EventBus {
  private emitter: EventEmitter;
  private eventHistory: Array<{ event: string; payload: EventPayload }> = [];
  private maxHistorySize = 1000;

  constructor() {
    this.emitter = new EventEmitter();
  }

  /**
   * Subscribe to an event
   */
  on<T extends EventPayload>(
    event: EventType | string,
    handler: (payload: T) => void | Promise<void>
  ): void {
    this.emitter.on(event, handler);
  }

  /**
   * Subscribe to an event (one-time)
   */
  once<T extends EventPayload>(
    event: EventType | string,
    handler: (payload: T) => void | Promise<void>
  ): void {
    this.emitter.once(event, handler);
  }

  /**
   * Unsubscribe from an event
   */
  off<T extends EventPayload>(
    event: EventType | string,
    handler: (payload: T) => void | Promise<void>
  ): void {
    this.emitter.off(event, handler);
  }

  /**
   * Emit an event
   */
  emit<T extends EventPayload>(event: EventType | string, payload: T): void {
    // Add timestamp if not present
    if (!payload.timestamp) {
      payload.timestamp = Date.now();
    }

    // Store in history
    this.addToHistory(event, payload);

    // Emit the event
    this.emitter.emit(event, payload);
  }

  /**
   * Wait for a specific event
   */
  async waitFor<T extends EventPayload>(
    event: EventType | string,
    timeout?: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = timeout
        ? setTimeout(() => {
            this.off(event, handler);
            reject(new Error(`Timeout waiting for event: ${event}`));
          }, timeout)
        : null;

      const handler = (payload: T) => {
        if (timer) clearTimeout(timer);
        resolve(payload);
      };

      this.once(event, handler);
    });
  }

  /**
   * Get event history
   */
  getHistory(filterEvent?: EventType | string): Array<{ event: string; payload: EventPayload }> {
    if (filterEvent) {
      return this.eventHistory.filter((entry) => entry.event === filterEvent);
    }
    return [...this.eventHistory];
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory = [];
  }

  /**
   * Add event to history
   */
  private addToHistory(event: string, payload: EventPayload): void {
    this.eventHistory.push({ event, payload });

    // Maintain max history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.emitter.removeAllListeners();
  }
}

// Singleton instance
export const eventBus = new EventBus();

