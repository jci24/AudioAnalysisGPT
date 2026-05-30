import type { JSX } from 'react';
import { WorkspacePanel, WorkspacePanelCanvas, WorkspacePanelEmptyHint } from '../../shared/WorkspacePanel';
import styles from './ManualWorkspace.module.scss';

export const ManualWorkspace = (): JSX.Element => {
  return (
    <div className={styles.workspace}>
      <FileListPanel />
      <MainArea />
      <InspectorPanel />
    </div>
  );
};

const FileListPanel = (): JSX.Element => {
  return (
    <WorkspacePanel title="Files" as="aside">
      <WorkspacePanelEmptyHint text="No files loaded" />
    </WorkspacePanel>
  );
};

const MainArea = (): JSX.Element => {
  return (
    <div className={styles.mainArea}>
      <TransportBar />
      <WaveformPanel />
      <SpectrogramPanel />
      <SpectrumPanel />
      <MarkersPanel />
    </div>
  );
};

const InspectorPanel = (): JSX.Element => {
  return (
    <WorkspacePanel title="Inspector" as="aside">
      <WorkspacePanelEmptyHint text="Select a region to inspect" />
    </WorkspacePanel>
  );
};

const TransportBar = (): JSX.Element => {
  return (
    <WorkspacePanel title="Transport">
      <WorkspacePanelEmptyHint text="Playback controls — not yet implemented" />
    </WorkspacePanel>
  );
};

const WaveformPanel = (): JSX.Element => {
  return (
    <WorkspacePanel title="Waveform" as="section">
      <WorkspacePanelCanvas />
    </WorkspacePanel>
  );
};

const SpectrogramPanel = (): JSX.Element => {
  return (
    <WorkspacePanel title="Spectrogram" as="section">
      <WorkspacePanelCanvas />
    </WorkspacePanel>
  );
};

const SpectrumPanel = (): JSX.Element => {
  return (
    <WorkspacePanel title="Spectrum / FFT" as="section">
      <WorkspacePanelCanvas />
    </WorkspacePanel>
  );
};

const MarkersPanel = (): JSX.Element => {
  return (
    <WorkspacePanel title="Markers" as="section">
      <WorkspacePanelEmptyHint text="No markers" />
    </WorkspacePanel>
  );
};
