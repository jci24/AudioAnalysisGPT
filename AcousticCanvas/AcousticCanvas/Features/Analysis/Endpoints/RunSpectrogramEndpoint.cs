using AcousticCanvas.Features.Analysis.Commands;
using AcousticCanvas.Features.Analysis.Domain;
using AcousticCanvas.Features.AudioUpload.Services;
using FastEndpoints;
using MessagePack;

namespace AcousticCanvas.Features.Analysis.Endpoints;

public class RunSpectrogramEndpoint(AudioFileRepository audioFileRepository)
    : Endpoint<RunSpectrogramRequest, SpectrogramAnalysis>
{
    public override void Configure()
    {
        Post("/api/analysis/spectrogram");
        AllowAnonymous();
    }

    public override async Task HandleAsync(
        RunSpectrogramRequest request,
        CancellationToken cancellationToken
    )
    {
        var filePath = audioFileRepository.GetFilePath(request.FileId);
        if (string.IsNullOrEmpty(filePath))
        {
            HttpContext.Response.StatusCode = 404;
            await HttpContext.Response.WriteAsync("Audio file not found.", cancellationToken);
            return;
        }

        var query = new RunSpectrogramQuery(
            FilePath: filePath,
            StartSeconds: request.StartSeconds,
            EndSeconds: request.EndSeconds,
            FftSize: request.FftSize,
            Overlap: request.Overlap,
            Scale: request.Scale,
            GainDb: request.GainDb,
            RangeDb: request.RangeDb,
            MinDbSpl: request.MinDbSpl,
            MaxDbSpl: request.MaxDbSpl
        );

        try
        {
            var result = await query.ExecuteAsync(cancellationToken);

            if (string.Equals(request.Format, "msgpack", StringComparison.OrdinalIgnoreCase))
            {
                var pointsResponse = SpectrogramPointsMapper.ToPointsResponse(result);
                var bytes = MessagePackSerializer.Serialize(pointsResponse);
                HttpContext.Response.ContentType = "application/x-msgpack";
                HttpContext.Response.StatusCode = 200;
                await HttpContext.Response.Body.WriteAsync(bytes, cancellationToken);
                await HttpContext.Response.CompleteAsync();
                return;
            }

            Response = result;
        }
        catch (Exception ex)
        {
            HttpContext.Response.StatusCode = 500;
            await HttpContext.Response.WriteAsync(
                $"Spectrogram analysis error: {ex.GetType().Name}: {ex.Message}",
                cancellationToken
            );
        }
    }
}

public class RunSpectrogramRequest
{
    public string FileId { get; set; } = string.Empty;
    public double StartSeconds { get; set; }
    public double EndSeconds { get; set; }
    public int FftSize { get; set; } = 44100;
    public double Overlap { get; set; } = 0.75;
    public string Scale { get; set; } = "mel";
    public double GainDb { get; set; } = 20.0;
    public double RangeDb { get; set; } = 80.0;
    public double MinDbSpl { get; set; } = -68.0;
    public double MaxDbSpl { get; set; } = 55.0;
    public string Format { get; set; } = "json";
}
