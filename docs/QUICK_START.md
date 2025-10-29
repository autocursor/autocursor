# Auto Cursor Quick Start Guide

Get up and running with Auto Cursor in minutes!

## Installation

```bash
# Clone the repository
git clone https://github.com/your-org/autocursor.git
cd autocursor

# Install dependencies
npm install

# Build the project
npm run build
```

## Basic Usage

### 1. Command Line

```typescript
import { autoCursor } from 'autocursor';

// Initialize
await autoCursor.initialize();

// Get Lead Agent
const leadAgent = autoCursor.getLeadAgent();

// Send a message
const result = await leadAgent.execute({
  userMessage: "I want to build a web application"
});

console.log(result.message);
```

### 2. React Component

```tsx
import { ChatPanel } from 'autocursor';

function App() {
  return <ChatPanel />;
}
```

## Common Use Cases

### Building a Web App

**User:** "Create a task management web application"

**Auto Cursor will:**
1. Setup Go backend with PostgreSQL
2. Create React frontend with TypeScript
3. Generate API endpoints
4. Create database schemas
5. Write tests
6. Setup Docker & CI/CD
7. Generate documentation

### Building a Mobile App

**User:** "Build an iOS fitness tracking app"

**Auto Cursor will:**
1. Setup Swift/SwiftUI project
2. Design MVVM architecture
3. Implement CoreData persistence
4. Create UI views
5. Write unit tests
6. Generate documentation

### Building an API

**User:** "Create a RESTful API for user management"

**Auto Cursor will:**
1. Setup Go backend
2. Design API endpoints
3. Implement authentication
4. Create database models
5. Write integration tests
6. Setup Kubernetes deployment

## Interaction Examples

### Starting a Project

```
You: "I want to build a 2D platformer game"

Auto Cursor: "Great! I'll help you build a game development project.
I'm setting up a team with Unity and C#. Let me gather requirements..."

[System works autonomously]

Auto Cursor: "✓ Your game project is ready! I've created:
- Player controller with movement and jumping
- Game manager for state handling
- Score system
- Scene management
All in Unity with C# scripts."
```

### Asking for Changes

```
You: "Add multiplayer support"

Auto Cursor: "I'll add multiplayer capabilities to your game.
Let me update the architecture and implement networking..."
```

### Pivoting Mid-Project

```
You: "Actually, let's make this a mobile game for iOS"

Auto Cursor: "No problem! I'll reconfigure for iOS mobile development
using Unity with iOS build settings..."
```

## Available Project Types

| Type | Command Example | Output |
|------|----------------|--------|
| **Web App** | "Build a web app" | Go + React + PostgreSQL |
| **Game** | "Create a 2D game" | Unity + C# |
| **iOS App** | "Make an iOS app" | Swift + SwiftUI |
| **Android App** | "Build an Android app" | Kotlin + Compose |
| **API** | "Create an API" | Go + gRPC + PostgreSQL |
| **CLI Tool** | "Make a CLI tool" | Go + Cobra |
| **Data Science** | "Build an ML app" | Python + FastAPI |
| **Desktop App** | "Create a desktop app" | Electron + React |

## Tips

### 1. Be Natural

Just describe what you want in plain English. No special syntax needed.

❌ Don't: `@autocursor create-project --type web --stack react`  
✅ Do: "I want to build a web application"

### 2. Provide Context

More context helps Auto Cursor understand your needs better.

❌ "Build something"  
✅ "Build a task management web app with user authentication and real-time updates"

### 3. Iterate

You can ask for changes, additions, or pivots at any time.

```
"Add user authentication"
"Make it mobile instead"
"Add a dark mode"
```

### 4. Trust the Process

Auto Cursor works autonomously. You'll see status updates as it progresses through phases.

## Project Structure

Auto Cursor generates complete project structures:

```
your-project/
├── backend/           # Backend code
├── frontend/          # Frontend code
├── tests/             # Test suites
├── docker/            # Docker configs
├── k8s/              # Kubernetes manifests
├── docs/             # Documentation
├── .github/          # CI/CD workflows
└── README.md         # Project README
```

## Next Steps

- Read the [Full Documentation](../README.md)
- Explore [Architecture](ARCHITECTURE.md)
- Check out [Examples](../examples/)
- Join our [Community](https://discord.gg/autocursor)

## Troubleshooting

### "Agent not responding"
- Ensure Auto Cursor is initialized: `await autoCursor.initialize()`
- Check console for errors

### "Purpose not detected"
- Be more specific about what you want to build
- Use keywords like "web app", "mobile app", "game", etc.

### "Project files not generated"
- Check the `.autocursor` directory for persistence
- Verify write permissions

## Getting Help

- 📖 [Documentation](../README.md)
- 💬 [Discord Community](https://discord.gg/autocursor)
- 🐛 [Report Issues](https://github.com/your-org/autocursor/issues)
- 📧 Email: support@autocursor.dev

---

Happy building! 🚀

