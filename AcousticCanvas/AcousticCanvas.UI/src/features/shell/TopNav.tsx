import type { JSX } from 'react';
import { SegmentedControl } from '@mantine/core';
import styles from './TopNav.module.scss';
import type { ActiveMode, ProjectStatus } from '../../store/projectState';

interface TopNavProps {
  activeMode: ActiveMode;
  onModeChange: (selectedMode: ActiveMode) => void;
  projectName: string;
  projectStatus: ProjectStatus;
  sidebarWidth?: number;
}

export const TopNav = ({ activeMode, onModeChange, projectName, projectStatus, sidebarWidth = 200 }: TopNavProps): JSX.Element => {
  return (
    <nav
      className={styles.topNav}
      aria-label="Main navigation"
      style={{ marginLeft: sidebarWidth }}
    >
      <TopNavModeSwitcher activeMode={activeMode} onModeChange={onModeChange} />
      <TopNavSpacer />
      <TopNavProjectName projectName={projectName} />
      <TopNavStatus projectStatus={projectStatus} />
    </nav>
  );
}

interface TopNavModeSwitcherProps {
  activeMode: ActiveMode;
  onModeChange: (selectedMode: ActiveMode) => void;
}

const TopNavModeSwitcher = ({ activeMode, onModeChange }: TopNavModeSwitcherProps): JSX.Element => {
  const modeOptions = [
    { label: 'Manual Analysis', value: 'manual' },
    { label: 'Agent', value: 'agent' },
  ];

  return (
    <SegmentedControl
      value={activeMode}
      onChange={(selectedValue) => onModeChange(selectedValue as ActiveMode)}
      data={modeOptions}
      size="xs"
      aria-label="Workspace mode"
      classNames={{
        root: styles.modeSwitcherRoot,
        indicator: styles.modeSwitcherIndicator,
        label: styles.modeSwitcherLabel,
      }}
    />
  );
}

const TopNavSpacer = (): JSX.Element => {
  return <div className={styles.spacer} aria-hidden="true" />;
}

interface TopNavProjectNameProps {
  projectName: string;
}

const TopNavProjectName = ({ projectName }: TopNavProjectNameProps): JSX.Element => {
  return (
    <span className={styles.projectName} aria-label="Project name">
      {projectName}
    </span>
  );
}

const statusLabelMap: Record<ProjectStatus, string> = {
  'no-project': 'No project loaded',
  'ready': 'Ready',
  'loading': 'Loading…',
  'error': 'Error',
};

const statusStyleMap: Record<ProjectStatus, string> = {
  'no-project': 'statusMuted',
  'ready': 'statusReady',
  'loading': 'statusLoading',
  'error': 'statusError',
};

interface TopNavStatusProps {
  projectStatus: ProjectStatus;
}

const TopNavStatus = ({ projectStatus }: TopNavStatusProps): JSX.Element => {
  const statusLabel = statusLabelMap[projectStatus];
  const statusStyleKey = statusStyleMap[projectStatus] as keyof typeof styles;

  return (
    <span className={styles[statusStyleKey]} aria-label="Project status">
      {statusLabel}
    </span>
  );
}
