import { BaseAgent, AgentInput, AgentOutput } from './base';
import { memoryStore } from '../core/memoryStore';

/**
 * SummarizerAgent - Aggregates and summarizes inter-agent activities
 */
export class SummarizerAgent extends BaseAgent {
  constructor(systemPrompt?: string) {
    super('SummarizerAgent', systemPrompt || 'You are an expert at summarizing...');
  }

  /**
   * Execute summarization
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
      // Get all phase data
      const phases = project.phases;

      // Generate summary for each phase
      const phaseSummaries = await this.summarizePhases(phases);

      // Generate overall project summary
      const projectSummary = await this.generateProjectSummary(project, phaseSummaries);

      // Generate statistics
      const statistics = await this.generateStatistics(project);

      const summary = {
        projectOverview: projectSummary,
        phaseSummaries,
        statistics,
        timeline: this.generateTimeline(phases),
      };

      return {
        success: true,
        result: summary,
        message: 'Summary generated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Summarize phases
   */
  private async summarizePhases(phases: Record<string, any>): Promise<Record<string, string>> {
    const summaries: Record<string, string> = {};

    Object.entries(phases).forEach(([phaseName, phaseData]) => {
      if (phaseData.status === 'completed') {
        summaries[phaseName] = this.generatePhaseSummary(phaseName, phaseData);
      }
    });

    return summaries;
  }

  /**
   * Generate phase summary
   */
  private generatePhaseSummary(phaseName: string, phaseData: any): string {
    const duration = phaseData.completedAt
      ? ((phaseData.completedAt - phaseData.startedAt) / 1000).toFixed(2)
      : 0;

    const summaryTemplates: Record<string, string> = {
      requirements:
        'Requirements analysis completed. Identified functional and non-functional requirements, defined acceptance criteria, and documented constraints.',
      architecture:
        'Architecture design completed. Defined system structure, component relationships, data models, and API contracts.',
      development:
        'Development phase completed. Implemented all core functionality according to architecture specifications.',
      testing:
        'Testing completed. Created comprehensive test suite including unit, integration, and E2E tests.',
      devops:
        'DevOps setup completed. Configured CI/CD pipelines, Docker containers, and Kubernetes deployment.',
      documentation:
        'Documentation completed. Generated comprehensive README, API docs, architecture documentation, and deployment guides.',
    };

    return `${summaryTemplates[phaseName] || 'Phase completed.'} Duration: ${duration}s`;
  }

  /**
   * Generate overall project summary
   */
  private async generateProjectSummary(
    project: any,
    phaseSummaries: Record<string, string>
  ): Promise<string> {
    const completedPhases = Object.keys(phaseSummaries).length;
    const totalDuration = ((Date.now() - project.createdAt) / 1000).toFixed(2);

    return `
Project: ${project.purposeName}
Status: ${project.status}
Completed Phases: ${completedPhases}
Total Duration: ${totalDuration}s
Tech Stack: ${this.formatTechStack(project.techStack)}

The project has been successfully created with a complete implementation including requirements analysis, architecture design, development, testing, DevOps setup, and comprehensive documentation.
`;
  }

  /**
   * Format tech stack
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

    return parts.join('; ');
  }

  /**
   * Generate statistics
   */
  private async generateStatistics(project: any): Promise<any> {
    const phases = Object.values(project.phases);
    const completedPhases = phases.filter((p: any) => p.status === 'completed').length;
    const totalPhases = phases.length;

    return {
      totalPhases,
      completedPhases,
      completionPercentage: ((completedPhases / totalPhases) * 100).toFixed(0),
      artifacts: Object.keys(project.artifacts).length,
      conversationEntries: project.conversationHistory.length,
    };
  }

  /**
   * Generate timeline
   */
  private generateTimeline(phases: Record<string, any>): any[] {
    const timeline: any[] = [];

    Object.entries(phases).forEach(([phaseName, phaseData]) => {
      if (phaseData.startedAt) {
        timeline.push({
          phase: phaseName,
          status: phaseData.status,
          startedAt: new Date(phaseData.startedAt).toISOString(),
          completedAt: phaseData.completedAt
            ? new Date(phaseData.completedAt).toISOString()
            : null,
          duration: phaseData.completedAt
            ? `${((phaseData.completedAt - phaseData.startedAt) / 1000).toFixed(2)}s`
            : 'In progress',
        });
      }
    });

    return timeline.sort((a, b) => a.startedAt.localeCompare(b.startedAt));
  }

  /**
   * Summarize for user (friendly format)
   */
  async summarizeForUser(project: any): Promise<string> {
    const result = await this.execute({ projectContext: project });

    if (!result.success) {
      return 'Unable to generate summary.';
    }

    const summary = result.result;

    return `
🎉 **Project Summary**

${summary.projectOverview}

**Completed Phases:**
${Object.entries(summary.phaseSummaries)
  .map(([phase, desc]) => `✓ ${phase}: ${desc}`)
  .join('\n')}

**Statistics:**
- Progress: ${summary.statistics.completionPercentage}%
- Artifacts Generated: ${summary.statistics.artifacts}
- Total Interactions: ${summary.statistics.conversationEntries}

Your project is ready! All code, tests, documentation, and deployment configurations have been generated.
`;
  }
}

