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

    private static readonly string[] WorkspaceInstructionPhrases =
    [
        "click spectrogram evidence pill",
        "click the spectrogram evidence pill",
        "click evidence pill",
        "click the evidence pill",
        "inspect workspace card",
        "inspect the workspace card",
        "open workspace card",
        "open the workspace card",
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

        if (ContainsAnyPhrase(normalized, WorkspaceInstructionPhrases))
        {
            return "That is a UI action, not an audio-analysis request. Click the Spectrogram evidence pill in the chat to focus the matching Spectrogram card in the right workspace, then inspect the card there.";
        }

        if (IsSpectrogramSplQuestion(normalized))
        {
            return "The Agent spectrogram does not report SPL. It is a byte-normalized visualization of relative time-frequency energy, not a calibrated acoustic level measurement. To report SPL, the recording chain would need calibration metadata and a calibrated level analysis.";
        }

        if (IsSpectrogramDefinitionQuestion(normalized))
        {
            return "A spectrogram is a time-frequency view of audio. The horizontal axis represents time, the vertical axis represents frequency, and color or intensity represents the relative energy at each time and frequency. It is useful for seeing how tones, noise, bursts, and frequency content change over time.";
        }

        return null;
    }

    private static bool IsSpectrogramSplQuestion(string text)
    {
        return text.Contains("spectrogram", StringComparison.Ordinal)
            && (text.Contains("spl", StringComparison.Ordinal)
                || text.Contains("sound pressure", StringComparison.Ordinal)
                || text.Contains("calibrated level", StringComparison.Ordinal));
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
            && !text.Contains("spl", StringComparison.Ordinal)
            && !text.Contains("db", StringComparison.Ordinal)
            && !text.Contains("value", StringComparison.Ordinal)
            && !text.Contains("energy", StringComparison.Ordinal)
            && !text.Contains("cause", StringComparison.Ordinal)
            && !text.Contains("band", StringComparison.Ordinal)
            && !text.Contains("near", StringComparison.Ordinal)
            && !text.Contains("throughout", StringComparison.Ordinal)
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
