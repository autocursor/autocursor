import { v4 as uuidv4 } from 'uuid';
import { eventBus, EventType, AgentEventPayload } from './eventBus';
import { BaseAgent } from '../agents/base';

/**
 * Agent role types
 */
export enum AgentRole {
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

/**
 * Agent configuration
 */
export interface AgentConfig {
  role: AgentRole;
  capabilities: string[];
  priority: number;
  systemPrompt?: string;
}

/**
 * Agent instance metadata
 */
export interface AgentInstance {
  id: string;
  role: AgentRole;
  agent: BaseAgent;
  config: AgentConfig;
  status: 'idle' | 'working' | 'completed' | 'failed';
  createdAt: number;
}

/**
 * AgentManager - Creates and supervises worker agents dynamically
 */
export class AgentManager {
  private agents: Map<string, AgentInstance> = new Map();
  private agentsByRole: Map<AgentRole, AgentInstance[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Create an agent with specified role and configuration
   */
  createAgent(role: AgentRole, config: AgentConfig, agent: BaseAgent): string {
    const agentId = uuidv4();

    const instance: AgentInstance = {
      id: agentId,
      role,
      agent,
      config,
      status: 'idle',
      createdAt: Date.now(),
    };

    this.agents.set(agentId, instance);

    // Track by role
    if (!this.agentsByRole.has(role)) {
      this.agentsByRole.set(role, []);
    }
    this.agentsByRole.get(role)?.push(instance);

    // Emit agent created event
    eventBus.emit<AgentEventPayload>(EventType.AGENT_CREATED, {
      timestamp: Date.now(),
      agentId,
      agentRole: role,
      source: 'AgentManager',
    });

    return agentId;
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): AgentInstance | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get agents by role
   */
  getAgentsByRole(role: AgentRole): AgentInstance[] {
    return this.agentsByRole.get(role) || [];
  }

  /**
   * Execute agent task
   */
  async executeAgent(agentId: string, input: any): Promise<any> {
    const instance = this.agents.get(agentId);
    if (!instance) {
      throw new Error(`Agent ${agentId} not found`);
    }

    try {
      instance.status = 'working';

      eventBus.emit<AgentEventPayload>(EventType.AGENT_STARTED, {
        timestamp: Date.now(),
        agentId,
        agentRole: instance.role,
        data: input,
        source: 'AgentManager',
      });

      const result = await instance.agent.execute(input);

      instance.status = 'completed';

      eventBus.emit<AgentEventPayload>(EventType.AGENT_COMPLETED, {
        timestamp: Date.now(),
        agentId,
        agentRole: instance.role,
        data: result,
        source: 'AgentManager',
      });

      return result;
    } catch (error) {
      instance.status = 'failed';

      eventBus.emit<AgentEventPayload>(EventType.AGENT_FAILED, {
        timestamp: Date.now(),
        agentId,
        agentRole: instance.role,
        error: error as Error,
        source: 'AgentManager',
      });

      throw error;
    }
  }

  /**
   * Get all active agents
   */
  getActiveAgents(): AgentInstance[] {
    return Array.from(this.agents.values()).filter(
      (instance) => instance.status === 'idle' || instance.status === 'working'
    );
  }

  /**
   * Remove agent
   */
  removeAgent(agentId: string): void {
    const instance = this.agents.get(agentId);
    if (instance) {
      // Remove from role tracking
      const roleAgents = this.agentsByRole.get(instance.role);
      if (roleAgents) {
        const index = roleAgents.findIndex((a) => a.id === agentId);
        if (index !== -1) {
          roleAgents.splice(index, 1);
        }
      }

      this.agents.delete(agentId);
    }
  }

  /**
   * Clear all agents
   */
  clearAgents(): void {
    this.agents.clear();
    this.agentsByRole.clear();
  }

  /**
   * Get agent statistics
   */
  getStatistics(): {
    total: number;
    byRole: Record<string, number>;
    byStatus: Record<string, number>;
  } {
    const stats = {
      total: this.agents.size,
      byRole: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };

    this.agents.forEach((instance) => {
      // Count by role
      stats.byRole[instance.role] = (stats.byRole[instance.role] || 0) + 1;

      // Count by status
      stats.byStatus[instance.status] = (stats.byStatus[instance.status] || 0) + 1;
    });

    return stats;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Listen for system errors
    eventBus.on(EventType.SYSTEM_ERROR, (payload: any) => {
      console.error('System error detected:', payload);
    });

    // Listen for project realignment
    eventBus.on(EventType.PROJECT_REALIGN, () => {
      console.log('Project realignment requested - clearing agents');
      this.clearAgents();
    });
  }
}

// Singleton instance
export const agentManager = new AgentManager();

