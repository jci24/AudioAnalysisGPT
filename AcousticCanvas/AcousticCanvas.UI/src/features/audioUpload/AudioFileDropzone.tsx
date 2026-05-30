import type { JSX } from 'react';
import { Card, Group, Text, Badge } from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import { IconUpload, IconFileMusic, IconX } from '@tabler/icons-react';

export type OnAudioFileUploaded = (file: File) => void;

interface AudioFileDropzoneProps {
  onFileSelected: OnAudioFileUploaded;
  isUploading?: boolean;
}

const ACCEPTED_AUDIO_TYPES: Record<string, string[]> = {
  'audio/wav': ['.wav'],
  'audio/mpeg': ['.mp3'],
  'audio/flac': ['.flac'],
  'audio/aiff': ['.aiff', '.aif'],
  'audio/ogg': ['.ogg'],
};

export const AudioFileDropzone = ({
  onFileSelected,
  isUploading = false,
}: AudioFileDropzoneProps): JSX.Element => {
  const handleDrop = (files: File[]): void => {
    if (files.length > 0 && files[0] !== null) {
      onFileSelected(files[0]);
    }
  };

  return (
    <Card shadow="sm" padding="lg" withBorder style={{ maxWidth: 480 }}>
      <Card.Section>
        <Dropzone
          onDrop={handleDrop}
          onReject={(files) => console.log('rejected files', files)}
          maxSize={100 * 1024 ** 2}
          accept={ACCEPTED_AUDIO_TYPES}
          maxFiles={1}
          disabled={isUploading}
        >
          <Group justify="center" gap="xl" mih={180} style={{ pointerEvents: 'none' }}>
            <Dropzone.Accept>
              <IconUpload size={52} color="var(--mantine-color-teal-6)" />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX size={52} color="var(--mantine-color-red-6)" />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconFileMusic size={52} color="var(--mantine-color-dimmed)" />
            </Dropzone.Idle>

            <div>
              <Text size="xl" inline>
                {isUploading ? 'Uploading...' : 'Drop audio file here'}
              </Text>
              <Text size="sm" c="dimmed" inline mt={7}>
                or click to select
              </Text>
            </div>
          </Group>
        </Dropzone>
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>Import Audio File</Text>
        <Badge color="teal">100MB max</Badge>
      </Group>

      <Text size="sm" c="dimmed">
        Supports: WAV, MP3, FLAC, AIFF, OGG formats. Files are processed locally in your browser.
      </Text>
    </Card>
  );
};
