import { BaseAgent, AgentInput, AgentOutput } from './base';
import { eventBus, EventType } from '../core/eventBus';
import { memoryStore } from '../core/memoryStore';

/**
 * TesterAgent - Implements testing strategy and test cases
 */
export class TesterAgent extends BaseAgent {
  constructor(systemPrompt?: string) {
    super('TesterAgent', systemPrompt || 'You are a senior QA engineer...');
    this.setupEventListeners();
  }

  /**
   * Execute testing
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
      const requirements = memoryStore.getArtifact(project.id, 'requirements');
      const architecture = memoryStore.getArtifact(project.id, 'architecture');

      // Generate test strategy
      const testStrategy = await this.generateTestStrategy(project);

      // Generate unit tests
      const unitTests = await this.generateUnitTests(project, architecture);

      // Generate integration tests
      const integrationTests = await this.generateIntegrationTests(project);

      // Generate E2E tests
      const e2eTests = await this.generateE2ETests(project, requirements);

      const testArtifacts = {
        strategy: testStrategy,
        unitTests,
        integrationTests,
        e2eTests,
        testConfig: this.generateTestConfig(project),
        ciConfig: this.generateCITestConfig(project),
      };

      // Store artifacts
      memoryStore.storeArtifact(project.id, 'tests', testArtifacts);

      return {
        success: true,
        result: testArtifacts,
        artifacts: testArtifacts,
        message: 'Testing implementation completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Generate test strategy
   */
  private async generateTestStrategy(project: any): Promise<any> {
    return {
      approach: 'Test Pyramid',
      levels: [
        {
          name: 'Unit Tests',
          coverage: '80%',
          description: 'Test individual functions and components',
        },
        {
          name: 'Integration Tests',
          coverage: '60%',
          description: 'Test interactions between components',
        },
        {
          name: 'E2E Tests',
          coverage: 'Critical paths',
          description: 'Test complete user workflows',
        },
      ],
      tools: this.getTestingTools(project),
    };
  }

  /**
   * Get testing tools by project type
   */
  private getTestingTools(project: any): string[] {
    const toolsByPurpose: Record<string, string[]> = {
      'web-development': ['Jest', 'React Testing Library', 'Playwright', 'Supertest'],
      'game-development': ['Unity Test Framework', 'NUnit'],
      'ios-app': ['XCTest', 'XCUITest'],
      'android-app': ['JUnit', 'Espresso', 'MockK'],
      'api-microservices': ['Go testing', 'Testcontainers', 'Postman'],
      'cli-tool': ['Go testing'],
      'data-science': ['pytest', 'unittest'],
      'desktop-app': ['Jest', 'Spectron'],
    };

    return toolsByPurpose[project.purposeId] || ['Jest'];
  }

  /**
   * Generate unit tests
   */
  private async generateUnitTests(project: any, architecture: any): Promise<any[]> {
    return [
      {
        name: 'User Service Tests',
        file: 'tests/unit/userService.test.ts',
        code: `
describe('UserService', () => {
  let userService: UserService;
  
  beforeEach(() => {
    userService = new UserService();
  });
  
  test('should create a new user', async () => {
    const userData = { email: 'test@example.com', password: 'password123' };
    const user = await userService.createUser(userData);
    
    expect(user).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
  
  test('should throw error for duplicate email', async () => {
    const userData = { email: 'test@example.com', password: 'password123' };
    await userService.createUser(userData);
    
    await expect(userService.createUser(userData)).rejects.toThrow();
  });
});
`,
      },
    ];
  }

  /**
   * Generate integration tests
   */
  private async generateIntegrationTests(project: any): Promise<any[]> {
    return [
      {
        name: 'API Integration Tests',
        file: 'tests/integration/api.test.ts',
        code: `
describe('API Integration Tests', () => {
  test('POST /api/auth/login - successful login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'password' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });
  
  test('GET /api/user/profile - authenticated request', async () => {
    const token = 'valid-token';
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', \`Bearer \${token}\`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email');
  });
});
`,
      },
    ];
  }

  /**
   * Generate E2E tests
   */
  private async generateE2ETests(project: any, requirements: any): Promise<any[]> {
    if (project.purposeId.includes('web') || project.purposeId.includes('app')) {
      return [
        {
          name: 'User Registration Flow',
          file: 'tests/e2e/registration.spec.ts',
          code: `
import { test, expect } from '@playwright/test';

test.describe('User Registration', () => {
  test('should complete registration flow', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Sign Up');
    
    await page.fill('[name="email"]', 'newuser@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome')).toBeVisible();
  });
});
`,
        },
      ];
    }

    return [];
  }

  /**
   * Generate test config
   */
  private generateTestConfig(project: any): any {
    return {
      file: 'jest.config.js',
      content: `
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
`,
    };
  }

  /**
   * Generate CI test config
   */
  private generateCITestConfig(project: any): any {
    return {
      file: '.github/workflows/test.yml',
      content: `
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
`,
    };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    eventBus.on(EventType.PHASE_TESTING_START, async () => {
      const result = await this.execute({});

      eventBus.emit(EventType.PHASE_TESTING_COMPLETE, {
        timestamp: Date.now(),
        phase: 'testing',
        result: result.result,
        artifacts: result.artifacts,
        source: 'TesterAgent',
      });
    });
  }
}

