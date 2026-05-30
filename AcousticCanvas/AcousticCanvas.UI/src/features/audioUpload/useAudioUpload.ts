import { useState, useCallback } from 'react';
import { notifications } from '@mantine/notifications';
import { apiClient, ApiError, HttpMethod } from '../../shared/api/apiClient';
import { API_ENDPOINTS } from '../../shared/api/apiEndpoints';
import type { AudioFileResponse, WaveformDataPoint } from './audioUploadApi';

interface UseAudioUploadReturn {
  isUploading: boolean;
  uploadedFile: AudioFileResponse | null;
  waveformData: WaveformDataPoint[];
  uploadFile: (file: File) => Promise<void>;
  clearUploadedFile: () => void;
}

export const useAudioUpload = (): UseAudioUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<AudioFileResponse | null>(null);
  const [waveformData, setWaveformData] = useState<WaveformDataPoint[]>([]);

  const uploadFile = useCallback(async (file: File): Promise<void> => {
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await apiClient.requestJson<AudioFileResponse>(
        API_ENDPOINTS.AUDIO.UPLOAD,
        {
          method: HttpMethod.POST,
          body: formData,
        },
      );

      setUploadedFile(data);
      setWaveformData(data.waveformData);

      notifications.show({
        title: 'Upload successful',
        message: `Loaded "${data.name}" (${data.durationSeconds.toFixed(2)}s, ${data.sampleRate}Hz)`,
        color: 'teal',
      });
    } catch (error) {
      const errorMessage = error instanceof ApiError
        ? `${error.status}: ${error.statusText}`
        : error instanceof Error
          ? error.message
          : 'Unknown error';
      notifications.show({
        title: 'Upload failed',
        message: errorMessage,
        color: 'red',
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const clearUploadedFile = useCallback((): void => {
    setUploadedFile(null);
    setWaveformData([]);
  }, []);

  return {
    isUploading,
    uploadedFile,
    waveformData,
    uploadFile,
    clearUploadedFile,
  };
};
