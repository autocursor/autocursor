import { BaseAgent, AgentInput, AgentOutput } from './base';
import { eventBus, EventType, UserMessagePayload, LeadResponsePayload } from '../core/eventBus';
import { memoryStore } from '../core/memoryStore';
import { purposeRegistry } from '../registry/purposes';
import { autoFlow } from '../core/autoFlow';

/**
 * LeadAgent - The only visible agent to the user
 * Interfaces with user and summarizes system activity
 */
export class LeadAgent extends BaseAgent {
  constructor() {
    super('LeadAgent', 'You are a friendly senior software architect...');
    this.setupEventListeners();
  }

  /**
   * Execute lead agent task
   */
  async execute(input: AgentInput): Promise<AgentOutput> {
    const userMessage = input.userMessage || '';

    try {
      // Detect if user is selecting a purpose
      const purpose = this.detectPurpose(userMessage);

      if (purpose) {
        // User is starting a new project
        return await this.handlePurposeSelection(purpose, userMessage);
      }

      // Handle general conversation
      return await this.handleConversation(userMessage, input);
    } catch (error) {
      return {
        success: false,
        error: error as Error,
        message: 'I encountered an error processing your request. Could you try rephrasing?',
      };
    }
  }

  /**
   * Detect purpose from user message
   */
  private detectPurpose(message: string): any {
    const purposes = purposeRegistry.getAll();
    const lowerMessage = message.toLowerCase();

    // Keywords mapping to purposes
    const purposeKeywords: Record<string, string[]> = {
      'web-development': ['web app', 'website', 'web application', 'saas', 'dashboard'],
      'game-development': ['game', '2d game', '3d game', 'platformer', 'unity', 'godot'],
      'ios-app': ['ios app', 'iphone app', 'swift', 'ios', 'ipad'],
      'android-app': ['android app', 'android', 'kotlin', 'mobile app'],
      'api-microservices': ['api', 'microservices', 'backend service', 'rest api', 'grpc'],
      'cli-tool': ['cli tool', 'command line', 'terminal app', 'cli'],
      'data-science': ['data science', 'machine learning', 'ai tool', 'analytics', 'ml'],
      'desktop-app': ['desktop app', 'electron', 'desktop application'],
    };

    for (const [purposeId, keywords] of Object.entries(purposeKeywords)) {
      if (keywords.some((keyword) => lowerMessage.includes(keyword))) {
        return purposeRegistry.get(purposeId);
      }
    }

    return null;
  }

  /**
   * Handle purpose selection
   */
  private async handlePurposeSelection(
    purpose: any,
    userMessage: string
  ): Promise<AgentOutput> {
    // Create new project
    const project = memoryStore.createProject(purpose.id, purpose.name, purpose.techStack);

    // Store conversation
    memoryStore.addConversation(project.id, 'user', userMessage);

    // Emit purpose selected event
    eventBus.emit(EventType.PURPOSE_SELECTED, {
      timestamp: Date.now(),
      purposeId: purpose.id,
      purposeName: purpose.name,
      userMessage,
      source: 'LeadAgent',
    });

    const responseMessage = `Great! I'll help you build a ${purpose.name} project. 

I'm setting up a team to work on this with the following tech stack:
${this.formatTechStack(purpose.techStack)}

Let me gather some requirements and get started. This will just take a moment...`;

    memoryStore.addConversation(project.id, 'lead', responseMessage);

    // Start the workflow
    setTimeout(() => {
      autoFlow.startWorkflow();
    }, 1000);

    return {
      success: true,
      result: { purpose, project },
      message: responseMessage,
    };
  }

  /**
   * Handle general conversation
   */
  private async handleConversation(message: string, input: AgentInput): Promise<AgentOutput> {
    const project = memoryStore.getCurrentProject();

    if (!project) {
      return {
        success: true,
        message:
          "Hi! I'm Auto Cursor, your AI software development assistant. What kind of project would you like to build today? For example:\n\n" +
          "• A web application\n" +
          "• A mobile app (iOS or Android)\n" +
          "• A game\n" +
          "• An API or microservices\n" +
          "• A CLI tool\n" +
          "• Or something else?\n\n" +
          "Just tell me what you have in mind!",
      };
    }

    // Store conversation
    memoryStore.addConversation(project.id, 'user', message);

    // Generate contextual response based on project status
    const responseMessage = await this.generateContextualResponse(project, message);

    memoryStore.addConversation(project.id, 'lead', responseMessage);

    return {
      success: true,
      message: responseMessage,
    };
  }

  /**
   * Generate contextual response based on project state
   */
  private async generateContextualResponse(project: any, userMessage: string): Promise<string> {
    const currentPhase = autoFlow.getCurrentPhase();

    // Check for project pivot request
    if (
      userMessage.toLowerCase().includes('actually') ||
      userMessage.toLowerCase().includes('change to') ||
      userMessage.toLowerCase().includes('make it')
    ) {
      const newPurpose = this.detectPurpose(userMessage);
      if (newPurpose && newPurpose.id !== project.purposeId) {
        eventBus.emit(EventType.PROJECT_REALIGN, {
          timestamp: Date.now(),
          source: 'LeadAgent',
          metadata: { newPurpose: newPurpose.id, oldPurpose: project.purposeId },
        });
        return `I understand you'd like to pivot to a ${newPurpose.name} project. Let me reconfigure the team and adjust our approach...`;
      }
    }

    // Phase-specific responses
    switch (currentPhase) {
      case 'requirements':
        return `I'm currently working with the team to gather and analyze requirements for your ${project.purposeName} project. We're making sure we understand all the key features and constraints.`;
      case 'architecture':
        return `Great question! Right now, the architecture team is designing the system structure and choosing the best patterns for your ${project.purposeName} project.`;
      case 'development':
        return `The development team is actively building your ${project.purposeName} project. They're implementing the features based on the architecture we designed.`;
      case 'testing':
        return `We're in the testing phase now, making sure everything works correctly and meets the requirements.`;
      case 'devops':
        return `Almost done! The DevOps team is setting up deployment pipelines and infrastructure.`;
      case 'documentation':
        return `We're wrapping up by creating comprehensive documentation for your project.`;
      default:
        return `Thanks for your message! I'll make note of that. The team is working hard on your ${project.purposeName} project.`;
    }
  }

  /**
   * Format tech stack for display
   */
  private formatTechStack(techStack: any): string {
    const parts: string[] = [];

    if (techStack.backend?.length) {
      parts.push(`Backend: ${techStack.backend.join(', ')}`);
    }
    if (techStack.frontend?.length) {
      parts.push(`Frontend: ${techStack.frontend.join(', ')}`);
    }
    if (techStack.database?.length) {
      parts.push(`Database: ${techStack.database.join(', ')}`);
    }
    if (techStack.infrastructure?.length) {
      parts.push(`Infrastructure: ${techStack.infrastructure.join(', ')}`);
    }
    if (techStack.testing?.length) {
      parts.push(`Testing: ${techStack.testing.join(', ')}`);
    }

    return parts.join('\n');
  }

  /**
   * Setup event listeners for system events
   */
  private setupEventListeners(): void {
    // Listen for phase completions to provide updates
    const phaseEvents = [
      EventType.PHASE_REQUIREMENTS_COMPLETE,
      EventType.PHASE_ARCHITECTURE_COMPLETE,
      EventType.PHASE_DEVELOPMENT_COMPLETE,
      EventType.PHASE_TESTING_COMPLETE,
      EventType.PHASE_DEVOPS_COMPLETE,
      EventType.PHASE_DOCUMENTATION_COMPLETE,
    ];

    phaseEvents.forEach((event) => {
      eventBus.on(event, (payload: any) => {
        const project = memoryStore.getCurrentProject();
        if (project) {
          const phase = payload.phase;
          const message = `✓ ${phase.charAt(0).toUpperCase() + phase.slice(1)} phase completed successfully!`;
          memoryStore.addConversation(project.id, 'system', message);
        }
      });
    });
  }
}

