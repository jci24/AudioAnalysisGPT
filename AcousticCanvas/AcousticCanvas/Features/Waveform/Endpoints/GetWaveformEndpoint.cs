using FastEndpoints;
using AcousticCanvas.Features.AudioUpload.Handlers;
using AcousticCanvas.Features.Waveform.Commands;

namespace AcousticCanvas.Features.Waveform.Endpoints;

public class GetWaveformEndpoint(UploadAudioHandler uploadAudioHandler)
    : Endpoint<GetWaveformRequest, WaveformResult>
{
    public override void Configure()
    {
        Get("/api/waveform");
        AllowAnonymous();
    }

    public override async Task HandleAsync(GetWaveformRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.FileId))
        {
            ThrowError("fileId is required");
            return;
        }

        var resolvedPoints = request.Points is > 0 ? request.Points.Value : 1000;

        var filePath = uploadAudioHandler.GetFilePath(request.FileId);
        if (string.IsNullOrEmpty(filePath))
        {
            HttpContext.Response.StatusCode = 404;
            await HttpContext.Response.WriteAsync("Audio file not found.", cancellationToken);
            return;
        }

        var query = new GetWaveformQuery(FilePath: filePath, Points: resolvedPoints);
        Response = await query.ExecuteAsync(cancellationToken);
    }
}

public class GetWaveformRequest
{
    public string FileId { get; set; } = string.Empty;
    public int? Points { get; set; }
}
