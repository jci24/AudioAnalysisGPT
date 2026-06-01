using FastEndpoints;
using AcousticCanvas.Features.Analysis.Commands;
using AcousticCanvas.Features.Analysis.Domain;
using AcousticCanvas.Features.Analysis.Services;

namespace AcousticCanvas.Features.Analysis.Handlers;

public class RunCompareHandler(SignalAnalysisService analysisService)
    : CommandHandler<RunCompareCommand, CompareResult>
{
    private const int DefaultFftSize = 8192;
    private const double DefaultOverlap = 0.5;

    public override async Task<CompareResult> ExecuteAsync(RunCompareCommand command, CancellationToken ct)
    {
        ct.ThrowIfCancellationRequested();

        if (command.FilePaths.Count < 2)
        {
            throw new ArgumentException("At least two files are required for comparison.");
        }

        for (int index = 0; index < command.FilePaths.Count; index++)
        {
            if (!File.Exists(command.FilePaths[index]))
            {
                throw new FileNotFoundException($"Audio file {index + 1} not found: {command.FilePaths[index]}");
            }
        }

        var summaries = new List<CompareFileSummary>();
        for (int index = 0; index < command.FilePaths.Count; index++)
        {
            var summary = await BuildFileSummary(command.FilePaths[index], command.StartSeconds, command.EndSeconds, ct);
            summaries.Add(summary);
        }

        var pairwiseDiffs = new List<PairwiseDiff>();
        for (int i = 0; i < summaries.Count; i++)
        {
            for (int j = i + 1; j < summaries.Count; j++)
            {
                var a = summaries[i];
                var b = summaries[j];
                pairwiseDiffs.Add(new PairwiseDiff
                {
                    FileIdA = a.FileId,
                    FileIdB = b.FileId,
                    PeakDeltaDb = b.PeakDb - a.PeakDb,
                    HigherPeakFileId = a.PeakDb >= b.PeakDb ? a.FileId : b.FileId,
                    RmsDeltaDb = b.RmsDb - a.RmsDb,
                    HigherRmsFileId = a.RmsDb >= b.RmsDb ? a.FileId : b.FileId,
                    CrestFactorDeltaDb = b.CrestFactorDb - a.CrestFactorDb,
                    HigherCrestFactorFileId = a.CrestFactorDb >= b.CrestFactorDb ? a.FileId : b.FileId,
                    PeakFrequencyDeltaHz = b.PeakFrequencyHz - a.PeakFrequencyHz,
                    HigherPeakFrequencyFileId = a.PeakFrequencyHz >= b.PeakFrequencyHz ? a.FileId : b.FileId,
                });
            }
        }

        return new CompareResult
        {
            Files = summaries,
            PairwiseDiffs = pairwiseDiffs,
            RanAt = DateTimeOffset.UtcNow,
        };
    }

    private async Task<CompareFileSummary> BuildFileSummary(
        string filePath,
        double? startSeconds,
        double? endSeconds,
        CancellationToken ct)
    {
        var fullResult = analysisService.Analyze(filePath);
        var duration = fullResult.FileInfo.DurationSeconds;
        var resolvedStart = startSeconds ?? 0.0;
        var resolvedEnd = endSeconds ?? duration;

        var firstChannel = fullResult.Level.Channels.Count > 0 ? fullResult.Level.Channels[0] : null;
        var peakDb = firstChannel?.PeakDb ?? 0.0;
        var rmsDb = firstChannel?.RmsDb ?? 0.0;
        var crestFactorDb = firstChannel?.CrestFactorDb ?? 0.0;

        var spectrumQuery = new RunSpectrumQuery(
            FilePath: filePath,
            StartSeconds: resolvedStart,
            EndSeconds: resolvedEnd,
            FftSize: DefaultFftSize,
            Overlap: DefaultOverlap);

        var spectrumResult = await spectrumQuery.ExecuteAsync(ct);
        var spectrumChannel = spectrumResult.Channels.Count > 0 ? spectrumResult.Channels[0] : null;
        var peakFrequencyHz = spectrumChannel?.PeakFrequencyHz ?? 0.0;
        var peakFrequencyMagnitudeDb = spectrumChannel?.MaxMagnitudeDb ?? 0.0;

        return new CompareFileSummary
        {
            FileId = filePath,
            FileName = Path.GetFileName(filePath),
            PeakDb = peakDb,
            RmsDb = rmsDb,
            CrestFactorDb = crestFactorDb,
            PeakFrequencyHz = peakFrequencyHz,
            PeakFrequencyMagnitudeDb = peakFrequencyMagnitudeDb,
            RegionStartSeconds = resolvedStart,
            RegionEndSeconds = resolvedEnd,
        };
    }
}
