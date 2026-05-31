import type { JSX } from 'react';
import { ManualWorkspace } from '../manualAnalysis/ManualWorkspace';
import { AgentWorkspace } from '../agentAnalysis/AgentWorkspace';
import { useAppSelector } from '../../store/reduxHooks';
import { activeModeSelector, activeViewSelector } from '../navigation/navigationSlice';

export const ModeContentPlaceholder = (): JSX.Element => {
  const activeMode = useAppSelector(activeModeSelector);
  const activeView = useAppSelector(activeViewSelector);

  if (activeMode === 'manual') {
    return <ManualWorkspace showDropzone={activeView === 'import'} />;
  }

  return <AgentWorkspace />;
};
