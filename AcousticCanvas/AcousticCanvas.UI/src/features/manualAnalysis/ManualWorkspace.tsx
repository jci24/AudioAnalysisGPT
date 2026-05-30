import type { JSX } from 'react';
import { AudioFileDropzone } from '../audioUpload/AudioFileDropzone';
import { useAudioUpload } from '../audioUpload/useAudioUpload';
import { Text, Stack, Badge, Card, Group } from '@mantine/core';
import { IconFileMusic } from '@tabler/icons-react';
import styles from './ManualWorkspace.module.scss';

interface ManualWorkspaceProps {
  showDropzone?: boolean;
}

export const ManualWorkspace = ({ showDropzone = false }: ManualWorkspaceProps): JSX.Element => {
  const { isUploading, uploadedFile, uploadFile, clearUploadedFile } = useAudioUpload();

  if (!uploadedFile && !showDropzone) {
    return (
      <div className={styles.workspace}>
        <div className={styles.emptyState}>
          <p>Select Import from the sidebar to upload an audio file</p>
        </div>
      </div>
    );
  }

  if (!uploadedFile && showDropzone) {
    return (
      <div className={styles.workspace}>
        <AudioFileDropzone onFileSelected={uploadFile} isUploading={isUploading} />
      </div>
    );
  }

  return (
    <div className={styles.workspaceWithFileList}>
      <FileListPanel
        uploadedFile={uploadedFile}
        onClearFile={clearUploadedFile}
      />
    </div>
  );
};

interface FileListPanelProps {
  uploadedFile: { id: string; name: string; durationSeconds: number; sampleRate: number; channels: number; bitDepth: number } | null;
  onClearFile: () => void;
}

const FileListPanel = ({ uploadedFile, onClearFile }: FileListPanelProps): JSX.Element => {
  return (
    <div className={styles.fileListPanel}>
      <Text fw={600} size="sm" mb="md" c="dimmed">FILES</Text>
      {uploadedFile && (
        <Card withBorder shadow="sm" padding="sm">
          <Group gap="xs" mb="xs">
            <IconFileMusic size={20} />
            <Text fw={500} size="sm" truncate style={{ flex: 1 }}>
              {uploadedFile.name}
            </Text>
          </Group>
          <Stack gap={4}>
            <Badge size="xs" color="teal" variant="light">
              {uploadedFile.durationSeconds.toFixed(2)}s
            </Badge>
            <Badge size="xs" color="blue" variant="light">
              {uploadedFile.sampleRate} Hz
            </Badge>
            <Badge size="xs" color="gray" variant="light">
              {uploadedFile.channels} ch / {uploadedFile.bitDepth}-bit
            </Badge>
          </Stack>
          <Text
            size="xs"
            c="dimmed"
            mt="sm"
            style={{ cursor: 'pointer' }}
            onClick={onClearFile}
          >
            Click to remove
          </Text>
        </Card>
      )}
    </div>
  );
};
