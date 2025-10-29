# Auto Cursor

> **Autonomous, event-driven multi-agent orchestration plugin for Cursor IDE**

Build complete software projects through natural conversation. No commands, no syntax—just talk to an AI and watch your project come to life.

<div align="center">
  <img src="https://img.shields.io/badge/🚀_Auto_Cursor-Autonomous_AI_Development-blue?style=for-the-badge" alt="Auto Cursor" />
</div>

[![CI](https://github.com/autocursor/autocursor/actions/workflows/ci.yml/badge.svg)](https://github.com/autocursor/autocursor/actions/workflows/ci.yml)
[![NPM Version](https://img.shields.io/npm/v/auto-cursor.svg)](https://www.npmjs.com/package/auto-cursor)
[![NPM Downloads](https://img.shields.io/npm/dm/auto-cursor.svg)](https://www.npmjs.com/package/auto-cursor)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![codecov](https://codecov.io/gh/autocursor/autocursor/branch/main/graph/badge.svg)](https://codecov.io/gh/autocursor/autocursor)

---

## Core Concept

**Auto Cursor** is a single-chat, multi-agent orchestration system that enables full software project creation through natural conversation.

The user talks to **one visible agent** (the "Lead Agent"), selecting only a project purpose at the beginning:

- "I want to build a 2D platformer game."
- "Let's make a SaaS analytics dashboard."
- "Let's create an iOS fitness tracker."

From that point, the plugin:

1. **[Dynamic]** Creates specialized agent teams for that purpose
2. **[Intelligent]** Chooses an optimal tech stack automatically
3. **[Autonomous]** Manages all roles (analyst, architect, devs, testers, etc.) invisibly
4. **[Continuous]** Progresses through the entire SDLC autonomously
5. **[Natural]** Keeps all user communication natural and context-aware

**The user never issues commands, selects agents, or types special syntax.**

---

## Architecture

### Main Components

| Component | Description |
|-----------|-------------|
| **LeadAgent** | The only visible agent. Interfaces with user and summarizes system activity. |
| **EventBus** | Internal pub/sub system for communication between agents. |
| **AgentManager** | Creates and supervises worker agents dynamically based on selected purpose. |
| **WorkerAgents** | Role-based hidden AI agents (Analyst, Architect, Developer, Tester, DevOps, etc.) |
| **PurposeRegistry** | Defines supported domains (Web, Mobile, Game, API, CLI, etc.) and their tech stacks. |
| **AutoFlow Engine** | Determines workflow order and triggers next phases automatically. |
| **MemoryStore** | Persists shared project context and artifacts. |
| **UI Layer** | Single chat panel in Cursor where the user interacts naturally. |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Interface                        │
│                  (Single Chat Panel)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       Lead Agent                             │
│          (Only visible agent to the user)                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                       Event Bus                              │
│          (Pub/Sub communication system)                      │
└────────┬───────┬───────┬────────┬───────┬───────┬──────────┘
         │       │       │        │       │       │
         ▼       ▼       ▼        ▼       ▼       ▼
    ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐
    │Requi│ │Arch │ │Dev  │ │Test │ │Ops  │ │Docs │
    │reme │ │itec │ │Agen │ │Agen │ │Agen │ │Agen │
    │nts  │ │t    │ │ts   │ │t    │ │t    │ │t    │
    └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘ └──┬──┘
       │       │       │        │       │       │
       └───────┴───────┴────────┴───────┴───────┘
                         │
                         ▼
              ┌──────────────────────┐
              │    Memory Store      │
              │  (Project Context)   │
              └──────────────────────┘
```

---

## Supported Project Types

| Purpose | Backend | Frontend/Client | Extras |
|---------|---------|-----------------|--------|
| **Web Development** | Go / PostgreSQL | React / Next.js | TailwindCSS, Docker, GitHub Actions |
| **Game Development** | Unity (C#) or Godot (GDScript) | — | Asset pipeline, Scene builder |
| **iOS App** | Swift / SwiftUI | — | CoreData, Firebase, Xcode build |
| **Android App** | Kotlin / Jetpack Compose | — | Gradle, Firebase, Room DB |
| **API / Microservices** | Go + gRPC | — | Kubernetes (kind), Helm, GitHub Actions |
| **CLI Tools** | Go | — | Cobra, Viper, Build scripts |
| **Data Science / AI** | Python / FastAPI | Streamlit | Poetry, Jupyter, pandas, scikit-learn |
| **Desktop App** | Electron + React | Node.js backend | SQLite, Electron Builder |

Each purpose dynamically determines:
- Which roles to spawn
- Which base templates to use
- Which tech stack prompts to load
- Which sequence of events to follow

---

## Event-Driven Flow

1. User selects a purpose (via dropdown or first chat message)
2. **LeadAgent** emits `purpose.selected` event
3. **AgentManager** loads corresponding stack and creates role agents
4. **RequirementsAgent** → **ArchitectAgent** → **DeveloperAgents** → **TesterAgent** → **DevOpsAgent** operate in sequence
5. **Summarizer** aggregates results
6. **LeadAgent** replies to user conversationally with progress or output

---

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/autocursor.git
cd autocursor

# Install dependencies
npm install

# Build the plugin
npm run build
```

### Usage

#### 1. Integrate with Cursor IDE

Add to your Cursor plugin configuration:

```typescript
import { activate, deactivate } from 'autocursor';

export { activate, deactivate };
```

#### 2. Programmatic Usage

```typescript
import { autoCursor, AutoCursor } from 'autocursor';

// Initialize
await autoCursor.initialize();

// Get Lead Agent
const leadAgent = autoCursor.getLeadAgent();

// Process user message
const result = await leadAgent.execute({
  userMessage: "I want to build a web application"
});

console.log(result.message);
```

#### 3. React Component

```tsx
import { ChatPanel } from 'autocursor';

function App() {
  return (
    <ChatPanel 
      onProjectCreated={(project) => {
        console.log('Project created:', project);
      }}
    />
  );
}
```

---

## Project Structure

```
src/
├── core/
│   ├── eventBus.ts          # Event pub/sub system
│   ├── agentManager.ts      # Agent lifecycle management
│   ├── autoFlow.ts          # Workflow orchestration
│   └── memoryStore.ts       # Project persistence
├── registry/
│   └── purposes.ts          # Purpose-to-stack mappings
├── agents/
│   ├── base.ts              # Base agent class
│   ├── lead.ts              # Lead agent (user-facing)
│   ├── requirements.ts      # Requirements analyst
│   ├── architect.ts         # System architect
│   ├── backend.ts           # Backend developer
│   ├── frontend.ts          # Frontend developer
│   ├── mobile.ts            # Mobile developer
│   ├── game.ts              # Game developer
│   ├── tester.ts            # QA engineer
│   ├── devops.ts            # DevOps engineer
│   ├── docs.ts              # Technical writer
│   └── summarizer.ts        # Result summarizer
├── prompts/
│   ├── lead_agent.md        # Lead agent system prompt
│   ├── go_backend.md        # Go backend prompt
│   ├── react_frontend.md    # React frontend prompt
│   ├── swift_ios.md         # Swift iOS prompt
│   ├── unity_game.md        # Unity game prompt
│   ├── kotlin_android.md    # Kotlin Android prompt
│   ├── data_science.md      # Data science prompt
│   └── cli_tool.md          # CLI tool prompt
├── ui/
│   └── chatPanel.tsx        # Chat interface component
├── utils/
│   └── orchestrator.ts      # Agent orchestration utilities
└── index.ts                 # Main entry point
```

---

## Interaction Examples

### Example 1: Starting a Web Project

**User:** "I want to build a task management web app"

**Auto Cursor:** "Great! I'll help you build a web application project. I'm setting up a team to work on this with the following tech stack:
- Backend: Go, PostgreSQL, Redis
- Frontend: React, Next.js, TypeScript, TailwindCSS
- Infrastructure: Docker, Nginx

Let me gather some requirements and get started. This will just take a moment..."

*[System autonomously progresses through all phases]*

**Auto Cursor:** "✓ Your project is ready! I've completed:
- Requirements analysis
- Architecture design
- Backend API with authentication
- Frontend UI with responsive design
- Comprehensive test suite
- Docker deployment configuration
- Complete documentation

All files have been generated and organized in your project directory."

### Example 2: Pivoting Mid-Project

**User:** "Actually, make it a mobile app instead"

**Auto Cursor:** "No problem! I'll pivot the approach to a mobile application. Would you prefer iOS or Android?"

**User:** "iOS"

**Auto Cursor:** "Perfect! I'm reconfiguring the team for iOS development using Swift and SwiftUI. Let me adjust the architecture and implementation..."

---

## Configuration

### Custom Purpose Registration

```typescript
import { purposeRegistry } from 'autocursor';

purposeRegistry.register({
  id: 'custom-stack',
  name: 'Custom Stack',
  description: 'My custom tech stack',
  category: 'Web',
  techStack: {
    backend: ['Python', 'Django'],
    frontend: ['Vue.js'],
    database: ['MongoDB'],
  },
  agentRoles: [
    AgentRole.REQUIREMENTS,
    AgentRole.ARCHITECT,
    AgentRole.BACKEND,
    AgentRole.FRONTEND,
    AgentRole.TESTER,
  ],
  prompts: {
    backend: 'custom_python_prompt',
    frontend: 'custom_vue_prompt',
  },
});
```

### Custom Workflow

```typescript
import { autoFlow } from 'autocursor';

autoFlow.registerWorkflow('custom-workflow', [
  {
    name: 'analysis',
    agentRoles: [AgentRole.REQUIREMENTS],
    startEvent: EventType.PHASE_REQUIREMENTS_START,
    completeEvent: EventType.PHASE_REQUIREMENTS_COMPLETE,
    nextPhase: 'design',
  },
  // ... more phases
]);
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

---

## 📦 Building

```bash
# Development build
npm run build

# Watch mode
npm run watch

# Production build
npm run build --production
```

---

## Key Features

### ► Zero-Command UX
Users only chat—no special syntax or commands needed.

### ► Dynamic Team Creation
Agents spawn automatically based on selected purpose.

### ► Auto Summarization
Lead Agent condenses inter-agent logs into natural replies.

### ► Persistent Memory
Project context stored as JSON per session.

### ► Auto Tech Stack Setup
Loads prompts and templates matching the chosen purpose.

### ► Extensible
New purposes and stacks can be added by editing `purposes.ts`.

### ► Integrated Workflows
Uses Makefile and GitHub Actions templates within generated projects.

---

## API Reference

### Core Classes

#### `AutoCursor`

Main plugin class.

```typescript
const autoCursor = new AutoCursor();
await autoCursor.initialize();
```

**Methods:**
- `initialize(): Promise<void>` - Initialize the system
- `getLeadAgent(): LeadAgent` - Get Lead Agent instance
- `getCurrentProject(): ProjectContext | null` - Get current project
- `getPurposes(): Purpose[]` - Get all available purposes
- `shutdown(): Promise<void>` - Cleanup and shutdown

#### `LeadAgent`

User-facing agent.

```typescript
const leadAgent = new LeadAgent();
const result = await leadAgent.execute({ userMessage: "Hello" });
```

#### `EventBus`

Event communication system.

```typescript
import { eventBus, EventType } from 'autocursor';

eventBus.on(EventType.PURPOSE_SELECTED, (payload) => {
  console.log('Purpose selected:', payload.purposeName);
});

eventBus.emit(EventType.USER_MESSAGE, {
  timestamp: Date.now(),
  message: "Hello",
  sessionId: "123",
});
```

---

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Clone your fork
3. Install dependencies: `npm install`
4. Create a branch: `git checkout -b feature/my-feature`
5. Make changes and test: `npm test`
6. Commit: `git commit -m "feat: add new feature"`
7. Push: `git push origin feature/my-feature`
8. Create a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- Built with TypeScript, React, and modern web technologies
- Inspired by autonomous agent systems and LLM orchestration patterns
- Special thanks to the Cursor IDE team

---

## Support

- **Issues:** [GitHub Issues](https://github.com/your-org/autocursor/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/autocursor/discussions)
- **Documentation:** [Full Documentation](https://autocursor.dev/docs)

---

## Roadmap

- [ ] Integration with Claude/GPT APIs for real AI execution
- [ ] Visual project dashboard
- [ ] Template marketplace
- [ ] Multi-project management
- [ ] Real-time collaboration
- [ ] Plugin ecosystem
- [ ] VS Code extension
- [ ] Cloud deployment integration

---

**Built with ❤️ by the Auto Cursor Team**

*Making software development as simple as having a conversation.*

