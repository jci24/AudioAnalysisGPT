import type { JSX } from 'react';
import { useWaveformCanvas } from './useWaveformCanvas';
import type { WaveformDataPoint } from '../audioUpload/audioUploadApi';
import styles from './WaveformDisplay.module.scss';

interface WaveformDisplayProps {
  waveformData: WaveformDataPoint[];
  width: number;
  height: number;
  color?: string;
  backgroundColor?: string;
}

export const WaveformDisplay = ({
  waveformData,
  width,
  height,
  color = '#00d9c8',
  backgroundColor = '#1a1d29',
}: WaveformDisplayProps): JSX.Element => {
  const { canvasRef } = useWaveformCanvas({
    waveformData,
    width,
    height,
    color,
    backgroundColor,
  });

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={styles.canvas}
      style={{
        width: `${width}px`,
        height: `${height}px`,
      }}
    />
  );
};
