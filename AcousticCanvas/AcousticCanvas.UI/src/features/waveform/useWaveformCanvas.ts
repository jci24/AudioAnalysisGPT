import { useRef, useEffect } from 'react';
import type { WaveformDataPoint } from '../audioUpload/audioUploadApi';
import { drawWaveformCanvas } from './waveformCanvasUtils';

interface UseWaveformCanvasOptions {
  waveformData: WaveformDataPoint[];
  width: number;
  height: number;
  color: string;
  backgroundColor: string;
}

interface UseWaveformCanvasReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function useWaveformCanvas(options: UseWaveformCanvasOptions): UseWaveformCanvasReturn {
  const { waveformData, width, height, color, backgroundColor } = options;
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    drawWaveformCanvas({
      context,
      waveformData,
      width,
      height,
      color,
      backgroundColor,
    });
  }, [waveformData, width, height, color, backgroundColor]);

  return { canvasRef };
}
