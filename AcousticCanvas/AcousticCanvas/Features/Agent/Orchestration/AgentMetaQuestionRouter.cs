namespace AcousticCanvas.Features.Agent.Orchestration;

public static class AgentMetaQuestionRouter
{
    private static readonly string[] WhyBothPhrases =
    [
        "why did you analyse both",
        "why did you analyze both",
        "why did you analyse all",
        "why did you analyze all",
        "why are you analysing both",
        "why are you analyzing both",
        "why are you analysing all",
        "why are you analyzing all",
        "why did it analyse both",
        "why did it analyze both",
    ];

    public static string? TryAnswer(string userQuestion)
    {
        var normalized = userQuestion.Trim().ToLowerInvariant();
        if (normalized.Length == 0)
        {
            return null;
        }

        if (ContainsAnyPhrase(normalized, WhyBothPhrases))
        {
            return "I analyzed both because the Agent request was given multiple files in the selected file list. When you want only one file, mention it explicitly with @filename; the Agent will then target only that file.";
        }

        if (IsSpectrogramDefinitionQuestion(normalized))
        {
            return "A spectrogram is a time-frequency view of audio. The horizontal axis represents time, the vertical axis represents frequency, and color or intensity represents the relative energy at each time and frequency. It is useful for seeing how tones, noise, bursts, and frequency content change over time.";
        }

        return null;
    }

    private static bool IsSpectrogramDefinitionQuestion(string text)
    {
        var asksDefinition = text.StartsWith("what is ", StringComparison.Ordinal)
            || text.StartsWith("what's ", StringComparison.Ordinal)
            || text.StartsWith("explain ", StringComparison.Ordinal)
            || text.StartsWith("define ", StringComparison.Ordinal)
            || text.StartsWith("what does ", StringComparison.Ordinal);

        return asksDefinition
            && text.Contains("spectrogram", StringComparison.Ordinal)
            && !text.Contains("show", StringComparison.Ordinal)
            && !text.Contains("file", StringComparison.Ordinal)
            && !text.Contains("@", StringComparison.Ordinal);
    }

    private static bool ContainsAnyPhrase(string text, string[] phrases)
    {
        foreach (var phrase in phrases)
        {
            if (text.Contains(phrase))
            {
                return true;
            }
        }
        return false;
    }
}
