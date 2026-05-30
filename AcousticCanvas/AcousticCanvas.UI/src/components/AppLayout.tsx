import type { JSX } from 'react';
import { useState } from 'react';
import { AppShell } from '@mantine/core';
import { TopNav } from '../features/shell/TopNav';
import { Sidebar } from './Sidebar';
import { initialProjectState, type ProjectState, type ActiveMode } from '../store/projectState';

type ViewType = 'home' | 'import';

interface AppLayoutProps {
  children: (activeMode: ActiveMode, currentView: ViewType) => JSX.Element;
}

export const AppLayout = ({ children }: AppLayoutProps): JSX.Element => {
  const [projectState, setProjectState] = useState<ProjectState>(initialProjectState);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleModeChange = (selectedMode: ActiveMode): void => {
    setProjectState((previousState) => ({ ...previousState, activeMode: selectedMode }));
  };

  const handleHomeClick = (): void => {
    setCurrentView('home');
  };

  const handleImportClick = (): void => {
    setCurrentView('import');
  };

  const handleToggleSidebar = (): void => {
    setIsSidebarCollapsed((previous) => !previous);
  };

  const sidebarWidth = isSidebarCollapsed ? 56 : 200;

  return (
    <AppShell
      header={{ height: 48 }}
      navbar={{ width: sidebarWidth, breakpoint: 'sm' }}
      padding={0}
      styles={{
        header: {
          zIndex: 100,
        },
        navbar: {
          top: 0,
          height: '100vh',
          width: sidebarWidth,
          transition: 'width 0.2s ease',
          zIndex: 200,
        },
        main: {
          paddingLeft: sidebarWidth,
          transition: 'padding-left 0.2s ease',
        },
      }}
    >
      <AppShell.Header>
        <TopNav
          activeMode={projectState.activeMode}
          onModeChange={handleModeChange}
          projectName={projectState.projectName}
          projectStatus={projectState.status}
          sidebarWidth={sidebarWidth}
        />
      </AppShell.Header>
      <AppShell.Navbar>
        <Sidebar
          onHomeClick={handleHomeClick}
          onImportClick={handleImportClick}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      </AppShell.Navbar>
      <AppShell.Main>
        {children(projectState.activeMode, currentView)}
      </AppShell.Main>
    </AppShell>
  );
}
