# Contributing to Auto Cursor

Thank you for your interest in contributing to Auto Cursor! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- Clear, descriptive title
- Detailed steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable
- Environment details (OS, Node version, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- Clear, descriptive title
- Detailed description of the proposed feature
- Explanation of why this enhancement would be useful
- Possible implementation approach

### Pull Requests

1. **Fork the repository** and create your branch from `main`:
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes** following our coding standards:
   - Write clear, descriptive commit messages
   - Follow existing code style
   - Add tests for new features
   - Update documentation as needed

3. **Test your changes**:
   ```bash
   npm test
   npm run lint
   npm run build
   ```

4. **Commit using conventional commits**:
   ```bash
   git commit -m "feat: add new feature"
   git commit -m "fix: resolve bug"
   git commit -m "docs: update README"
   ```

5. **Push to your fork** and submit a pull request:
   ```bash
   git push origin feature/my-feature
   ```

## Development Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/autocursor.git
cd autocursor

# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test
```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Provide proper type annotations
- Avoid `any` types
- Use interfaces over type aliases when possible

### Code Style

- 2 spaces for indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multiline objects/arrays
- Max line length: 100 characters

### Naming Conventions

- **Classes**: PascalCase (`UserAgent`, `EventBus`)
- **Functions/Methods**: camelCase (`getUserData`, `processEvent`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_TIMEOUT`)
- **Interfaces**: PascalCase with descriptive names (`AgentConfig`, `ProjectContext`)
- **Files**: kebab-case for files, PascalCase for React components

### Documentation

- Add JSDoc comments for public APIs
- Include examples in documentation
- Update README for significant changes
- Add inline comments for complex logic

## Project Structure

```
src/
├── core/          # Core systems (EventBus, MemoryStore, etc.)
├── agents/        # Agent implementations
├── registry/      # Purpose and configuration registry
├── prompts/       # System prompts for different stacks
├── ui/            # React UI components
└── utils/         # Utility functions
```

## Testing

### Writing Tests

- Write tests for new features
- Maintain test coverage above 80%
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- agents/lead.test.ts

# Watch mode
npm test -- --watch
```

## Adding New Purposes

To add a new project purpose:

1. **Update `src/registry/purposes.ts`**:
   ```typescript
   purposeRegistry.register({
     id: 'my-purpose',
     name: 'My Purpose',
     description: 'Description',
     category: 'Category',
     techStack: { /* ... */ },
     agentRoles: [/* ... */],
     prompts: { /* ... */ },
   });
   ```

2. **Create system prompts** in `src/prompts/`:
   - Create `my_stack.md` with agent instructions
   - Follow existing prompt format

3. **Add tests** for the new purpose

4. **Update documentation** in README.md

## Adding New Agents

To add a new agent type:

1. **Create agent class** in `src/agents/`:
   ```typescript
   export class MyAgent extends BaseAgent {
     constructor(systemPrompt?: string) {
       super('MyAgent', systemPrompt || 'Default prompt');
     }
     
     async execute(input: AgentInput): Promise<AgentOutput> {
       // Implementation
     }
   }
   ```

2. **Add to AgentRole enum** in `src/core/agentManager.ts`

3. **Update orchestrator** in `src/utils/orchestrator.ts`

4. **Write tests** for the agent

5. **Update documentation**

## Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process or auxiliary tool changes

### Examples

```
feat(agents): add code review agent

Implements a new agent that performs automated code reviews
using static analysis and best practices checking.

Closes #123
```

```
fix(eventBus): resolve memory leak in event listeners

Event listeners were not being properly cleaned up when
agents were destroyed, causing memory leaks over time.
```

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag v1.0.0`
4. Push tag: `git push origin v1.0.0`
5. Create GitHub release

## Questions?

- Open a [GitHub Discussion](https://github.com/your-org/autocursor/discussions)
- Join our [Discord community](https://discord.gg/autocursor)
- Email: support@autocursor.dev

Thank you for contributing to Auto Cursor! 🎉

