namespace AcousticCanvas.Features.Analysis.Domain;

public sealed class AudioEvent
{
    public required string Kind { get; init; }
    public required double StartSeconds { get; init; }
    public required double EndSeconds { get; init; }
    public required double DurationSeconds { get; init; }
    public required string Description { get; init; }
    public required Dictionary<string, object?> Metadata { get; init; }
}

public sealed class FindEventsResult
{
    public required string FileId { get; init; }
    public required string Kind { get; init; }
    public required IReadOnlyList<AudioEvent> Events { get; init; }
    public required int EventCount { get; init; }
    public required double RegionStartSeconds { get; init; }
    public required double RegionEndSeconds { get; init; }
    public required DateTimeOffset RanAt { get; init; }
}
