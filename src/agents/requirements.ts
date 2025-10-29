import { BaseAgent, AgentInput, AgentOutput } from './base';
import { eventBus, EventType } from '../core/eventBus';
import { memoryStore } from '../core/memoryStore';

/**
 * RequirementsAgent - Analyzes and documents project requirements
 */
export class RequirementsAgent extends BaseAgent {
  constructor(systemPrompt?: string) {
    super('RequirementsAgent', systemPrompt || 'You are a senior business analyst...');
    this.setupEventListeners();
  }

  /**
   * Execute requirements gathering
   */
  async execute(input: AgentInput): Promise<AgentOutput> {
    const project = memoryStore.getCurrentProject();
    if (!project) {
      return {
        success: false,
        error: new Error('No active project'),
      };
    }

    try {
      // Gather functional requirements
      const functionalRequirements = await this.gatherFunctionalRequirements(project);

      // Gather non-functional requirements
      const nonFunctionalRequirements = await this.gatherNonFunctionalRequirements(project);

      // Define acceptance criteria
      const acceptanceCriteria = await this.defineAcceptanceCriteria(
        functionalRequirements,
        nonFunctionalRequirements
      );

      // Create requirements document
      const requirementsDoc = {
        functional: functionalRequirements,
        nonFunctional: nonFunctionalRequirements,
        acceptanceCriteria,
        stakeholders: ['End Users', 'Development Team', 'Product Owner'],
        constraints: this.identifyConstraints(project),
      };

      // Store artifacts
      memoryStore.storeArtifact(project.id, 'requirements', requirementsDoc);

      return {
        success: true,
        result: requirementsDoc,
        artifacts: {
          requirementsDocument: requirementsDoc,
        },
        message: 'Requirements gathering completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Gather functional requirements
   */
  private async gatherFunctionalRequirements(project: any): Promise<string[]> {
    // Purpose-specific requirements
    const requirementsByPurpose: Record<string, string[]> = {
      'web-development': [
        'User authentication and authorization',
        'RESTful API endpoints',
        'Responsive user interface',
        'Data persistence and retrieval',
        'Session management',
        'Form validation and error handling',
      ],
      'game-development': [
        'Player movement and controls',
        'Game physics and collision detection',
        'Score tracking and progression',
        'Audio and visual effects',
        'Game state management',
        'Level design and loading',
      ],
      'ios-app': [
        'Native iOS UI components',
        'User authentication',
        'Data synchronization',
        'Push notifications',
        'Local data storage',
        'App lifecycle management',
      ],
      'android-app': [
        'Native Android UI components',
        'User authentication',
        'Data synchronization',
        'Push notifications',
        'Local data storage',
        'App lifecycle management',
      ],
      'api-microservices': [
        'API endpoint design and implementation',
        'Service-to-service communication',
        'Request/response handling',
        'Authentication and authorization',
        'Rate limiting and throttling',
        'Error handling and logging',
      ],
      'cli-tool': [
        'Command-line interface design',
        'Argument parsing and validation',
        'Configuration management',
        'Output formatting',
        'Error handling and help text',
        'Command execution flow',
      ],
      'data-science': [
        'Data ingestion and preprocessing',
        'Model training and evaluation',
        'Visualization and reporting',
        'API for model serving',
        'Experiment tracking',
        'Data validation and quality checks',
      ],
      'desktop-app': [
        'Native window management',
        'File system operations',
        'User interface components',
        'Application menus and shortcuts',
        'Inter-process communication',
        'Settings and preferences',
      ],
    };

    return requirementsByPurpose[project.purposeId] || [];
  }

  /**
   * Gather non-functional requirements
   */
  private async gatherNonFunctionalRequirements(project: any): Promise<Record<string, string[]>> {
    return {
      performance: [
        'Response time < 200ms for API calls',
        'Support 1000+ concurrent users',
        'Optimize for low memory usage',
      ],
      security: [
        'Implement secure authentication',
        'Encrypt sensitive data',
        'Follow OWASP security guidelines',
        'Regular security audits',
      ],
      scalability: [
        'Horizontal scaling capability',
        'Load balancing support',
        'Database query optimization',
      ],
      maintainability: [
        'Clean code architecture',
        'Comprehensive documentation',
        'Unit test coverage > 80%',
        'Code review process',
      ],
      usability: [
        'Intuitive user interface',
        'Accessibility compliance (WCAG 2.1)',
        'Mobile-responsive design',
        'Clear error messages',
      ],
    };
  }

  /**
   * Define acceptance criteria
   */
  private async defineAcceptanceCriteria(
    functional: string[],
    nonFunctional: Record<string, string[]>
  ): Promise<string[]> {
    const criteria: string[] = [
      'All functional requirements implemented and tested',
      'All unit tests passing with > 80% coverage',
      'No critical or high-severity bugs',
      'Performance benchmarks met',
      'Security audit passed',
      'Documentation complete and reviewed',
      'Code review completed and approved',
    ];

    return criteria;
  }

  /**
   * Identify constraints
   */
  private identifyConstraints(project: any): string[] {
    return [
      'Development timeline: To be determined',
      'Budget: To be determined',
      'Team size: Autonomous agent team',
      'Technology stack: As defined in purpose configuration',
    ];
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    eventBus.on(EventType.PHASE_REQUIREMENTS_START, async () => {
      const result = await this.execute({});

      // Emit completion event
      eventBus.emit(EventType.PHASE_REQUIREMENTS_COMPLETE, {
        timestamp: Date.now(),
        phase: 'requirements',
        result: result.result,
        artifacts: result.artifacts,
        source: 'RequirementsAgent',
      });
    });
  }
}

