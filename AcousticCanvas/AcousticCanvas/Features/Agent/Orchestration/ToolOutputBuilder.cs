namespace AcousticCanvas.Features.Agent.Orchestration;

public static class ToolOutputBuilder
{
    public static ToolExecutionOutput BuildSuccessOutput(
        string toolName,
        string resultRef,
        object resultData
    )
    {
        return new ToolExecutionOutput
        {
            ToolName = toolName,
            Status = "completed",
            ResultRef = resultRef,
            ResultData = resultData,
            StartedAtUtc = null,
            FinishedAtUtc = null,
        };
    }

    public static ToolExecutionOutput BuildSuccessOutputWithTiming(
        ToolExecutionOutput output,
        DateTime startedAtUtc,
        DateTime finishedAtUtc
    )
    {
        return new ToolExecutionOutput
        {
            ToolName = output.ToolName,
            Status = output.Status,
            ResultRef = output.ResultRef,
            ResultData = output.ResultData,
            ErrorCode = output.ErrorCode,
            ErrorMessage = output.ErrorMessage,
            StartedAtUtc = startedAtUtc,
            FinishedAtUtc = finishedAtUtc,
        };
    }

    public static ToolExecutionOutput BuildFailureOutput(
        string toolName,
        string errorCode,
        string errorMessage,
        DateTime? startedAtUtc = null,
        DateTime? finishedAtUtc = null
    )
    {
        return new ToolExecutionOutput
        {
            ToolName = toolName,
            Status = "failed",
            ResultRef = string.Empty,
            ErrorCode = errorCode,
            ErrorMessage = errorMessage,
            StartedAtUtc = startedAtUtc,
            FinishedAtUtc = finishedAtUtc,
        };
    }
}
