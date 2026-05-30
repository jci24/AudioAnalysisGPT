import type { JSX, ReactNode } from 'react';
import styles from './WorkspacePanel.module.scss';

interface WorkspacePanelProps {
  title: string;
  children: ReactNode;
  as?: 'div' | 'aside' | 'section';
  ariaLabel?: string;
}

export const WorkspacePanel = ({ title, children, as: Tag = 'div', ariaLabel }: WorkspacePanelProps): JSX.Element => {
  return (
    <Tag className={styles.panel} aria-label={ariaLabel ?? title}>
      <WorkspacePanelHeader title={title} />
      <div className={styles.panelContent}>
        {children}
      </div>
    </Tag>
  );
};

interface WorkspacePanelHeaderProps {
  title: string;
}

const WorkspacePanelHeader = ({ title }: WorkspacePanelHeaderProps): JSX.Element => {
  return (
    <div className={styles.panelHeader}>
      <span className={styles.panelTitle}>{title}</span>
    </div>
  );
};

export const WorkspacePanelEmptyHint = ({ text }: { text: string }): JSX.Element => {
  return (
    <div className={styles.emptyHintContainer}>
      <span className={styles.emptyHint}>{text}</span>
    </div>
  );
};

export const WorkspacePanelCanvas = (): JSX.Element => {
  return <div className={styles.panelCanvas} aria-hidden="true" />;
};
