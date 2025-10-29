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
   * Execute agent task
   */
  abstract execute(input: AgentInput): Promise<AgentOutput>;

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
   * Simulate AI processing (placeholder for actual AI integration)
   */
  protected async simulateAIProcessing(prompt: string, context?: any): Promise<string> {
    // In a real implementation, this would call an LLM API
    // For now, return a structured placeholder response
    return JSON.stringify({
      agent: this.name,
      prompt: prompt.substring(0, 100) + '...',
      context: context ? 'Context provided' : 'No context',
      timestamp: Date.now(),
    });
  }
}

