import { BaseAgent, AgentInput, AgentOutput } from './base';
import { memoryStore } from '../core/memoryStore';

/**
 * FrontendAgent - Implements frontend/client-side code
 */
export class FrontendAgent extends BaseAgent {
  constructor(systemPrompt?: string) {
    super('FrontendAgent', systemPrompt || 'You are a senior frontend developer...');
  }

  /**
   * Execute frontend development
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
      // Get architecture and requirements
      const architecture = memoryStore.getArtifact(project.id, 'architecture');
      const requirements = memoryStore.getArtifact(project.id, 'requirements');

      // Generate component structure
      const componentStructure = await this.generateComponentStructure(project);

      // Generate UI components
      const uiComponents = await this.generateUIComponents(project, requirements);

      // Generate routing
      const routing = await this.generateRouting(project);

      // Generate state management
      const stateManagement = await this.generateStateManagement(project);

      const frontendArtifacts = {
        componentStructure,
        uiComponents,
        routing,
        stateManagement,
        styling: this.generateStyling(project),
        configFiles: this.generateConfigFiles(project),
      };

      // Store artifacts
      memoryStore.storeArtifact(project.id, 'frontend', frontendArtifacts);

      return {
        success: true,
        result: frontendArtifacts,
        artifacts: frontendArtifacts,
        message: 'Frontend development completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  /**
   * Generate component structure
   */
  private async generateComponentStructure(project: any): Promise<any> {
    return {
      directories: [
        'src/components/common',
        'src/components/layout',
        'src/pages',
        'src/hooks',
        'src/services',
        'src/utils',
        'src/styles',
        'src/types',
      ],
      mainFiles: ['src/App.tsx', 'src/index.tsx', 'src/main.tsx'],
    };
  }

  /**
   * Generate UI components
   */
  private async generateUIComponents(project: any, requirements: any): Promise<any[]> {
    return [
      {
        name: 'Button',
        path: 'src/components/common/Button.tsx',
        code: this.generateButtonComponent(),
      },
      {
        name: 'Layout',
        path: 'src/components/layout/Layout.tsx',
        code: this.generateLayoutComponent(),
      },
      {
        name: 'HomePage',
        path: 'src/pages/HomePage.tsx',
        code: this.generateHomePageComponent(),
      },
    ];
  }

  /**
   * Generate Button component
   */
  private generateButtonComponent(): string {
    return `
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={\`btn btn-\${variant}\`}
    >
      {children}
    </button>
  );
};
`;
  }

  /**
   * Generate Layout component
   */
  private generateLayoutComponent(): string {
    return `
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <header className="header">
        <nav>App Navigation</nav>
      </header>
      <main className="main-content">{children}</main>
      <footer className="footer">© 2025 App</footer>
    </div>
  );
};
`;
  }

  /**
   * Generate HomePage component
   */
  private generateHomePageComponent(): string {
    return `
import React from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';

export const HomePage: React.FC = () => {
  return (
    <Layout>
      <div className="home-page">
        <h1>Welcome to the App</h1>
        <Button onClick={() => console.log('Clicked')}>
          Get Started
        </Button>
      </div>
    </Layout>
  );
};
`;
  }

  /**
   * Generate routing
   */
  private async generateRouting(project: any): Promise<any> {
    return {
      routes: [
        { path: '/', component: 'HomePage' },
        { path: '/login', component: 'LoginPage' },
        { path: '/dashboard', component: 'DashboardPage' },
      ],
      routerConfig: `
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
};
`,
    };
  }

  /**
   * Generate state management
   */
  private async generateStateManagement(project: any): Promise<any> {
    return {
      approach: 'React Context + Hooks',
      stores: [
        { name: 'AuthContext', state: ['user', 'isAuthenticated', 'loading'] },
        { name: 'AppContext', state: ['theme', 'language'] },
      ],
    };
  }

  /**
   * Generate styling
   */
  private generateStyling(project: any): any {
    return {
      approach: 'TailwindCSS + CSS Modules',
      files: [
        { name: 'tailwind.config.js', content: 'module.exports = { content: ["./src/**/*.{js,jsx,ts,tsx}"], theme: { extend: {} } }' },
        { name: 'src/styles/globals.css', content: '@tailwind base;\n@tailwind components;\n@tailwind utilities;' },
      ],
    };
  }

  /**
   * Generate config files
   */
  private generateConfigFiles(project: any): any[] {
    return [
      {
        name: 'package.json',
        content: JSON.stringify(
          {
            name: 'frontend',
            version: '1.0.0',
            dependencies: {
              react: '^18.2.0',
              'react-dom': '^18.2.0',
              'react-router-dom': '^6.20.0',
            },
            devDependencies: {
              typescript: '^5.3.0',
              vite: '^5.0.0',
              tailwindcss: '^3.4.0',
            },
          },
          null,
          2
        ),
      },
      {
        name: 'vite.config.ts',
        content: `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
});
`,
      },
    ];
  }
}

