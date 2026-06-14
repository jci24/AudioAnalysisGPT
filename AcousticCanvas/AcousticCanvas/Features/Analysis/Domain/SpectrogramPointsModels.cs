using MessagePack;

namespace AcousticCanvas.Features.Analysis.Domain;

/// <summary>
/// MessagePack-serializable spectrogram response where each channel contains
/// [x, y] data points instead of frame-based byte arrays.
/// Each point is [timeSeconds, frequencyHz, magnitudeDb].
/// </summary>
[MessagePackObject(keyAsPropertyName: true)]
public sealed class SpectrogramPointsResponse
{
    public required SpectrogramPointsParameters Parameters { get; init; }
    public required SpectrogramPointsRegion Region { get; init; }
    public required IReadOnlyList<SpectrogramChannelPoints> Channels { get; init; }
    public required IReadOnlyList<SpectrogramAxisTick> TimeAxisTicks { get; init; }
    public required IReadOnlyList<SpectrogramAxisTick> FrequencyAxisTicks { get; init; }
}

[MessagePackObject(keyAsPropertyName: true)]
public sealed class SpectrogramPointsParameters
{
    public required int FftSize { get; init; }
    public required string WindowType { get; init; }
    public required double Overlap { get; init; }
    public required string Scale { get; init; }
    public required double GainDb { get; init; }
    public required double RangeDb { get; init; }
    public required double StartTimeSeconds { get; init; }
    public required double EndTimeSeconds { get; init; }
    public required int FrameCount { get; init; }
    public required int BinCount { get; init; }
    public required int SampleRate { get; init; }
    public required double MinDbSpl { get; init; }
    public required double MaxDbSpl { get; init; }
}

[MessagePackObject(keyAsPropertyName: true)]
public sealed class SpectrogramPointsRegion
{
    public required double StartSeconds { get; init; }
    public required double EndSeconds { get; init; }
    public required double DurationSeconds { get; init; }
}

[MessagePackObject(keyAsPropertyName: true)]
public sealed class SpectrogramChannelPoints
{
    public required string ChannelId { get; init; }
    public required string ChannelName { get; init; }

    /// <summary>
    /// [timeSeconds, frequencyHz, magnitudeDb] data points.
    /// Flattened 3D representation of the spectrogram time-frequency grid.
    /// </summary>
    public required double[][] Points { get; init; }

    public required int BinCount { get; init; }
    public required int FrameCount { get; init; }
    public required double NyquistHz { get; init; }
    public string? ColorbandLabel { get; init; }
    public string? CalibrationState { get; init; }
}
