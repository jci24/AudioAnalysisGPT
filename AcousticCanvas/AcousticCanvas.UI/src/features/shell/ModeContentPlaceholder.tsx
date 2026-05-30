import type { JSX } from 'react';
import { ManualWorkspace } from '../manualAnalysis/ManualWorkspace';
import { AgentWorkspace } from '../agentAnalysis/AgentWorkspace';

type ActiveMode = 'manual' | 'agent';

interface ModeContentPlaceholderProps {
  activeMode: ActiveMode;
}

export const ModeContentPlaceholder = ({ activeMode }: ModeContentPlaceholderProps): JSX.Element => {
  if (activeMode === 'manual') {
    return <ManualWorkspace />;
  }

  return <AgentWorkspace />;
};
