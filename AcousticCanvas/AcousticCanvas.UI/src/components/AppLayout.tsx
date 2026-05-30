import type { JSX } from 'react';
import { useState } from 'react';
import { AppShell } from '@mantine/core';
import { TopNav } from '../features/shell/TopNav';
import { initialProjectState, type ProjectState, type ActiveMode } from '../store/projectState';

interface AppLayoutProps {
  children: (activeMode: ActiveMode) => JSX.Element;
}

export const AppLayout = ({ children }: AppLayoutProps): JSX.Element => {
  const [projectState, setProjectState] = useState<ProjectState>(initialProjectState);

  const handleModeChange = (selectedMode: ActiveMode): void => {
    setProjectState((previousState) => ({ ...previousState, activeMode: selectedMode }));
  };

  return (
    <AppShell header={{ height: 48 }} padding={0}>
      <AppShell.Header>
        <TopNav
          activeMode={projectState.activeMode}
          onModeChange={handleModeChange}
          projectName={projectState.projectName}
          projectStatus={projectState.status}
        />
      </AppShell.Header>
      <AppShell.Main>
        {children(projectState.activeMode)}
      </AppShell.Main>
    </AppShell>
  );
}
