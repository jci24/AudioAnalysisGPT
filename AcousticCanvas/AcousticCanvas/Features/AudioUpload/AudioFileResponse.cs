namespace AcousticCanvas.Features.AudioUpload;

public record AudioFileResponse(
    string Id,
    string Name,
    double DurationSeconds,
    int SampleRate,
    int Channels,
    int BitDepth,
    List<WaveformDataPoint> WaveformData
);

public record WaveformDataPoint(
    double TimeSeconds,
    float MinAmplitude,
    float MaxAmplitude
);
