import React, { useState, useEffect, useRef } from 'react';
import { LeadAgent } from '../agents/lead';
import { memoryStore, ProjectContext, ProjectStatus } from '../core/memoryStore';
import { eventBus, EventType } from '../core/eventBus';

/**
 * Message type
 */
interface Message {
  id: string;
  role: 'user' | 'lead' | 'system';
  content: string;
  timestamp: number;
}

/**
 * Chat Panel Props
 */
interface ChatPanelProps {
  onProjectCreated?: (project: ProjectContext) => void;
}

/**
 * ChatPanel Component - Single chat interface for Auto Cursor
 */
export const ChatPanel: React.FC<ChatPanelProps> = ({ onProjectCreated }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const leadAgentRef = useRef<LeadAgent>(new LeadAgent());

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for lead responses
  useEffect(() => {
    const handleLeadResponse = (payload: any) => {
      addMessage('lead', payload.message);
      setIsLoading(false);
    };

    const handleProjectCreated = () => {
      const project = memoryStore.getCurrentProject();
      if (project) {
        setCurrentProject(project);
        onProjectCreated?.(project);
      }
    };

    const handlePhaseComplete = (payload: any) => {
      const phase = payload.phase;
      addMessage('system', `✓ ${capitalizeFirstLetter(phase)} phase completed`);
    };

    eventBus.on(EventType.LEAD_RESPONSE, handleLeadResponse);
    eventBus.on(EventType.PROJECT_CREATED, handleProjectCreated);
    eventBus.on(EventType.PHASE_REQUIREMENTS_COMPLETE, handlePhaseComplete);
    eventBus.on(EventType.PHASE_ARCHITECTURE_COMPLETE, handlePhaseComplete);
    eventBus.on(EventType.PHASE_DEVELOPMENT_COMPLETE, handlePhaseComplete);
    eventBus.on(EventType.PHASE_TESTING_COMPLETE, handlePhaseComplete);
    eventBus.on(EventType.PHASE_DEVOPS_COMPLETE, handlePhaseComplete);
    eventBus.on(EventType.PHASE_DOCUMENTATION_COMPLETE, handlePhaseComplete);

    return () => {
      eventBus.off(EventType.LEAD_RESPONSE, handleLeadResponse);
      eventBus.off(EventType.PROJECT_CREATED, handleProjectCreated);
      eventBus.off(EventType.PHASE_REQUIREMENTS_COMPLETE, handlePhaseComplete);
      eventBus.off(EventType.PHASE_ARCHITECTURE_COMPLETE, handlePhaseComplete);
      eventBus.off(EventType.PHASE_DEVELOPMENT_COMPLETE, handlePhaseComplete);
      eventBus.off(EventType.PHASE_TESTING_COMPLETE, handlePhaseComplete);
      eventBus.off(EventType.PHASE_DEVOPS_COMPLETE, handlePhaseComplete);
      eventBus.off(EventType.PHASE_DOCUMENTATION_COMPLETE, handlePhaseComplete);
    };
  }, [onProjectCreated]);

  // Load initial message
  useEffect(() => {
    addMessage(
      'lead',
      "Hi! I'm Auto Cursor, your AI software development assistant. What kind of project would you like to build today?"
    );
  }, []);

  /**
   * Add message to chat
   */
  const addMessage = (role: 'user' | 'lead' | 'system', content: string) => {
    const message: Message = {
      id: `${Date.now()}-${Math.random()}`,
      role,
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, message]);
  };

  /**
   * Handle user message submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    addMessage('user', userMessage);

    // Process with Lead Agent
    try {
      const result = await leadAgentRef.current.execute({
        userMessage,
        projectContext: currentProject,
      });

      if (result.success && result.message) {
        addMessage('lead', result.message);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      addMessage(
        'lead',
        'I encountered an error processing your request. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get status indicator
   */
  const getStatusIndicator = () => {
    if (!currentProject) return null;

    const statusColors: Record<ProjectStatus, string> = {
      [ProjectStatus.INITIALIZING]: 'bg-yellow-500',
      [ProjectStatus.REQUIREMENTS]: 'bg-blue-500',
      [ProjectStatus.ARCHITECTURE]: 'bg-indigo-500',
      [ProjectStatus.DEVELOPMENT]: 'bg-purple-500',
      [ProjectStatus.TESTING]: 'bg-pink-500',
      [ProjectStatus.DEVOPS]: 'bg-orange-500',
      [ProjectStatus.DOCUMENTATION]: 'bg-green-500',
      [ProjectStatus.COMPLETED]: 'bg-green-600',
      [ProjectStatus.FAILED]: 'bg-red-500',
    };

    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-b">
        <div className={`w-2 h-2 rounded-full ${statusColors[currentProject.status]} animate-pulse`} />
        <span className="text-sm text-gray-700">
          {currentProject.purposeName} - {capitalizeFirstLetter(currentProject.status)}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <h1 className="text-xl font-bold">Auto Cursor</h1>
        <p className="text-sm opacity-90">Autonomous AI Development System</p>
      </div>

      {/* Status Bar */}
      {getStatusIndicator()}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isLoading && <LoadingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

/**
 * Message Bubble Component
 */
const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] px-4 py-2 rounded-lg ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
        <div
          className={`text-xs mt-1 ${isUser ? 'text-blue-100' : 'text-gray-500'}`}
        >
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};

/**
 * Loading Indicator Component
 */
const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-lg px-4 py-2">
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
};

/**
 * Helper function to capitalize first letter
 */
function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default ChatPanel;

