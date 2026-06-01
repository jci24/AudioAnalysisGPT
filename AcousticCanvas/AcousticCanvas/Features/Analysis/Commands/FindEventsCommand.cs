using FastEndpoints;
using AcousticCanvas.Features.Analysis.Domain;

namespace AcousticCanvas.Features.Analysis.Commands;

public record FindEventsCommand(
    string Kind,
    string FilePath,
    double? StartSeconds,
    double? EndSeconds
) : ICommand<FindEventsResult>;
