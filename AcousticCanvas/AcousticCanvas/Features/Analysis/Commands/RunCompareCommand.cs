using FastEndpoints;
using AcousticCanvas.Features.Analysis.Domain;

namespace AcousticCanvas.Features.Analysis.Commands;

public record RunCompareCommand(
    IReadOnlyList<string> FilePaths,
    double? StartSeconds,
    double? EndSeconds
) : ICommand<CompareResult>;
