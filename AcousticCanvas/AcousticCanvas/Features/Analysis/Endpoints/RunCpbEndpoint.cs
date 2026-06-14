using AcousticCanvas.Features.Analysis.Commands;
using AcousticCanvas.Features.Analysis.Domain;
using AcousticCanvas.Features.AudioUpload.Services;
using FastEndpoints;
using MessagePack;

namespace AcousticCanvas.Features.Analysis.Endpoints;

public class RunCpbEndpoint(AudioFileRepository audioFileRepository)
    : Endpoint<RunCpbRequest, CpbAnalysis>
{
    public override void Configure()
    {
        Post("/api/analysis/cpb");
        AllowAnonymous();
    }

    public override async Task HandleAsync(
        RunCpbRequest request,
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

        var query = new RunCpbQuery(
            FilePath: filePath,
            StartSeconds: request.StartSeconds,
            EndSeconds: request.EndSeconds,
            BandMode: request.BandMode,
            FftSize: request.FftSize,
            Overlap: request.Overlap,
            Weighting: request.Weighting,
            Method: request.Method
        );

        try
        {
            var result = await query.ExecuteAsync(cancellationToken);

            if (string.Equals(request.Format, "msgpack", StringComparison.OrdinalIgnoreCase))
            {
                var pointsResponse = CpbPointsMapper.ToPointsResponse(result);
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
                $"CPB analysis error: {ex.GetType().Name}: {ex.Message}",
                cancellationToken
            );
        }
    }
}

public class RunCpbRequest
{
    public string FileId { get; set; } = string.Empty;
    public double StartSeconds { get; set; }
    public double EndSeconds { get; set; }
    public string BandMode { get; set; } = "third_octave";
    public int FftSize { get; set; } = 44100;
    public double Overlap { get; set; } = 0.5;
    public string Weighting { get; set; } = "z";
    public string Method { get; set; } = "fft_bin_power_sum";
    public string Format { get; set; } = "json";
}
