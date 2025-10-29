import { BaseAgent, AgentInput, AgentOutput } from './base';
import { eventBus, EventType } from '../core/eventBus';
import { memoryStore } from '../core/memoryStore';

/**
 * ArchitectAgent - Designs system architecture
 */
export class ArchitectAgent extends BaseAgent {
  constructor(systemPrompt?: string) {
    super('ArchitectAgent', systemPrompt || 'You are a senior software architect...');
    this.setupEventListeners();
  }

  /**
   * Execute architecture design
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
      // Get requirements
      const requirements = memoryStore.getArtifact(project.id, 'requirements');

      // Design architecture
      const architecture = await this.designArchitecture(project, requirements);

      // Define component structure
      const components = await this.defineComponents(project);

      // Design data models
      const dataModels = await this.designDataModels(project);

      // Define API contracts
      const apiContracts = await this.defineAPIContracts(project);

      const architectureDoc = {
        overview: architecture,
        components,
        dataModels,
        apiContracts,
        designPatterns: this.recommendDesignPatterns(project),
        technologyDecisions: this.documentTechnologyDecisions(project),
      };

      // Store artifacts
      memoryStore.storeArtifact(project.id, 'architecture', architectureDoc);

      return {
        success: true,
        result: architectureDoc,
        artifacts: {
          architectureDocument: architectureDoc,
        },
        message: 'Architecture design completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Design overall architecture
   */
  private async designArchitecture(project: any, requirements: any): Promise<any> {
    const architectureByPurpose: Record<string, any> = {
      'web-development': {
        pattern: 'Layered Architecture',
        layers: ['Presentation Layer', 'Business Logic Layer', 'Data Access Layer'],
        description:
          'Three-tier architecture with React frontend, Go backend API, and PostgreSQL database',
      },
      'game-development': {
        pattern: 'Entity-Component-System (ECS)',
        components: ['Entities', 'Components', 'Systems'],
        description: 'Data-oriented design pattern optimized for game performance',
      },
      'ios-app': {
        pattern: 'MVVM (Model-View-ViewModel)',
        components: ['Models', 'Views', 'ViewModels', 'Services'],
        description: 'MVVM architecture leveraging SwiftUI and Combine framework',
      },
      'android-app': {
        pattern: 'MVVM with Clean Architecture',
        layers: ['Presentation', 'Domain', 'Data'],
        description: 'Clean architecture with MVVM pattern using Jetpack Compose',
      },
      'api-microservices': {
        pattern: 'Microservices Architecture',
        components: ['API Gateway', 'Service Mesh', 'Individual Services', 'Message Queue'],
        description: 'Distributed microservices with gRPC communication',
      },
      'cli-tool': {
        pattern: 'Command Pattern',
        components: ['Command Parser', 'Command Handlers', 'Config Manager'],
        description: 'Modular CLI architecture using command pattern',
      },
      'data-science': {
        pattern: 'Pipeline Architecture',
        stages: ['Data Ingestion', 'Processing', 'Model Training', 'Serving'],
        description: 'ML pipeline with FastAPI serving layer',
      },
      'desktop-app': {
        pattern: 'Process-based Architecture',
        processes: ['Main Process', 'Renderer Process', 'IPC'],
        description: 'Electron multi-process architecture',
      },
    };

    return architectureByPurpose[project.purposeId] || {};
  }

  /**
   * Define components
   */
  private async defineComponents(project: any): Promise<any[]> {
    const componentsByPurpose: Record<string, any[]> = {
      'web-development': [
        { name: 'API Server', responsibility: 'Handle HTTP requests and business logic' },
        { name: 'Database Layer', responsibility: 'Data persistence and retrieval' },
        { name: 'Authentication Service', responsibility: 'User authentication and authorization' },
        { name: 'Frontend App', responsibility: 'User interface and interactions' },
      ],
      'game-development': [
        { name: 'Game Manager', responsibility: 'Overall game state management' },
        { name: 'Player Controller', responsibility: 'Handle player input and movement' },
        { name: 'Physics Engine', responsibility: 'Collision detection and physics' },
        { name: 'Audio Manager', responsibility: 'Sound effects and music' },
        { name: 'UI System', responsibility: 'Menus and HUD' },
      ],
      'ios-app': [
        { name: 'Views', responsibility: 'SwiftUI views and screens' },
        { name: 'ViewModels', responsibility: 'Business logic and state management' },
        { name: 'Models', responsibility: 'Data structures' },
        { name: 'Services', responsibility: 'API calls and data operations' },
        { name: 'Core Data Stack', responsibility: 'Local persistence' },
      ],
    };

    return componentsByPurpose[project.purposeId] || [];
  }

  /**
   * Design data models
   */
  private async designDataModels(project: any): Promise<any[]> {
    return [
      {
        name: 'User',
        fields: ['id', 'email', 'password_hash', 'created_at', 'updated_at'],
        relationships: [],
      },
      {
        name: 'Session',
        fields: ['id', 'user_id', 'token', 'expires_at'],
        relationships: ['belongs_to: User'],
      },
    ];
  }

  /**
   * Define API contracts
   */
  private async defineAPIContracts(project: any): Promise<any[]> {
    if (project.purposeId === 'web-development' || project.purposeId === 'api-microservices') {
      return [
        { method: 'POST', path: '/api/auth/login', description: 'User login' },
        { method: 'POST', path: '/api/auth/logout', description: 'User logout' },
        { method: 'GET', path: '/api/user/profile', description: 'Get user profile' },
        { method: 'PUT', path: '/api/user/profile', description: 'Update user profile' },
      ];
    }
    return [];
  }

  /**
   * Recommend design patterns
   */
  private recommendDesignPatterns(project: any): string[] {
    return [
      'Repository Pattern for data access',
      'Dependency Injection for loose coupling',
      'Factory Pattern for object creation',
      'Observer Pattern for event handling',
      'Strategy Pattern for algorithm selection',
    ];
  }

  /**
   * Document technology decisions
   */
  private documentTechnologyDecisions(project: any): any[] {
    return [
      {
        decision: 'Use TypeScript for type safety',
        rationale: 'Improved developer experience and fewer runtime errors',
      },
      {
        decision: 'PostgreSQL for database',
        rationale: 'ACID compliance, robust feature set, and excellent performance',
      },
      {
        decision: 'Docker for containerization',
        rationale: 'Consistent development and deployment environments',
      },
    ];
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    eventBus.on(EventType.PHASE_ARCHITECTURE_START, async () => {
      const result = await this.execute({});

      // Emit completion event
      eventBus.emit(EventType.PHASE_ARCHITECTURE_COMPLETE, {
        timestamp: Date.now(),
        phase: 'architecture',
        result: result.result,
        artifacts: result.artifacts,
        source: 'ArchitectAgent',
      });
    });
  }
}

