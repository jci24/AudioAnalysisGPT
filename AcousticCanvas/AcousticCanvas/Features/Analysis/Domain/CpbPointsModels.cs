using MessagePack;

namespace AcousticCanvas.Features.Analysis.Domain;

/// <summary>
/// MessagePack-serializable CPB response where each channel contains
/// [x, y] data points instead of separate band objects.
/// Each point is [centerFrequencyHz, levelDb].
/// </summary>
[MessagePackObject(keyAsPropertyName: true)]
public sealed class CpbPointsResponse
{
    public required CpbPointsParameters Parameters { get; init; }
    public required CpbPointsRegion Region { get; init; }
    public required IReadOnlyList<CpbChannelPoints> Channels { get; init; }
}

[MessagePackObject(keyAsPropertyName: true)]
public sealed class CpbPointsParameters
{
    public required string BandMode { get; init; }
    public required int BandsPerOctave { get; init; }
    public required int FftSize { get; init; }
    public required string WindowType { get; init; }
    public required double Overlap { get; init; }
    public required string Averaging { get; init; }
    public required string Scaling { get; init; }
    public required string Method { get; init; }
    public required string Weighting { get; init; }
    public required string WeightingMethod { get; init; }
    public required IReadOnlyList<string> Limitations { get; init; }
    public required double StartTimeSeconds { get; init; }
    public required double EndTimeSeconds { get; init; }
    public required int BlockCount { get; init; }
    public required int SampleRate { get; init; }
}

[MessagePackObject(keyAsPropertyName: true)]
public sealed class CpbPointsRegion
{
    public required double StartSeconds { get; init; }
    public required double EndSeconds { get; init; }
    public required double DurationSeconds { get; init; }
}

[MessagePackObject(keyAsPropertyName: true)]
public sealed class CpbChannelPoints
{
    public required string ChannelId { get; init; }
    public required string ChannelName { get; init; }

    /// <summary>
    /// [centerFrequencyHz, levelDb] data points.
    /// </summary>
    public required double[][] Points { get; init; }

    public required string Quantity { get; init; }
    public required string Unit { get; init; }
    public required string? DbUnit { get; init; }
}
