using FastEndpoints;
using AcousticCanvas.Features.Analysis.Domain;

namespace AcousticCanvas.Features.Analysis.Commands;

public record RunAnalysisQuery(string FilePath) : ICommand<AnalysisResult>;
