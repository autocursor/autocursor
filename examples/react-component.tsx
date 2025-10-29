/**
 * Example: Using Auto Cursor in a React application
 */

import React, { useEffect, useState } from 'react';
import { ChatPanel, autoCursor, ProjectContext } from '../src';

export function AutoCursorApp() {
  const [initialized, setInitialized] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectContext | null>(null);

  useEffect(() => {
    // Initialize Auto Cursor when component mounts
    const init = async () => {
      await autoCursor.initialize();
      setInitialized(true);
    };

    init();

    // Cleanup on unmount
    return () => {
      autoCursor.shutdown();
    };
  }, []);

  const handleProjectCreated = (project: ProjectContext) => {
    console.log('Project created:', project);
    setCurrentProject(project);
  };

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing Auto Cursor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <ChatPanel onProjectCreated={handleProjectCreated} />
      
      {/* Optional: Show project info sidebar */}
      {currentProject && (
        <div className="fixed right-0 top-0 w-64 h-full bg-gray-100 border-l p-4 overflow-auto">
          <h3 className="font-bold mb-2">Current Project</h3>
          <div className="text-sm space-y-2">
            <div>
              <span className="font-semibold">Name:</span> {currentProject.purposeName}
            </div>
            <div>
              <span className="font-semibold">Status:</span> {currentProject.status}
            </div>
            <div>
              <span className="font-semibold">Created:</span>{' '}
              {new Date(currentProject.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-semibold">Phases:</span>
              <ul className="ml-4 mt-1">
                {Object.entries(currentProject.phases).map(([name, phase]) => (
                  <li key={name} className="flex items-center gap-2">
                    {phase.status === 'completed' ? '✓' : '○'} {name}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AutoCursorApp;

