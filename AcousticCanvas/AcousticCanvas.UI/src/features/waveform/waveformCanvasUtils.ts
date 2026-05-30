import type { WaveformDataPoint } from '../audioUpload/audioUploadApi';

interface DrawWaveformOptions {
  context: CanvasRenderingContext2D;
  waveformData: WaveformDataPoint[];
  width: number;
  height: number;
  color: string;
  backgroundColor: string;
}

export function drawWaveformCanvas(options: DrawWaveformOptions): void {
  const { context, waveformData, width, height, color, backgroundColor } = options;

  // Clear canvas with background color
  context.fillStyle = backgroundColor;
  context.fillRect(0, 0, width, height);

  if (waveformData.length === 0) {
    return;
  }

  // Draw waveform using pre-computed data from backend
  const centerY = height / 2;
  const amplitudeScale = height / 2;

  context.strokeStyle = color;
  context.lineWidth = 1;
  context.beginPath();

  const pointsPerPixel = waveformData.length / width;

  Array.from({ length: width }, (_, pixelX) => {
    const dataIndex = Math.floor(pixelX * pointsPerPixel);
    const dataPoint = waveformData[dataIndex];

    if (!dataPoint) {
      return;
    }

    const minY = centerY - dataPoint.maxAmplitude * amplitudeScale;
    const maxY = centerY - dataPoint.minAmplitude * amplitudeScale;

    context.moveTo(pixelX, minY);
    context.lineTo(pixelX, maxY);
  });

  context.stroke();

  // Draw center line
  context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(0, centerY);
  context.lineTo(width, centerY);
  context.stroke();
}
