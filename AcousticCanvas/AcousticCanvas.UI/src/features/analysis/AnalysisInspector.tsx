import type { JSX } from 'react';
import { Text, Loader, Alert, Stack, Divider } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import type { AnalysisResult, ChannelLevelAnalysis, FileInfoAnalysis } from './analysisTypes';
import type { AnalysisStatus } from './analysisSlice';
import styles from './AnalysisInspector.module.scss';

interface AnalysisInspectorProps {
  result: AnalysisResult | null;
  status: AnalysisStatus;
  error: string | null;
}

const formatValue = (value: number, decimals: number = 4): string =>
  value.toFixed(decimals);

const formatDb = (value: number | null, dbUnit: string | null): string => {
  if (value === null || dbUnit === null) return 'N/A';
  return `${value.toFixed(3)} ${dbUnit}`;
};

const formatLinear = (value: number | null, unit: string): string => {
  if (value === null) return 'N/A';
  return `${value.toFixed(4)} ${unit}`;
};

function FileInfoSection({ fileInfo }: { fileInfo: FileInfoAnalysis }): JSX.Element {
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>FILE INFO</div>
      <div className={styles.metricGrid}>
        <MetricRow label="Container" value={fileInfo.containerFormat} />
        {fileInfo.encodingFormat && <MetricRow label="Encoding" value={fileInfo.encodingFormat} />}
        <MetricRow label="Duration" value={`${fileInfo.durationSeconds.toFixed(3)} s`} />
        {fileInfo.sampleRate && <MetricRow label="Sample rate" value={`${fileInfo.sampleRate} Hz`} />}
        <MetricRow label="Channels" value={String(fileInfo.channelCount)} />
        {fileInfo.bitDepth && <MetricRow label="Bit depth" value={`${fileInfo.bitDepth}-bit`} />}
        {fileInfo.totalFrames && <MetricRow label="Frames" value={fileInfo.totalFrames.toLocaleString()} />}
        <MetricRow label="File size" value={`${(fileInfo.fileSizeBytes / 1024).toFixed(1)} kB`} />
      </div>
    </div>
  );
}

function ChannelLevelSection({ channel }: { channel: ChannelLevelAnalysis }): JSX.Element {
  return (
    <div className={styles.section}>
      <div className={styles.sectionLabel}>
        {channel.channelName.toUpperCase()}
        <span className={styles.unitTag}>{channel.unit}</span>
        {!channel.isCalibrated && <span className={styles.uncalibratedTag}>uncalibrated</span>}
      </div>
      <div className={styles.metricGrid}>
        <MetricRow label="Min" value={`${formatValue(channel.min)} ${channel.unit}`} />
        <MetricRow label="Max" value={`${formatValue(channel.max)} ${channel.unit}`} />
        <MetricRow label="Peak" value={`${formatValue(channel.peak)} ${channel.unit}`} highlight />
        <MetricRow label="Peak level" value={formatDb(channel.peakDb, channel.dbUnit)} highlight />
        <Divider my={4} color="var(--border)" />
        <MetricRow label="RMS" value={`${formatValue(channel.rms)} ${channel.unit}`} />
        <MetricRow label="RMS level" value={formatDb(channel.rmsDb, channel.dbUnit)} />
        <Divider my={4} color="var(--border)" />
        <MetricRow label="Crest factor" value={formatLinear(channel.crestFactor, '')} />
        <MetricRow label="Crest factor dB" value={channel.crestFactorDb !== null ? `${channel.crestFactorDb.toFixed(3)} dB` : 'N/A'} />
        <Divider my={4} color="var(--border)" />
        <MetricRow label="DC offset" value={`${formatValue(channel.dcOffset, 6)} ${channel.unit}`} />
      </div>
    </div>
  );
}

function MetricRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}): JSX.Element {
  return (
    <div className={styles.metricRow}>
      <span className={styles.metricLabel}>{label}</span>
      <span className={`${styles.metricValue} ${highlight ? styles.metricValueHighlight : ''}`}>
        {value}
      </span>
    </div>
  );
}

export const AnalysisInspector = ({
  result,
  status,
  error,
}: AnalysisInspectorProps): JSX.Element => {
  return (
    <div className={styles.inspector}>
      <div className={styles.body}>
        {status === 'idle' && (
          <div className={styles.emptyState}>
            <Text size="xs" c="dimmed">Load a file to see analysis.</Text>
          </div>
        )}

        {status === 'running' && (
          <div className={styles.loadingState}>
            <Loader size="xs" color="teal" />
            <Text size="xs" c="dimmed">Running analysis…</Text>
          </div>
        )}

        {status === 'error' && error && (
          <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" p="xs">
            <Text size="xs">{error}</Text>
          </Alert>
        )}

        {status === 'complete' && result && (
          <Stack gap={0}>
            <FileInfoSection fileInfo={result.fileInfo} />
            {result.level.channels.map((channel) => (
              <ChannelLevelSection key={channel.channelId} channel={channel} />
            ))}
            {result.level.combined && (
              <ChannelLevelSection channel={result.level.combined} />
            )}
            <div className={styles.timestamp}>
              <Text size="xs" c="dimmed">
                Analyzed {new Date(result.analyzedAt).toLocaleTimeString()}
              </Text>
            </div>
          </Stack>
        )}
      </div>
    </div>
  );
};
