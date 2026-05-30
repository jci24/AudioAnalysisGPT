using FastEndpoints;

namespace AcousticCanvas.Features.AudioUpload;

public class UploadAudioEndpoint(UploadAudioHandler handler)
    : Endpoint<UploadAudioRequest, AudioFileResponse>
{
    public override void Configure()
    {
        Post("/api/audio/upload");
        AllowAnonymous();
        AllowFileUploads();
    }

    public override async Task HandleAsync(UploadAudioRequest request, CancellationToken cancellationToken)
    {
        if (request.File is not { Length: > 0 })
        {
            ThrowError("No audio file provided");
            return;
        }

        await using var fileStream = request.File.OpenReadStream();

        var response = await Task.Run(
            () => handler.Handle(fileStream, request.File.FileName),
            cancellationToken
        );

        Response = response;
    }
}

public class UploadAudioRequest
{
    public IFormFile File { get; set; } = null!;
}
