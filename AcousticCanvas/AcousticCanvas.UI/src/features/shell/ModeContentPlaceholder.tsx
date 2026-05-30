import type { JSX } from 'react';
import { ManualWorkspace } from '../manualAnalysis/ManualWorkspace';
import { AgentWorkspace } from '../agentAnalysis/AgentWorkspace';

type ActiveMode = 'manual' | 'agent';
type ViewType = 'home' | 'import';

interface ModeContentPlaceholderProps {
  activeMode: ActiveMode;
  currentView: ViewType;
}

export const ModeContentPlaceholder = ({ activeMode, currentView }: ModeContentPlaceholderProps): JSX.Element => {
  if (activeMode === 'manual') {
    return <ManualWorkspace showDropzone={currentView === 'import'} />;
  }

  return <AgentWorkspace />;
};
