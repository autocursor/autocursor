import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Project context stored in memory
 */
export interface ProjectContext {
  id: string;
  purposeId: string;
  purposeName: string;
  techStack: TechStack;
  status: ProjectStatus;
  createdAt: number;
  updatedAt: number;
  phases: Record<string, PhaseData>;
  artifacts: Record<string, any>;
  conversationHistory: ConversationEntry[];
  metadata: Record<string, any>;
}

/**
 * Tech stack configuration
 */
export interface TechStack {
  backend?: string[];
  frontend?: string[];
  database?: string[];
  infrastructure?: string[];
  testing?: string[];
  other?: string[];
}

/**
 * Project status enum
 */
export enum ProjectStatus {
  INITIALIZING = 'initializing',
  REQUIREMENTS = 'requirements',
  ARCHITECTURE = 'architecture',
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  DEVOPS = 'devops',
  DOCUMENTATION = 'documentation',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * Phase data
 */
export interface PhaseData {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
  result?: any;
  artifacts?: Record<string, any>;
  notes?: string[];
}

/**
 * Conversation entry
 */
export interface ConversationEntry {
  timestamp: number;
  role: 'user' | 'lead' | 'system';
  message: string;
  metadata?: Record<string, any>;
}

/**
 * MemoryStore - Persistent storage for project context and artifacts
 */
export class MemoryStore {
  private projects: Map<string, ProjectContext> = new Map();
  private currentProjectId: string | null = null;
  private persistencePath: string;

  constructor(persistencePath: string = './.autocursor') {
    this.persistencePath = persistencePath;
    this.ensurePersistenceDirectory();
  }

  /**
   * Create a new project context
   */
  createProject(purposeId: string, purposeName: string, techStack: TechStack): ProjectContext {
    const project: ProjectContext = {
      id: uuidv4(),
      purposeId,
      purposeName,
      techStack,
      status: ProjectStatus.INITIALIZING,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      phases: {},
      artifacts: {},
      conversationHistory: [],
      metadata: {},
    };

    this.projects.set(project.id, project);
    this.currentProjectId = project.id;
    this.persist(project.id);

    return project;
  }

  /**
   * Get current project
   */
  getCurrentProject(): ProjectContext | null {
    if (!this.currentProjectId) return null;
    return this.projects.get(this.currentProjectId) || null;
  }

  /**
   * Get project by ID
   */
  getProject(projectId: string): ProjectContext | null {
    return this.projects.get(projectId) || null;
  }

  /**
   * Update project status
   */
  updateProjectStatus(projectId: string, status: ProjectStatus): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.status = status;
      project.updatedAt = Date.now();
      this.persist(projectId);
    }
  }

  /**
   * Update phase data
   */
  updatePhase(projectId: string, phaseName: string, phaseData: Partial<PhaseData>): void {
    const project = this.projects.get(projectId);
    if (project) {
      if (!project.phases[phaseName]) {
        project.phases[phaseName] = {
          name: phaseName,
          status: 'pending',
          notes: [],
        };
      }

      project.phases[phaseName] = {
        ...project.phases[phaseName],
        ...phaseData,
      };
      project.updatedAt = Date.now();
      this.persist(projectId);
    }
  }

  /**
   * Store artifact
   */
  storeArtifact(projectId: string, artifactKey: string, artifactData: any): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.artifacts[artifactKey] = artifactData;
      project.updatedAt = Date.now();
      this.persist(projectId);
    }
  }

  /**
   * Get artifact
   */
  getArtifact(projectId: string, artifactKey: string): any {
    const project = this.projects.get(projectId);
    return project?.artifacts[artifactKey];
  }

  /**
   * Add conversation entry
   */
  addConversation(
    projectId: string,
    role: 'user' | 'lead' | 'system',
    message: string,
    metadata?: Record<string, any>
  ): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.conversationHistory.push({
        timestamp: Date.now(),
        role,
        message,
        metadata,
      });
      project.updatedAt = Date.now();
      this.persist(projectId);
    }
  }

  /**
   * Get conversation history
   */
  getConversationHistory(projectId: string): ConversationEntry[] {
    const project = this.projects.get(projectId);
    return project?.conversationHistory || [];
  }

  /**
   * Update project metadata
   */
  updateMetadata(projectId: string, key: string, value: any): void {
    const project = this.projects.get(projectId);
    if (project) {
      project.metadata[key] = value;
      project.updatedAt = Date.now();
      this.persist(projectId);
    }
  }

  /**
   * Get all projects
   */
  getAllProjects(): ProjectContext[] {
    return Array.from(this.projects.values());
  }

  /**
   * Delete project
   */
  deleteProject(projectId: string): void {
    this.projects.delete(projectId);
    if (this.currentProjectId === projectId) {
      this.currentProjectId = null;
    }
    this.deletePersisted(projectId);
  }

  /**
   * Set current project
   */
  setCurrentProject(projectId: string): void {
    if (this.projects.has(projectId)) {
      this.currentProjectId = projectId;
    }
  }

  /**
   * Persist project to disk
   */
  private persist(projectId: string): void {
    const project = this.projects.get(projectId);
    if (!project) return;

    try {
      const filePath = path.join(this.persistencePath, `${projectId}.json`);
      fs.writeFileSync(filePath, JSON.stringify(project, null, 2), 'utf-8');
    } catch (error) {
      console.error(`Failed to persist project ${projectId}:`, error);
    }
  }

  /**
   * Load project from disk
   */
  loadProject(projectId: string): ProjectContext | null {
    try {
      const filePath = path.join(this.persistencePath, `${projectId}.json`);
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        const project = JSON.parse(data) as ProjectContext;
        this.projects.set(projectId, project);
        return project;
      }
    } catch (error) {
      console.error(`Failed to load project ${projectId}:`, error);
    }
    return null;
  }

  /**
   * Load all projects from disk
   */
  loadAllProjects(): void {
    try {
      if (!fs.existsSync(this.persistencePath)) return;

      const files = fs.readdirSync(this.persistencePath);
      files
        .filter((file) => file.endsWith('.json'))
        .forEach((file) => {
          const projectId = file.replace('.json', '');
          this.loadProject(projectId);
        });
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  }

  /**
   * Delete persisted project
   */
  private deletePersisted(projectId: string): void {
    try {
      const filePath = path.join(this.persistencePath, `${projectId}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`Failed to delete project ${projectId}:`, error);
    }
  }

  /**
   * Ensure persistence directory exists
   */
  private ensurePersistenceDirectory(): void {
    try {
      if (!fs.existsSync(this.persistencePath)) {
        fs.mkdirSync(this.persistencePath, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to create persistence directory:', error);
    }
  }
}

// Singleton instance
export const memoryStore = new MemoryStore();

