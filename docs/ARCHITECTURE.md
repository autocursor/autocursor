# Auto Cursor Architecture

## Overview

Auto Cursor is built on a sophisticated event-driven, multi-agent architecture designed for autonomous software project generation through natural conversation.

## Core Principles

1. **Event-Driven**: All inter-component communication happens through events
2. **Agent-Based**: Specialized agents handle different aspects of development
3. **User-Centric**: Single conversational interface hides system complexity
4. **Autonomous**: System progresses through SDLC without user intervention
5. **Extensible**: New purposes and agents can be easily added

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        User Layer                            │
│  - Chat Interface (React)                                    │
│  - Natural language input                                    │
│  - Visual feedback                                           │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Orchestration Layer                       │
│  - Lead Agent (User-facing)                                  │
│  - Purpose Detection                                         │
│  - Response Synthesis                                        │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Event Bus Layer                         │
│  - Event publishing                                          │
│  - Event subscription                                        │
│  - Event history                                             │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
         ▼               ▼               ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Agent     │  │   Workflow  │  │   Memory    │
│  Manager    │  │   Engine    │  │   Store     │
└─────────────┘  └─────────────┘  └─────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                      Worker Agents                           │
│  Requirements | Architect | Backend | Frontend | ...         │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Event Bus

**Responsibility**: Central pub/sub communication system

**Features**:
- Type-safe event publishing and subscription
- Event history tracking
- Async event handling
- Event filtering

**Key Events**:
- `PURPOSE_SELECTED`: User selects a project purpose
- `PROJECT_CREATED`: New project initialized
- `PHASE_*_START`: Phase begins
- `PHASE_*_COMPLETE`: Phase completes
- `AGENT_*`: Agent lifecycle events

**Usage**:
```typescript
// Publishing
eventBus.emit(EventType.PURPOSE_SELECTED, {
  timestamp: Date.now(),
  purposeId: 'web-development',
  purposeName: 'Web Development',
});

// Subscribing
eventBus.on(EventType.PHASE_REQUIREMENTS_COMPLETE, (payload) => {
  console.log('Requirements completed:', payload);
});
```

### 2. Agent Manager

**Responsibility**: Creates and manages agent lifecycle

**Features**:
- Dynamic agent creation based on purpose
- Agent status tracking
- Agent execution coordination
- Statistics collection

**Agent States**:
- `idle`: Agent created but not working
- `working`: Agent currently executing
- `completed`: Agent finished successfully
- `failed`: Agent encountered error

### 3. Memory Store

**Responsibility**: Persistent project context storage

**Features**:
- Project context management
- Phase tracking
- Artifact storage
- Conversation history
- File-based persistence

**Data Structure**:
```typescript
interface ProjectContext {
  id: string;
  purposeId: string;
  purposeName: string;
  techStack: TechStack;
  status: ProjectStatus;
  phases: Record<string, PhaseData>;
  artifacts: Record<string, any>;
  conversationHistory: ConversationEntry[];
}
```

### 4. AutoFlow Engine

**Responsibility**: Workflow orchestration

**Features**:
- Phase sequencing
- Automatic phase transitions
- Conditional workflows
- Parallel execution support

**Default Workflow**:
1. Requirements → 2. Architecture → 3. Development → 4. Testing → 5. DevOps → 6. Documentation

### 5. Purpose Registry

**Responsibility**: Maps purposes to tech stacks and configurations

**Features**:
- Purpose definitions
- Tech stack configurations
- Agent role assignments
- Project structure templates

**Purpose Definition**:
```typescript
{
  id: 'web-development',
  name: 'Web Development',
  techStack: { backend: ['Go'], frontend: ['React'] },
  agentRoles: [AgentRole.REQUIREMENTS, AgentRole.ARCHITECT, ...],
  prompts: { backend: 'go_backend', frontend: 'react_frontend' }
}
```

## Agent Architecture

### Base Agent

All agents extend from `BaseAgent`:

```typescript
abstract class BaseAgent {
  protected name: string;
  protected systemPrompt: string;
  
  abstract execute(input: AgentInput): Promise<AgentOutput>;
}
```

### Specialized Agents

#### Lead Agent
- **Role**: User interface
- **Visibility**: Visible to user
- **Responsibilities**: 
  - Detect user intent
  - Coordinate with backend agents
  - Synthesize responses
  - Handle project pivots

#### Requirements Agent
- **Role**: Business analyst
- **Responsibilities**:
  - Gather functional requirements
  - Define non-functional requirements
  - Create acceptance criteria
  - Document constraints

#### Architect Agent
- **Role**: System architect
- **Responsibilities**:
  - Design system architecture
  - Define components
  - Design data models
  - Create API contracts

#### Development Agents (Backend, Frontend, Mobile, Game)
- **Role**: Developers
- **Responsibilities**:
  - Generate code structure
  - Implement features
  - Create configuration files
  - Follow architecture

#### Tester Agent
- **Role**: QA engineer
- **Responsibilities**:
  - Design test strategy
  - Generate unit tests
  - Generate integration tests
  - Generate E2E tests

#### DevOps Agent
- **Role**: DevOps engineer
- **Responsibilities**:
  - Create CI/CD pipelines
  - Configure Docker
  - Setup Kubernetes
  - Define infrastructure

#### Docs Agent
- **Role**: Technical writer
- **Responsibilities**:
  - Generate README
  - Create API documentation
  - Write deployment guides
  - Create contributing guides

#### Summarizer Agent
- **Role**: Summarizer
- **Responsibilities**:
  - Aggregate phase results
  - Generate project summary
  - Create statistics
  - Format timeline

## Data Flow

### Project Creation Flow

1. User sends message: "Build a web app"
2. Lead Agent detects purpose: `web-development`
3. Lead Agent emits `PURPOSE_SELECTED` event
4. Memory Store creates project context
5. Agent Manager creates specialized agents
6. AutoFlow starts workflow
7. Each phase executes sequentially:
   - Agent receives `PHASE_START` event
   - Agent executes task
   - Agent stores artifacts in Memory Store
   - Agent emits `PHASE_COMPLETE` event
8. AutoFlow triggers next phase
9. Summarizer generates final summary
10. Lead Agent presents result to user

### Event Flow Example

```
User Message
    ↓
Lead Agent (detect purpose)
    ↓
EventBus (PURPOSE_SELECTED)
    ↓
AgentManager (create agents) + MemoryStore (create project)
    ↓
AutoFlow (start workflow)
    ↓
EventBus (PHASE_REQUIREMENTS_START)
    ↓
RequirementsAgent (execute)
    ↓
MemoryStore (store artifacts)
    ↓
EventBus (PHASE_REQUIREMENTS_COMPLETE)
    ↓
AutoFlow (next phase)
    ↓
... (repeat for each phase)
    ↓
Lead Agent (summarize)
    ↓
User Response
```

## State Management

### Project State

Projects progress through these states:
1. `INITIALIZING`: Project being set up
2. `REQUIREMENTS`: Gathering requirements
3. `ARCHITECTURE`: Designing system
4. `DEVELOPMENT`: Implementing features
5. `TESTING`: Running tests
6. `DEVOPS`: Setting up deployment
7. `DOCUMENTATION`: Creating docs
8. `COMPLETED`: Project finished
9. `FAILED`: Error occurred

### Phase State

Each phase tracks:
- `status`: pending | in_progress | completed | failed
- `startedAt`: Timestamp
- `completedAt`: Timestamp
- `result`: Phase output
- `artifacts`: Generated files/data

## Extension Points

### Adding New Purpose

1. Register purpose in `PurposeRegistry`
2. Create system prompts
3. Define tech stack
4. Specify agent roles

### Adding New Agent

1. Extend `BaseAgent`
2. Implement `execute()` method
3. Add to `AgentRole` enum
4. Update orchestrator

### Custom Workflow

1. Define workflow phases
2. Register with `AutoFlow`
3. Set up event listeners

## Performance Considerations

### Scalability
- Async/await for non-blocking operations
- Event-driven for loose coupling
- In-memory state for fast access
- File persistence for durability

### Memory Management
- Event history size limits
- Project context cleanup
- Agent lifecycle management

### Error Handling
- Try/catch at agent level
- Error events published
- Graceful degradation
- User-friendly error messages

## Security Considerations

- No external API calls by default
- Local file system only
- Input validation
- Sandboxed execution (future)

## Future Enhancements

- Real AI integration (Claude/GPT)
- Distributed agent execution
- Multi-project support
- Real-time collaboration
- Visual workflow designer
- Plugin marketplace

