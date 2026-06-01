import type { JSX } from 'react';
import { ManualWorkspace } from '../manualAnalysis/ManualWorkspace';
import { AgentWorkspace } from '../agentAnalysis/AgentWorkspace';
import { useAppSelector } from '../../store/reduxHooks';
import { activeModeSelector } from '../navigation/navigationSlice';

export const ModeContentPlaceholder = (): JSX.Element => {
  const activeMode = useAppSelector(activeModeSelector);

  if (activeMode === 'manual') {
    return <ManualWorkspace />;
  }

  return <AgentWorkspace />;
};
