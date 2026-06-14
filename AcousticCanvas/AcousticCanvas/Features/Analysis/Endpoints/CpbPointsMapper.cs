using AcousticCanvas.Features.Analysis.Domain;

namespace AcousticCanvas.Features.Analysis.Endpoints;

public static class CpbPointsMapper
{
    public static CpbPointsResponse ToPointsResponse(CpbAnalysis analysis)
    {
        var channelPoints = new List<CpbChannelPoints>(analysis.Channels.Count);

        foreach (var channel in analysis.Channels)
        {
            if (channel.Bands.Count == 0)
            {
                continue;
            }

            var points = new double[channel.Bands.Count][];

            for (var i = 0; i < channel.Bands.Count; i++)
            {
                var band = channel.Bands[i];
                var centerFrequencyHz = band.CenterFrequencyHz;
                var yValue = band.LevelDb.HasValue ? band.LevelDb.Value : band.Magnitude;
                points[i] = new[] { centerFrequencyHz, yValue };
            }

            channelPoints.Add(
                new CpbChannelPoints
                {
                    ChannelId = channel.ChannelId,
                    ChannelName = channel.ChannelName,
                    Points = points,
                    Quantity = channel.Quantity,
                    Unit = channel.Unit,
                    DbUnit = channel.DbUnit,
                }
            );
        }

        return new CpbPointsResponse
        {
            Parameters = new CpbPointsParameters
            {
                BandMode = analysis.Parameters.BandMode,
                BandsPerOctave = analysis.Parameters.BandsPerOctave,
                FftSize = analysis.Parameters.FftSize,
                WindowType = analysis.Parameters.WindowType,
                Overlap = analysis.Parameters.Overlap,
                Averaging = analysis.Parameters.Averaging,
                Scaling = analysis.Parameters.Scaling,
                Method = analysis.Parameters.Method,
                Weighting = analysis.Parameters.Weighting,
                WeightingMethod = analysis.Parameters.WeightingMethod,
                Limitations = analysis.Parameters.Limitations,
                StartTimeSeconds = analysis.Parameters.StartTimeSeconds,
                EndTimeSeconds = analysis.Parameters.EndTimeSeconds,
                BlockCount = analysis.Parameters.BlockCount,
                SampleRate = analysis.Parameters.SampleRate,
            },
            Region = new CpbPointsRegion
            {
                StartSeconds = analysis.Region.StartSeconds,
                EndSeconds = analysis.Region.EndSeconds,
                DurationSeconds = analysis.Region.DurationSeconds,
            },
            Channels = channelPoints,
        };
    }
}
