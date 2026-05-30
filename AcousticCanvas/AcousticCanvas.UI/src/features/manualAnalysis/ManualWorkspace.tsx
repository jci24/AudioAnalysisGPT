import type { JSX } from 'react';
import { AudioFileDropzone } from '../audioUpload/AudioFileDropzone';
import { useAudioUpload } from '../audioUpload/useAudioUpload';
import styles from './ManualWorkspace.module.scss';

interface ManualWorkspaceProps {
  showDropzone?: boolean;
}

export const ManualWorkspace = ({ showDropzone = false }: ManualWorkspaceProps): JSX.Element => {
  const { isUploading, uploadFile } = useAudioUpload();

  if (!showDropzone) {
    return (
      <div className={styles.workspace}>
        <div className={styles.emptyState}>
          <p>Select Import from the sidebar to upload an audio file</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.workspace}>
      <AudioFileDropzone onFileSelected={uploadFile} isUploading={isUploading} />
    </div>
  );
};
