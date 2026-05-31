using AcousticCanvas.Features.Analysis.Analyzers;
using AcousticCanvas.Features.Analysis.Domain;
using AcousticCanvas.Features.Analysis.Importers;

namespace AcousticCanvas.Features.Analysis.Services;

public sealed class SignalAnalysisService
{
    private readonly IReadOnlyList<ISignalFileImporter> _importers;

    public SignalAnalysisService(IReadOnlyList<ISignalFileImporter> importers)
    {
        _importers = importers;
    }

    public AnalysisResult Analyze(string filePath)
    {
        var importer = ResolveImporter(filePath);
        var signalFile = importer.Import(filePath);
        var levelAnalysis = LevelAnalyzer.Analyze(signalFile.Channels);

        return new AnalysisResult
        {
            FileInfo = signalFile.FileInfo,
            Level = levelAnalysis,
            AnalyzedAt = DateTimeOffset.UtcNow,
        };
    }

    private ISignalFileImporter ResolveImporter(string filePath)
    {
        foreach (var importer in _importers)
        {
            if (importer.CanImport(filePath))
            {
                return importer;
            }
        }
        throw new NotSupportedException($"No importer found for file: {Path.GetFileName(filePath)}");
    }
}
