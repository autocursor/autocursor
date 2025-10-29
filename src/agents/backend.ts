import { BaseAgent, AgentInput, AgentOutput } from './base';
import { eventBus, EventType } from '../core/eventBus';
import { memoryStore } from '../core/memoryStore';

/**
 * BackendAgent - Implements backend/server-side code
 */
export class BackendAgent extends BaseAgent {
  constructor(systemPrompt?: string) {
    super('BackendAgent', systemPrompt || 'You are a senior backend developer...');
  }

  /**
   * Execute backend development
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
      // Get architecture
      const architecture = memoryStore.getArtifact(project.id, 'architecture');

      // Generate backend code structure
      const codeStructure = await this.generateCodeStructure(project, architecture);

      // Generate API endpoints
      const apiEndpoints = await this.generateAPIEndpoints(project, architecture);

      // Generate database schemas
      const dbSchemas = await this.generateDatabaseSchemas(project, architecture);

      // Generate business logic
      const businessLogic = await this.generateBusinessLogic(project);

      const backendArtifacts = {
        codeStructure,
        apiEndpoints,
        databaseSchemas: dbSchemas,
        businessLogic,
        configFiles: this.generateConfigFiles(project),
      };

      // Store artifacts
      memoryStore.storeArtifact(project.id, 'backend', backendArtifacts);

      return {
        success: true,
        result: backendArtifacts,
        artifacts: backendArtifacts,
        message: 'Backend development completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Generate code structure
   */
  private async generateCodeStructure(project: any, architecture: any): Promise<any> {
    return {
      directories: [
        'cmd/server',
        'internal/handlers',
        'internal/models',
        'internal/services',
        'internal/database',
        'internal/middleware',
        'pkg/utils',
      ],
      mainFiles: ['cmd/server/main.go', 'internal/handlers/routes.go'],
    };
  }

  /**
   * Generate API endpoints
   */
  private async generateAPIEndpoints(project: any, architecture: any): Promise<any[]> {
    const endpoints = architecture?.apiContracts || [];

    return endpoints.map((endpoint: any) => ({
      ...endpoint,
      implementation: this.generateEndpointCode(endpoint),
    }));
  }

  /**
   * Generate endpoint code (simplified)
   */
  private generateEndpointCode(endpoint: any): string {
    return `
// ${endpoint.method} ${endpoint.path}
// Description: ${endpoint.description}
func Handle${endpoint.path.replace(/\//g, '_')}(w http.ResponseWriter, r *http.Request) {
    // Implementation here
    w.WriteHeader(http.StatusOK)
    json.NewEncoder(w).Encode(map[string]interface{}{
        "message": "Success",
    })
}
`;
  }

  /**
   * Generate database schemas
   */
  private async generateDatabaseSchemas(project: any, architecture: any): Promise<any> {
    const dataModels = architecture?.dataModels || [];

    return {
      migrations: dataModels.map((model: any) => ({
        name: `create_${model.name.toLowerCase()}_table`,
        sql: this.generateMigrationSQL(model),
      })),
    };
  }

  /**
   * Generate migration SQL
   */
  private generateMigrationSQL(model: any): string {
    const fields = model.fields.map((field: string) => {
      if (field === 'id') return 'id SERIAL PRIMARY KEY';
      if (field.includes('_at')) return `${field} TIMESTAMP DEFAULT CURRENT_TIMESTAMP`;
      if (field.includes('_id')) return `${field} INTEGER REFERENCES ${field.replace('_id', '')}(id)`;
      return `${field} VARCHAR(255)`;
    });

    return `CREATE TABLE ${model.name.toLowerCase()}s (\n  ${fields.join(',\n  ')}\n);`;
  }

  /**
   * Generate business logic
   */
  private async generateBusinessLogic(project: any): Promise<any> {
    return {
      services: [
        { name: 'AuthService', methods: ['Login', 'Logout', 'ValidateToken'] },
        { name: 'UserService', methods: ['CreateUser', 'GetUser', 'UpdateUser', 'DeleteUser'] },
      ],
    };
  }

  /**
   * Generate config files
   */
  private generateConfigFiles(project: any): any[] {
    return [
      {
        name: 'config.yaml',
        content: `
server:
  port: 8080
  host: localhost

database:
  host: localhost
  port: 5432
  name: appdb
  user: postgres
  password: \${DB_PASSWORD}

redis:
  host: localhost
  port: 6379
`,
      },
      {
        name: 'Dockerfile',
        content: `
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go mod download
RUN go build -o server cmd/server/main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/server .
EXPOSE 8080
CMD ["./server"]
`,
      },
    ];
  }
}

