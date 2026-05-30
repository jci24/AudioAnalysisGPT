import type { JSX } from 'react';
import { WorkspacePanel, WorkspacePanelEmptyHint } from '../../shared/WorkspacePanel';
import styles from './AgentWorkspace.module.scss';

export const AgentWorkspace = (): JSX.Element => {
  return (
    <div className={styles.workspace}>
      <TaskProgressPanel />
      <ChatPanel />
      <AgentWorkspacePanel />
    </div>
  );
};

const TaskProgressPanel = (): JSX.Element => {
  return (
    <WorkspacePanel title="Tasks" as="aside">
      <WorkspacePanelEmptyHint text="No tasks running" />
    </WorkspacePanel>
  );
};

const ChatPanel = (): JSX.Element => {
  return (
    <div className={styles.chatPanel} aria-label="Agent chat">
      <WorkspacePanel title="Agent">
        <ChatMessageArea />
        <ChatInputArea />
      </WorkspacePanel>
    </div>
  );
};

const ChatMessageArea = (): JSX.Element => {
  return (
    <WorkspacePanelEmptyHint text="Agent responses will appear here" />
  );
};

const ChatInputArea = (): JSX.Element => {
  return (
    <div className={styles.chatInputArea} aria-label="Chat input">
      <div className={styles.chatInputPlaceholder}>
        <span className={styles.chatInputHint}>Chat input — not yet implemented</span>
      </div>
    </div>
  );
};

const AgentWorkspacePanel = (): JSX.Element => {
  return (
    <WorkspacePanel title="Workspace" as="aside">
      <WorkspacePanelEmptyHint text="Generated analysis cards will appear here" />
    </WorkspacePanel>
  );
};
