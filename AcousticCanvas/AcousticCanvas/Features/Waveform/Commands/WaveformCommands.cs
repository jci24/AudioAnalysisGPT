using FastEndpoints;

namespace AcousticCanvas.Features.Waveform.Commands;

public record GetWaveformQuery(string FilePath, int Points) : ICommand<WaveformResult>;

public record WaveformResult(
    double DurationSeconds,
    int SampleRate,
    int Channels,
    double GlobalMinFs,
    double GlobalMaxFs,
    float[] Peaks
);
