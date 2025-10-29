import { eventBus, EventType, PhaseEventPayload } from './eventBus';
import { memoryStore, ProjectStatus } from './memoryStore';
import { agentManager, AgentRole } from './agentManager';

/**
 * Workflow phase definition
 */
export interface WorkflowPhase {
  name: string;
  agentRoles: AgentRole[];
  startEvent: EventType;
  completeEvent: EventType;
  nextPhase?: string;
  isParallel?: boolean;
}

/**
 * AutoFlow Engine - Determines workflow order and triggers next phases automatically
 */
export class AutoFlow {
  private workflows: Map<string, WorkflowPhase[]> = new Map();
  private currentPhase: string | null = null;
  private isRunning = false;

  constructor() {
    this.initializeDefaultWorkflow();
    this.setupEventListeners();
  }

  /**
   * Initialize the default SDLC workflow
   */
  private initializeDefaultWorkflow(): void {
    const defaultWorkflow: WorkflowPhase[] = [
      {
        name: 'requirements',
        agentRoles: [AgentRole.REQUIREMENTS],
        startEvent: EventType.PHASE_REQUIREMENTS_START,
        completeEvent: EventType.PHASE_REQUIREMENTS_COMPLETE,
        nextPhase: 'architecture',
      },
      {
        name: 'architecture',
        agentRoles: [AgentRole.ARCHITECT],
        startEvent: EventType.PHASE_ARCHITECTURE_START,
        completeEvent: EventType.PHASE_ARCHITECTURE_COMPLETE,
        nextPhase: 'development',
      },
      {
        name: 'development',
        agentRoles: [AgentRole.BACKEND, AgentRole.FRONTEND, AgentRole.MOBILE, AgentRole.GAME],
        startEvent: EventType.PHASE_DEVELOPMENT_START,
        completeEvent: EventType.PHASE_DEVELOPMENT_COMPLETE,
        nextPhase: 'testing',
        isParallel: true,
      },
      {
        name: 'testing',
        agentRoles: [AgentRole.TESTER],
        startEvent: EventType.PHASE_TESTING_START,
        completeEvent: EventType.PHASE_TESTING_COMPLETE,
        nextPhase: 'devops',
      },
      {
        name: 'devops',
        agentRoles: [AgentRole.DEVOPS],
        startEvent: EventType.PHASE_DEVOPS_START,
        completeEvent: EventType.PHASE_DEVOPS_COMPLETE,
        nextPhase: 'documentation',
      },
      {
        name: 'documentation',
        agentRoles: [AgentRole.DOCS],
        startEvent: EventType.PHASE_DOCUMENTATION_START,
        completeEvent: EventType.PHASE_DOCUMENTATION_COMPLETE,
      },
    ];

    this.workflows.set('default', defaultWorkflow);
  }

  /**
   * Start the workflow for a project
   */
  async startWorkflow(workflowName: string = 'default'): Promise<void> {
    const workflow = this.workflows.get(workflowName);
    if (!workflow) {
      throw new Error(`Workflow ${workflowName} not found`);
    }

    this.isRunning = true;

    const project = memoryStore.getCurrentProject();
    if (!project) {
      throw new Error('No active project found');
    }

    // Start with first phase
    const firstPhase = workflow[0];
    this.currentPhase = firstPhase.name;

    // Update project status
    memoryStore.updateProjectStatus(project.id, ProjectStatus.REQUIREMENTS);
    memoryStore.updatePhase(project.id, firstPhase.name, {
      name: firstPhase.name,
      status: 'in_progress',
      startedAt: Date.now(),
    });

    // Trigger first phase
    eventBus.emit<PhaseEventPayload>(firstPhase.startEvent, {
      timestamp: Date.now(),
      phase: firstPhase.name,
      source: 'AutoFlow',
    });
  }

  /**
   * Proceed to next phase
   */
  private async proceedToNextPhase(currentPhaseName: string): Promise<void> {
    const workflow = this.workflows.get('default');
    if (!workflow) return;

    const currentPhaseIndex = workflow.findIndex((phase) => phase.name === currentPhaseName);
    if (currentPhaseIndex === -1) return;

    const currentPhase = workflow[currentPhaseIndex];
    const nextPhaseName = currentPhase.nextPhase;

    if (!nextPhaseName) {
      // Workflow complete
      this.isRunning = false;
      const project = memoryStore.getCurrentProject();
      if (project) {
        memoryStore.updateProjectStatus(project.id, ProjectStatus.COMPLETED);
      }
      return;
    }

    const nextPhase = workflow.find((phase) => phase.name === nextPhaseName);
    if (!nextPhase) return;

    this.currentPhase = nextPhaseName;

    // Update project status based on phase
    const project = memoryStore.getCurrentProject();
    if (project) {
      const statusMap: Record<string, ProjectStatus> = {
        requirements: ProjectStatus.REQUIREMENTS,
        architecture: ProjectStatus.ARCHITECTURE,
        development: ProjectStatus.DEVELOPMENT,
        testing: ProjectStatus.TESTING,
        devops: ProjectStatus.DEVOPS,
        documentation: ProjectStatus.DOCUMENTATION,
      };

      const status = statusMap[nextPhaseName] || ProjectStatus.DEVELOPMENT;
      memoryStore.updateProjectStatus(project.id, status);
      memoryStore.updatePhase(project.id, nextPhaseName, {
        name: nextPhaseName,
        status: 'in_progress',
        startedAt: Date.now(),
      });
    }

    // Trigger next phase
    eventBus.emit<PhaseEventPayload>(nextPhase.startEvent, {
      timestamp: Date.now(),
      phase: nextPhaseName,
      source: 'AutoFlow',
    });
  }

  /**
   * Get current phase
   */
  getCurrentPhase(): string | null {
    return this.currentPhase;
  }

  /**
   * Check if workflow is running
   */
  isWorkflowRunning(): boolean {
    return this.isRunning;
  }

  /**
   * Register custom workflow
   */
  registerWorkflow(name: string, phases: WorkflowPhase[]): void {
    this.workflows.set(name, phases);
  }

  /**
   * Setup event listeners for phase completion
   */
  private setupEventListeners(): void {
    // Requirements phase
    eventBus.on<PhaseEventPayload>(EventType.PHASE_REQUIREMENTS_COMPLETE, async (payload) => {
      const project = memoryStore.getCurrentProject();
      if (project) {
        memoryStore.updatePhase(project.id, 'requirements', {
          name: 'requirements',
          status: 'completed',
          completedAt: Date.now(),
          result: payload.result,
          artifacts: payload.artifacts,
        });
      }
      await this.proceedToNextPhase('requirements');
    });

    // Architecture phase
    eventBus.on<PhaseEventPayload>(EventType.PHASE_ARCHITECTURE_COMPLETE, async (payload) => {
      const project = memoryStore.getCurrentProject();
      if (project) {
        memoryStore.updatePhase(project.id, 'architecture', {
          name: 'architecture',
          status: 'completed',
          completedAt: Date.now(),
          result: payload.result,
          artifacts: payload.artifacts,
        });
      }
      await this.proceedToNextPhase('architecture');
    });

    // Development phase
    eventBus.on<PhaseEventPayload>(EventType.PHASE_DEVELOPMENT_COMPLETE, async (payload) => {
      const project = memoryStore.getCurrentProject();
      if (project) {
        memoryStore.updatePhase(project.id, 'development', {
          name: 'development',
          status: 'completed',
          completedAt: Date.now(),
          result: payload.result,
          artifacts: payload.artifacts,
        });
      }
      await this.proceedToNextPhase('development');
    });

    // Testing phase
    eventBus.on<PhaseEventPayload>(EventType.PHASE_TESTING_COMPLETE, async (payload) => {
      const project = memoryStore.getCurrentProject();
      if (project) {
        memoryStore.updatePhase(project.id, 'testing', {
          name: 'testing',
          status: 'completed',
          completedAt: Date.now(),
          result: payload.result,
          artifacts: payload.artifacts,
        });
      }
      await this.proceedToNextPhase('testing');
    });

    // DevOps phase
    eventBus.on<PhaseEventPayload>(EventType.PHASE_DEVOPS_COMPLETE, async (payload) => {
      const project = memoryStore.getCurrentProject();
      if (project) {
        memoryStore.updatePhase(project.id, 'devops', {
          name: 'devops',
          status: 'completed',
          completedAt: Date.now(),
          result: payload.result,
          artifacts: payload.artifacts,
        });
      }
      await this.proceedToNextPhase('devops');
    });

    // Documentation phase
    eventBus.on<PhaseEventPayload>(EventType.PHASE_DOCUMENTATION_COMPLETE, async (payload) => {
      const project = memoryStore.getCurrentProject();
      if (project) {
        memoryStore.updatePhase(project.id, 'documentation', {
          name: 'documentation',
          status: 'completed',
          completedAt: Date.now(),
          result: payload.result,
          artifacts: payload.artifacts,
        });
      }
      await this.proceedToNextPhase('documentation');
    });
  }

  /**
   * Reset workflow
   */
  reset(): void {
    this.currentPhase = null;
    this.isRunning = false;
  }
}

// Singleton instance
export const autoFlow = new AutoFlow();

