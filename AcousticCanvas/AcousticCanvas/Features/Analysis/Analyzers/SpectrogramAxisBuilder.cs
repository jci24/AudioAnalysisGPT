using System.Globalization;
using AcousticCanvas.Features.Analysis.Domain;

namespace AcousticCanvas.Features.Analysis.Analyzers;

public static class SpectrogramAxisBuilder
{
    public static IReadOnlyList<SpectrogramAxisTick> BuildTimeAxisTicks(
        double startSeconds,
        double endSeconds,
        int tickCount
    )
    {
        var duration = endSeconds - startSeconds;
        if (duration <= 0.0 || tickCount <= 1)
        {
            return
            [
                new SpectrogramAxisTick
                {
                    PositionPercent = 0.0,
                    Label = startSeconds.ToString("F1", CultureInfo.InvariantCulture) + "s",
                },
            ];
        }

        var ticks = new SpectrogramAxisTick[tickCount];
        for (var i = 0; i < tickCount; i++)
        {
            var fraction = (double)i / (tickCount - 1);
            var timeSeconds = startSeconds + fraction * duration;
            ticks[i] = new SpectrogramAxisTick
            {
                PositionPercent = Math.Clamp(fraction * 100.0, 0.0, 100.0),
                Label = timeSeconds.ToString("F1", CultureInfo.InvariantCulture) + "s",
            };
        }
        return ticks;
    }

    public static IReadOnlyList<SpectrogramAxisTick> BuildFrequencyAxisTicks(
        double nyquistHz,
        string scale,
        int tickCount
    )
    {
        var normalizedScale = NormalizeScale(scale);
        var scaledNyquist = FrequencyToScale(Math.Max(0.0, nyquistHz), normalizedScale);
        if (scaledNyquist <= 0.0 || tickCount <= 1)
        {
            return [new SpectrogramAxisTick { PositionPercent = 100.0, Label = "0 Hz" }];
        }

        var ticks = new SpectrogramAxisTick[tickCount];
        for (var i = 0; i < tickCount; i++)
        {
            var fraction = (double)i / (tickCount - 1);
            var frequencyHz = ScaleToFrequency(fraction * scaledNyquist, normalizedScale);
            var label =
                frequencyHz >= 1000.0
                    ? (frequencyHz / 1000.0).ToString("F1", CultureInfo.InvariantCulture) + " kHz"
                    : Math.Round(frequencyHz).ToString(CultureInfo.InvariantCulture) + " Hz";
            ticks[i] = new SpectrogramAxisTick
            {
                PositionPercent = Math.Clamp((1.0 - fraction) * 100.0, 0.0, 100.0),
                Label = label,
            };
        }
        return ticks;
    }

    public static double[] RemapFrequencyScale(double[] amplitudes, string scale, double nyquistHz)
    {
        if (scale == "linear")
        {
            return amplitudes;
        }

        var remapped = new double[amplitudes.Length];
        var maxIndex = amplitudes.Length - 1;
        var maxScaledFrequency = FrequencyToScale(nyquistHz, scale);

        for (var index = 0; index < amplitudes.Length; index++)
        {
            var scaledFraction = maxIndex == 0 ? 0.0 : (double)index / maxIndex;
            var sourcePosition =
                ScaleToFrequency(scaledFraction * maxScaledFrequency, scale) / nyquistHz * maxIndex;
            sourcePosition = Math.Clamp(sourcePosition, 0.0, maxIndex);
            var lowerIndex = (int)Math.Floor(sourcePosition);
            var upperIndex = Math.Min(lowerIndex + 1, maxIndex);
            var interpolation = sourcePosition - lowerIndex;
            remapped[index] =
                amplitudes[lowerIndex] * (1.0 - interpolation)
                + amplitudes[upperIndex] * interpolation;
        }

        return remapped;
    }

    public static string NormalizeScale(string scale) =>
        (scale ?? string.Empty).ToLowerInvariant() switch
        {
            "linear" => "linear",
            "logarithmic" => "logarithmic",
            _ => "mel",
        };

    private static double FrequencyToScale(double frequencyHz, string scale) =>
        scale switch
        {
            "mel" => 2595.0 * Math.Log10(1.0 + frequencyHz / 700.0),
            "logarithmic" => Math.Log10(1.0 + frequencyHz),
            _ => frequencyHz,
        };

    private static double ScaleToFrequency(double scaledFrequency, string scale) =>
        scale switch
        {
            "mel" => 700.0 * (Math.Pow(10.0, scaledFrequency / 2595.0) - 1.0),
            "logarithmic" => Math.Pow(10.0, scaledFrequency) - 1.0,
            _ => scaledFrequency,
        };
}
