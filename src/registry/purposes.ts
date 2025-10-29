import { AgentRole } from '../core/agentManager';
import { TechStack } from '../core/memoryStore';

/**
 * Purpose definition
 */
export interface Purpose {
  id: string;
  name: string;
  description: string;
  category: string;
  techStack: TechStack;
  agentRoles: AgentRole[];
  prompts: {
    [key in AgentRole]?: string;
  };
  templates?: string[];
  defaultStructure?: ProjectStructure;
}

/**
 * Project structure definition
 */
export interface ProjectStructure {
  directories: string[];
  files?: {
    path: string;
    template?: string;
  }[];
}

/**
 * PurposeRegistry - Maps purposes to tech stacks and agent configurations
 */
export class PurposeRegistry {
  private purposes: Map<string, Purpose> = new Map();

  constructor() {
    this.registerDefaultPurposes();
  }

  /**
   * Register default purposes
   */
  private registerDefaultPurposes(): void {
    // Web Development
    this.register({
      id: 'web-development',
      name: 'Web Development',
      description: 'Full-stack web application development',
      category: 'Web',
      techStack: {
        backend: ['Go', 'PostgreSQL', 'Redis'],
        frontend: ['React', 'Next.js', 'TypeScript', 'TailwindCSS'],
        infrastructure: ['Docker', 'Nginx'],
        testing: ['Jest', 'Playwright', 'Go testing'],
        other: ['GitHub Actions', 'ESLint', 'Prettier'],
      },
      agentRoles: [
        AgentRole.REQUIREMENTS,
        AgentRole.ARCHITECT,
        AgentRole.BACKEND,
        AgentRole.FRONTEND,
        AgentRole.TESTER,
        AgentRole.DEVOPS,
        AgentRole.DOCS,
        AgentRole.SUMMARIZER,
      ],
      prompts: {
        [AgentRole.BACKEND]: 'go_backend',
        [AgentRole.FRONTEND]: 'react_frontend',
      },
      defaultStructure: {
        directories: [
          'backend/cmd/server',
          'backend/internal/handlers',
          'backend/internal/models',
          'backend/internal/database',
          'frontend/src/components',
          'frontend/src/pages',
          'frontend/src/styles',
          'frontend/public',
          'docker',
          'scripts',
          '.github/workflows',
        ],
      },
    });

    // Game Development
    this.register({
      id: 'game-development',
      name: 'Game Development',
      description: '2D/3D game development with Unity or Godot',
      category: 'Game',
      techStack: {
        other: ['Unity', 'C#', 'Unity Test Framework'],
      },
      agentRoles: [
        AgentRole.REQUIREMENTS,
        AgentRole.ARCHITECT,
        AgentRole.GAME,
        AgentRole.TESTER,
        AgentRole.DOCS,
        AgentRole.SUMMARIZER,
      ],
      prompts: {
        [AgentRole.GAME]: 'unity_game',
      },
      defaultStructure: {
        directories: [
          'Assets/Scripts',
          'Assets/Scenes',
          'Assets/Prefabs',
          'Assets/Materials',
          'Assets/Sprites',
          'Assets/Audio',
          'Assets/Tests',
        ],
      },
    });

    // iOS App Development
    this.register({
      id: 'ios-app',
      name: 'iOS App Development',
      description: 'Native iOS application development',
      category: 'Mobile',
      techStack: {
        frontend: ['Swift', 'SwiftUI'],
        database: ['CoreData', 'SQLite'],
        infrastructure: ['Firebase', 'Xcode'],
        testing: ['XCTest', 'XCUITest'],
        other: ['CocoaPods', 'SPM'],
      },
      agentRoles: [
        AgentRole.REQUIREMENTS,
        AgentRole.ARCHITECT,
        AgentRole.MOBILE,
        AgentRole.TESTER,
        AgentRole.DOCS,
        AgentRole.SUMMARIZER,
      ],
      prompts: {
        [AgentRole.MOBILE]: 'swift_ios',
      },
      defaultStructure: {
        directories: [
          'App/Sources/Views',
          'App/Sources/ViewModels',
          'App/Sources/Models',
          'App/Sources/Services',
          'App/Sources/Utilities',
          'App/Resources/Assets.xcassets',
          'App/Tests',
        ],
      },
    });

    // Android App Development
    this.register({
      id: 'android-app',
      name: 'Android App Development',
      description: 'Native Android application development',
      category: 'Mobile',
      techStack: {
        frontend: ['Kotlin', 'Jetpack Compose'],
        database: ['Room', 'SQLite'],
        infrastructure: ['Firebase', 'Gradle'],
        testing: ['JUnit', 'Espresso'],
        other: ['Android Studio', 'Kotlin Coroutines'],
      },
      agentRoles: [
        AgentRole.REQUIREMENTS,
        AgentRole.ARCHITECT,
        AgentRole.MOBILE,
        AgentRole.TESTER,
        AgentRole.DOCS,
        AgentRole.SUMMARIZER,
      ],
      prompts: {
        [AgentRole.MOBILE]: 'kotlin_android',
      },
      defaultStructure: {
        directories: [
          'app/src/main/java/com/app',
          'app/src/main/java/com/app/ui',
          'app/src/main/java/com/app/data',
          'app/src/main/java/com/app/domain',
          'app/src/main/res/layout',
          'app/src/main/res/values',
          'app/src/test',
          'app/src/androidTest',
        ],
      },
    });

    // API / Microservices
    this.register({
      id: 'api-microservices',
      name: 'API / Microservices',
      description: 'REST/gRPC API and microservices architecture',
      category: 'Backend',
      techStack: {
        backend: ['Go', 'gRPC', 'Protocol Buffers'],
        database: ['PostgreSQL', 'Redis'],
        infrastructure: ['Kubernetes', 'Helm', 'Docker', 'kind'],
        testing: ['Go testing', 'Testcontainers'],
        other: ['GitHub Actions', 'Prometheus', 'Grafana'],
      },
      agentRoles: [
        AgentRole.REQUIREMENTS,
        AgentRole.ARCHITECT,
        AgentRole.BACKEND,
        AgentRole.TESTER,
        AgentRole.DEVOPS,
        AgentRole.DOCS,
        AgentRole.SUMMARIZER,
      ],
      prompts: {
        [AgentRole.BACKEND]: 'go_backend',
      },
      defaultStructure: {
        directories: [
          'services/auth/cmd/server',
          'services/auth/internal',
          'services/user/cmd/server',
          'services/user/internal',
          'pkg/proto',
          'pkg/shared',
          'deployments/k8s',
          'deployments/helm',
          'scripts',
          '.github/workflows',
        ],
      },
    });

    // CLI Tools
    this.register({
      id: 'cli-tool',
      name: 'CLI Tools',
      description: 'Command-line interface applications',
      category: 'CLI',
      techStack: {
        backend: ['Go'],
        testing: ['Go testing'],
        other: ['Cobra', 'Viper', 'GitHub Actions'],
      },
      agentRoles: [
        AgentRole.REQUIREMENTS,
        AgentRole.ARCHITECT,
        AgentRole.BACKEND,
        AgentRole.TESTER,
        AgentRole.DOCS,
        AgentRole.SUMMARIZER,
      ],
      prompts: {
        [AgentRole.BACKEND]: 'cli_tool',
      },
      defaultStructure: {
        directories: ['cmd', 'internal/commands', 'internal/config', 'internal/utils', 'tests'],
      },
    });

    // Data Science / AI Tools
    this.register({
      id: 'data-science',
      name: 'Data Science / AI Tools',
      description: 'Data analysis and machine learning applications',
      category: 'Data Science',
      techStack: {
        backend: ['Python', 'FastAPI'],
        frontend: ['Streamlit', 'Plotly'],
        database: ['PostgreSQL', 'MongoDB'],
        testing: ['pytest', 'unittest'],
        other: ['Poetry', 'Jupyter', 'pandas', 'scikit-learn', 'TensorFlow'],
      },
      agentRoles: [
        AgentRole.REQUIREMENTS,
        AgentRole.ARCHITECT,
        AgentRole.BACKEND,
        AgentRole.FRONTEND,
        AgentRole.TESTER,
        AgentRole.DOCS,
        AgentRole.SUMMARIZER,
      ],
      prompts: {
        [AgentRole.BACKEND]: 'data_science',
      },
      defaultStructure: {
        directories: [
          'src/models',
          'src/data',
          'src/features',
          'src/visualization',
          'notebooks',
          'tests',
          'data/raw',
          'data/processed',
        ],
      },
    });

    // Desktop App
    this.register({
      id: 'desktop-app',
      name: 'Desktop App',
      description: 'Cross-platform desktop application',
      category: 'Desktop',
      techStack: {
        backend: ['Node.js', 'TypeScript'],
        frontend: ['React', 'Electron', 'TypeScript'],
        database: ['SQLite'],
        testing: ['Jest', 'Spectron'],
        other: ['Electron Builder', 'Webpack'],
      },
      agentRoles: [
        AgentRole.REQUIREMENTS,
        AgentRole.ARCHITECT,
        AgentRole.BACKEND,
        AgentRole.FRONTEND,
        AgentRole.TESTER,
        AgentRole.DOCS,
        AgentRole.SUMMARIZER,
      ],
      prompts: {
        [AgentRole.BACKEND]: 'go_backend',
        [AgentRole.FRONTEND]: 'react_frontend',
      },
      defaultStructure: {
        directories: [
          'src/main',
          'src/renderer/components',
          'src/renderer/pages',
          'src/shared',
          'resources',
          'build',
        ],
      },
    });
  }

  /**
   * Register a new purpose
   */
  register(purpose: Purpose): void {
    this.purposes.set(purpose.id, purpose);
  }

  /**
   * Get purpose by ID
   */
  get(purposeId: string): Purpose | undefined {
    return this.purposes.get(purposeId);
  }

  /**
   * Get all purposes
   */
  getAll(): Purpose[] {
    return Array.from(this.purposes.values());
  }

  /**
   * Get purposes by category
   */
  getByCategory(category: string): Purpose[] {
    return Array.from(this.purposes.values()).filter((p) => p.category === category);
  }

  /**
   * Search purposes
   */
  search(query: string): Purpose[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.purposes.values()).filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery) ||
        p.category.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set<string>();
    this.purposes.forEach((purpose) => categories.add(purpose.category));
    return Array.from(categories);
  }
}

// Singleton instance
export const purposeRegistry = new PurposeRegistry();

