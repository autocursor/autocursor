import { BaseAgent, AgentInput, AgentOutput } from './base';
import { eventBus, EventType } from '../core/eventBus';
import { memoryStore } from '../core/memoryStore';

/**
 * DevOpsAgent - Sets up CI/CD pipelines and infrastructure
 */
export class DevOpsAgent extends BaseAgent {
  constructor(systemPrompt?: string) {
    super('DevOpsAgent', systemPrompt || 'You are a senior DevOps engineer...');
    this.setupEventListeners();
  }

  /**
   * Execute DevOps setup
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
      // Generate CI/CD pipelines
      const cicdPipelines = await this.generateCICDPipelines(project);

      // Generate Docker configuration
      const dockerConfig = await this.generateDockerConfig(project);

      // Generate Kubernetes manifests
      const k8sManifests = await this.generateK8sManifests(project);

      // Generate infrastructure as code
      const infrastructure = await this.generateInfrastructureCode(project);

      const devopsArtifacts = {
        cicd: cicdPipelines,
        docker: dockerConfig,
        kubernetes: k8sManifests,
        infrastructure,
        monitoring: this.generateMonitoringConfig(project),
      };

      // Store artifacts
      memoryStore.storeArtifact(project.id, 'devops', devopsArtifacts);

      return {
        success: true,
        result: devopsArtifacts,
        artifacts: devopsArtifacts,
        message: 'DevOps setup completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Generate CI/CD pipelines
   */
  private async generateCICDPipelines(project: any): Promise<any[]> {
    const pipelines = [
      {
        name: 'build.yml',
        path: '.github/workflows/build.yml',
        content: `
name: Build and Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Lint
        run: npm run lint
      
      - name: Build
        run: npm run build
      
      - name: Test
        run: npm test -- --coverage
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build
          path: dist/
`,
      },
      {
        name: 'deploy.yml',
        path: '.github/workflows/deploy.yml',
        content: `
name: Deploy

on:
  push:
    branches: [ main ]
    tags:
      - 'v*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: docker build -t app:latest .
      
      - name: Push to registry
        run: |
          echo \${{ secrets.DOCKER_PASSWORD }} | docker login -u \${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push app:latest
      
      - name: Deploy to production
        run: |
          kubectl apply -f k8s/
`,
      },
    ];

    return pipelines;
  }

  /**
   * Generate Docker configuration
   */
  private async generateDockerConfig(project: any): Promise<any> {
    return {
      dockerfile: {
        name: 'Dockerfile',
        content: `
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package*.json ./

ENV NODE_ENV=production
EXPOSE 8080

CMD ["node", "dist/index.js"]
`,
      },
      dockerCompose: {
        name: 'docker-compose.yml',
        content: `
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - REDIS_HOST=redis
    depends_on:
      - postgres
      - redis
  
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: \${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
`,
      },
      dockerignore: {
        name: '.dockerignore',
        content: `
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.DS_Store
coverage
dist
`,
      },
    };
  }

  /**
   * Generate Kubernetes manifests
   */
  private async generateK8sManifests(project: any): Promise<any[]> {
    if (
      project.purposeId === 'api-microservices' ||
      project.purposeId === 'web-development'
    ) {
      return [
        {
          name: 'deployment.yaml',
          content: `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
  labels:
    app: app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: app
  template:
    metadata:
      labels:
        app: app
    spec:
      containers:
      - name: app
        image: app:latest
        ports:
        - containerPort: 8080
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "256Mi"
            cpu: "200m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
`,
        },
        {
          name: 'service.yaml',
          content: `
apiVersion: v1
kind: Service
metadata:
  name: app-service
spec:
  selector:
    app: app
  ports:
  - protocol: TCP
    port: 80
    targetPort: 8080
  type: LoadBalancer
`,
        },
        {
          name: 'ingress.yaml',
          content: `
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: app.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: app-service
            port:
              number: 80
`,
        },
      ];
    }

    return [];
  }

  /**
   * Generate infrastructure as code
   */
  private async generateInfrastructureCode(project: any): Promise<any> {
    return {
      makefile: {
        name: 'Makefile',
        content: `
.PHONY: build test deploy clean

build:
\tdocker build -t app:latest .

test:
\tdocker-compose -f docker-compose.test.yml up --abort-on-container-exit

deploy:
\tkubectl apply -f k8s/

clean:
\tdocker-compose down -v
\tdocker rmi app:latest

dev:
\tdocker-compose up

logs:
\tkubectl logs -f deployment/app

status:
\tkubectl get pods,svc,ingress
`,
      },
    };
  }

  /**
   * Generate monitoring config
   */
  private generateMonitoringConfig(project: any): any {
    return {
      prometheus: {
        name: 'prometheus.yml',
        content: `
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'app'
    static_configs:
      - targets: ['app:8080']
`,
      },
      grafana: {
        dashboard: 'Application Metrics Dashboard',
        metrics: ['Request Rate', 'Error Rate', 'Response Time', 'CPU Usage', 'Memory Usage'],
      },
    };
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    eventBus.on(EventType.PHASE_DEVOPS_START, async () => {
      const result = await this.execute({});

      eventBus.emit(EventType.PHASE_DEVOPS_COMPLETE, {
        timestamp: Date.now(),
        phase: 'devops',
        result: result.result,
        artifacts: result.artifacts,
        source: 'DevOpsAgent',
      });
    });
  }
}

