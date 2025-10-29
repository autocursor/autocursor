import { agentManager, AgentRole } from '../core/agentManager';
import { eventBus, EventType } from '../core/eventBus';
import { purposeRegistry } from '../registry/purposes';
import { RequirementsAgent } from '../agents/requirements';
import { ArchitectAgent } from '../agents/architect';
import { BackendAgent } from '../agents/backend';
import { FrontendAgent } from '../agents/frontend';
import { MobileAgent } from '../agents/mobile';
import { GameAgent } from '../agents/game';
import { TesterAgent } from '../agents/tester';
import { DevOpsAgent } from '../agents/devops';
import { DocsAgent } from '../agents/docs';
import { SummarizerAgent } from '../agents/summarizer';

/**
 * Orchestrator - Initializes and coordinates agent teams for selected purposes
 */
export class Orchestrator {
  /**
   * Setup agents for a specific purpose
   */
  setupAgentsForPurpose(purposeId: string): void {
    const purpose = purposeRegistry.get(purposeId);
    if (!purpose) {
      throw new Error(`Purpose ${purposeId} not found`);
    }

    // Create agents based on purpose configuration
    purpose.agentRoles.forEach((role) => {
      this.createAgent(role, purpose.prompts[role]);
    });
  }

  /**
   * Create an agent with specific role
   */
  private createAgent(role: AgentRole, systemPrompt?: string): void {
    let agent;

    switch (role) {
      case AgentRole.REQUIREMENTS:
        agent = new RequirementsAgent(systemPrompt);
        break;
      case AgentRole.ARCHITECT:
        agent = new ArchitectAgent(systemPrompt);
        break;
      case AgentRole.BACKEND:
        agent = new BackendAgent(systemPrompt);
        break;
      case AgentRole.FRONTEND:
        agent = new FrontendAgent(systemPrompt);
        break;
      case AgentRole.MOBILE:
        agent = new MobileAgent(systemPrompt);
        break;
      case AgentRole.GAME:
        agent = new GameAgent(systemPrompt);
        break;
      case AgentRole.TESTER:
        agent = new TesterAgent(systemPrompt);
        break;
      case AgentRole.DEVOPS:
        agent = new DevOpsAgent(systemPrompt);
        break;
      case AgentRole.DOCS:
        agent = new DocsAgent(systemPrompt);
        break;
      case AgentRole.SUMMARIZER:
        agent = new SummarizerAgent(systemPrompt);
        break;
      default:
        return;
    }

    // Register agent with manager
    agentManager.createAgent(
      role,
      {
        role,
        capabilities: [],
        priority: 1,
        systemPrompt,
      },
      agent
    );
  }
}

// Listen for purpose selection to setup agents
eventBus.on(EventType.PURPOSE_SELECTED, (payload: any) => {
  const orchestrator = new Orchestrator();
  orchestrator.setupAgentsForPurpose(payload.purposeId);
});

export const orchestrator = new Orchestrator();

