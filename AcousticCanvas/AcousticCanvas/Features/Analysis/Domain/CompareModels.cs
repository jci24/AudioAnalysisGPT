namespace AcousticCanvas.Features.Analysis.Domain;

public sealed class CompareFileSummary
{
    public required string FileId { get; init; }
    public required string FileName { get; init; }
    public required double PeakDb { get; init; }
    public required double RmsDb { get; init; }
    public required double CrestFactorDb { get; init; }
    public required double PeakFrequencyHz { get; init; }
    public required double PeakFrequencyMagnitudeDb { get; init; }
    public required double RegionStartSeconds { get; init; }
    public required double RegionEndSeconds { get; init; }
}

public sealed class PairwiseDiff
{
    public required string FileIdA { get; init; }
    public required string FileIdB { get; init; }
    public required double PeakDeltaDb { get; init; }
    public required double RmsDeltaDb { get; init; }
    public required double CrestFactorDeltaDb { get; init; }
    public required double PeakFrequencyDeltaHz { get; init; }
}

public sealed class CompareResult
{
    public required IReadOnlyList<CompareFileSummary> Files { get; init; }
    public required IReadOnlyList<PairwiseDiff> PairwiseDiffs { get; init; }
    public required DateTimeOffset RanAt { get; init; }
}
