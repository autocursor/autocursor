import { eventBus, EventType } from '../core/eventBus';
import { logger } from './logger';

/**
 * Progress Event
 */
export interface ProgressEvent {
  projectId: string;
  phase: string;
  status: 'started' | 'progress' | 'completed' | 'failed';
  progress: number; // 0-100
  message: string;
  timestamp: number;
  metadata?: Record<string, any>;
}

/**
 * Task Definition
 */
export interface Task {
  id: string;
  name: string;
  weight: number; // Contribution to overall progress
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
}

/**
 * Progress Tracker
 */
export class ProgressTracker {
  private projectId: string;
  private phase: string;
  private tasks: Map<string, Task> = new Map();
  private listeners: Array<(event: ProgressEvent) => void> = [];

  constructor(projectId: string, phase: string) {
    this.projectId = projectId;
    this.phase = phase;
  }

  /**
   * Add task to track
   */
  addTask(id: string, name: string, weight: number = 1): void {
    this.tasks.set(id, {
      id,
      name,
      weight,
      status: 'pending',
      progress: 0,
    });
  }

  /**
   * Start a task
   */
  startTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'in_progress';
    task.progress = 0;
    
    this.emitProgress('progress', `Started: ${task.name}`);
    logger.info('progress', `Task started: ${task.name}`, { taskId, phase: this.phase });
  }

  /**
   * Update task progress
   */
  updateTask(taskId: string, progress: number, message?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.progress = Math.min(100, Math.max(0, progress));
    task.status = 'in_progress';
    
    this.emitProgress('progress', message || `${task.name}: ${progress}%`);
  }

  /**
   * Complete a task
   */
  completeTask(taskId: string, message?: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'completed';
    task.progress = 100;
    
    this.emitProgress('progress', message || `Completed: ${task.name}`);
    logger.info('progress', `Task completed: ${task.name}`, { taskId, phase: this.phase });
  }

  /**
   * Fail a task
   */
  failTask(taskId: string, error: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    task.status = 'failed';
    
    this.emitProgress('failed', `Failed: ${task.name} - ${error}`);
    logger.error('progress', `Task failed: ${task.name}`, { taskId, error, phase: this.phase });
  }

  /**
   * Get overall progress (0-100)
   */
  getOverallProgress(): number {
    if (this.tasks.size === 0) return 0;

    const totalWeight = Array.from(this.tasks.values())
      .reduce((sum, task) => sum + task.weight, 0);
    
    if (totalWeight === 0) return 0;

    const weightedProgress = Array.from(this.tasks.values())
      .reduce((sum, task) => sum + (task.progress * task.weight), 0);
    
    return Math.round(weightedProgress / totalWeight);
  }

  /**
   * Get task summaries
   */
  getSummary(): {
    total: number;
    completed: number;
    inProgress: number;
    failed: number;
    pending: number;
  } {
    const tasks = Array.from(this.tasks.values());
    
    return {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
    };
  }

  /**
   * Emit progress event
   */
  private emitProgress(
    status: ProgressEvent['status'],
    message: string,
    metadata?: Record<string, any>
  ): void {
    const event: ProgressEvent = {
      projectId: this.projectId,
      phase: this.phase,
      status,
      progress: this.getOverallProgress(),
      message,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        summary: this.getSummary(),
      },
    };

    // Notify listeners
    this.listeners.forEach(listener => listener(event));

    // Emit to event bus
    eventBus.emit('progress.update', event);
  }

  /**
   * Subscribe to progress updates
   */
  onProgress(listener: (event: ProgressEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  /**
   * Start phase tracking
   */
  start(): void {
    this.emitProgress('started', `Starting ${this.phase} phase`);
    logger.info('progress', `Phase started: ${this.phase}`, { projectId: this.projectId });
  }

  /**
   * Complete phase tracking
   */
  complete(message?: string): void {
    this.emitProgress('completed', message || `${this.phase} phase completed`);
    logger.info('progress', `Phase completed: ${this.phase}`, { 
      projectId: this.projectId,
      summary: this.getSummary(),
    });
  }

  /**
   * Fail phase tracking
   */
  fail(error: string): void {
    this.emitProgress('failed', `${this.phase} phase failed: ${error}`);
    logger.error('progress', `Phase failed: ${this.phase}`, { 
      projectId: this.projectId,
      error,
      summary: this.getSummary(),
    });
  }
}

/**
 * Progress Manager - Global progress tracking
 */
class ProgressManager {
  private trackers: Map<string, ProgressTracker> = new Map();

  /**
   * Create tracker for a phase
   */
  createTracker(projectId: string, phase: string): ProgressTracker {
    const key = `${projectId}:${phase}`;
    const tracker = new ProgressTracker(projectId, phase);
    this.trackers.set(key, tracker);
    return tracker;
  }

  /**
   * Get tracker
   */
  getTracker(projectId: string, phase: string): ProgressTracker | undefined {
    const key = `${projectId}:${phase}`;
    return this.trackers.get(key);
  }

  /**
   * Remove tracker
   */
  removeTracker(projectId: string, phase: string): void {
    const key = `${projectId}:${phase}`;
    this.trackers.delete(key);
  }

  /**
   * Clear all trackers for a project
   */
  clearProject(projectId: string): void {
    Array.from(this.trackers.keys())
      .filter(key => key.startsWith(projectId))
      .forEach(key => this.trackers.delete(key));
  }
}

export const progressManager = new ProgressManager();

