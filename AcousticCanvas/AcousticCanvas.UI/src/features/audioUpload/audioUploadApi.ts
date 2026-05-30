export interface WaveformDataPoint {
  timeSeconds: number;
  minAmplitude: number;
  maxAmplitude: number;
}

export interface AudioFileResponse {
  id: string;
  name: string;
  durationSeconds: number;
  sampleRate: number;
  channels: number;
  bitDepth: number;
  waveformData: WaveformDataPoint[];
}
