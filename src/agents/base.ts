import { logger } from '../utils/logger';
import { ErrorHandler, AgentError, tryCatch } from '../utils/errorHandler';
import { AgentInputValidator } from '../utils/validation';

/**
 * Base agent interface
 */
export interface AgentInput {
  projectContext?: any;
  previousPhaseResults?: any;
  userMessage?: string;
  metadata?: Record<string, any>;
}

/**
 * Base agent output
 */
export interface AgentOutput {
  success: boolean;
  result?: any;
  artifacts?: Record<string, any>;
  message?: string;
  error?: Error;
}

/**
 * Base Agent class - All agents extend from this
 */
export abstract class BaseAgent {
  protected name: string;
  protected systemPrompt: string;

  constructor(name: string, systemPrompt: string = '') {
    this.name = name;
    this.systemPrompt = systemPrompt;
  }

  /**
   * Execute agent task with error handling and logging
   */
  async execute(input: AgentInput): Promise<AgentOutput> {
    // Validate input
    const validation = AgentInputValidator.validateAgentInput(input);
    if (!validation.valid) {
      const error = new AgentError(
        `Invalid input: ${validation.errors.join('; ')}`,
        this.name,
        { input }
      );
      ErrorHandler.handle(error);
      return { success: false, error };
    }

    // Log execution start
    logger.info('agent', `${this.name} execution started`, { input });

    // Execute with retry and error handling
    return tryCatch(
      () => this.executeInternal(input),
      (error) => {
        const agentError = new AgentError(
          `Execution failed: ${error.message}`,
          this.name,
          { input, error: error.stack }
        );
        ErrorHandler.handle(agentError);
        return { success: false, error: agentError };
      }
    );
  }

  /**
   * Internal execution - override this instead of execute()
   */
  protected abstract executeInternal(input: AgentInput): Promise<AgentOutput>;

  /**
   * Get agent name
   */
  getName(): string {
    return this.name;
  }

  /**
   * Get system prompt
   */
  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  /**
   * Update system prompt
   */
  setSystemPrompt(prompt: string): void {
    this.systemPrompt = prompt;
  }

  /**
   * Format prompt with context
   */
  protected formatPrompt(template: string, context: Record<string, any>): string {
    let formatted = template;
    Object.entries(context).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      formatted = formatted.replace(new RegExp(placeholder, 'g'), String(value));
    });
    return formatted;
  }

  /**
   * Log agent activity
   */
  protected log(message: string, data?: any): void {
    logger.info(this.name, message, data);
  }

  /**
   * Log agent error
   */
  protected logError(message: string, error?: Error): void {
    logger.error(this.name, message, { error: error?.message, stack: error?.stack });
  }
}

