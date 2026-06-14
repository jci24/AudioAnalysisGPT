namespace AcousticCanvas.Features.Analysis.Analyzers;

public static class CpbWeightingCalculator
{
    public static double ComputeWeightingCorrectionDb(double frequencyHz, string weighting)
    {
        return weighting switch
        {
            "a" => ComputeAWeightingCorrectionDb(frequencyHz),
            "c" => ComputeCWeightingCorrectionDb(frequencyHz),
            _ => 0.0,
        };
    }

    public static string NormalizeWeighting(string weighting)
    {
        if (weighting.Equals("a", StringComparison.OrdinalIgnoreCase))
        {
            return "a";
        }

        if (weighting.Equals("c", StringComparison.OrdinalIgnoreCase))
        {
            return "c";
        }

        return "z";
    }

    public static string GetWeightingMethod(string weighting)
    {
        return weighting switch
        {
            "a" => "A-weighting IEC 61672 nominal frequency response",
            "c" => "C-weighting IEC 61672 nominal frequency response",
            _ => "Z-weighting unweighted flat response",
        };
    }

    // BS/ISO 7196: frequency weighting (A/C) is defined for sound-pressure signals only.
    // For any other quantity the requested weighting is suppressed and Z response is used.
    public static string ResolveEffectiveWeighting(string requestedWeighting, string quantity)
    {
        if (requestedWeighting == "z")
        {
            return "z";
        }

        return string.Equals(quantity, "sound_pressure", StringComparison.OrdinalIgnoreCase)
            ? requestedWeighting
            : "z";
    }

    public static IReadOnlyList<string> BuildLimitations(
        string requestedWeighting,
        IEnumerable<string> quantities
    )
    {
        var limitations = new List<string>
        {
            "Nominal fractional-octave bands computed by summing FFT-bin power; not an IEC 61260 filter-bank analysis.",
        };

        if (
            requestedWeighting != "z"
            && quantities.Any(quantity =>
                !string.Equals(quantity, "sound_pressure", StringComparison.OrdinalIgnoreCase)
            )
        )
        {
            limitations.Add(
                $"{requestedWeighting.ToUpperInvariant()}-weighting was not applied to non-sound-pressure channels (BS/ISO 7196): frequency weighting is defined for sound pressure signals only."
            );
        }

        return limitations;
    }

    private static double ComputeAWeightingCorrectionDb(double frequencyHz)
    {
        if (frequencyHz <= 0.0)
        {
            return double.NegativeInfinity;
        }

        var frequencySquared = frequencyHz * frequencyHz;
        var numerator = Math.Pow(12200.0, 2.0) * frequencySquared * frequencySquared;
        var denominator =
            (frequencySquared + Math.Pow(20.6, 2.0))
            * Math.Sqrt(
                (frequencySquared + Math.Pow(107.7, 2.0))
                    * (frequencySquared + Math.Pow(737.9, 2.0))
            )
            * (frequencySquared + Math.Pow(12200.0, 2.0));

        return 20.0 * Math.Log10(numerator / denominator) + 2.0;
    }

    private static double ComputeCWeightingCorrectionDb(double frequencyHz)
    {
        if (frequencyHz <= 0.0)
        {
            return double.NegativeInfinity;
        }

        var frequencySquared = frequencyHz * frequencyHz;
        var numerator = Math.Pow(12200.0, 2.0) * frequencySquared;
        var denominator =
            (frequencySquared + Math.Pow(20.6, 2.0)) * (frequencySquared + Math.Pow(12200.0, 2.0));

        return 20.0 * Math.Log10(numerator / denominator) + 0.06;
    }
}
