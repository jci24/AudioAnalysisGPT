using AcousticCanvas.Features.Agent.Commands;

namespace AcousticCanvas.Features.Agent.Orchestration;

public static class AgentResultBuilder
{
    public static AgentAskResult BuildClarificationResult(string conversationId, string question)
    {
        return new AgentAskResult(
            ConversationId: conversationId,
            Answer: question,
            EvidencePackageId: string.Empty,
            EvidenceReferences: [],
            EvidenceItems: [],
            Confidence: "low",
            Limitations: ["Clarification needed before analysis can run."],
            SuggestedNextSteps: [],
            ToolExecutions: [],
            ValidationWarning: false,
            ToolResultsData: null,
            PlannedTools: [],
            PlannerReason: null,
            InvestigationTrace: null
        );
    }

    public static AgentAskResult BuildNoAnalysisResult(
        string conversationId,
        string userQuestion,
        string reason
    )
    {
        return new AgentAskResult(
            ConversationId: conversationId,
            Answer: reason,
            EvidencePackageId: string.Empty,
            EvidenceReferences: [],
            EvidenceItems: [],
            Confidence: "low",
            Limitations: [],
            SuggestedNextSteps: [],
            ToolExecutions: [],
            ValidationWarning: false,
            ToolResultsData: null,
            PlannedTools: [],
            PlannerReason: null,
            InvestigationTrace: null
        );
    }

    public static AgentAskResult BuildNoToolConversationResult(
        string conversationId,
        string answer,
        InvestigationTrace investigationTrace
    )
    {
        return new AgentAskResult(
            ConversationId: conversationId,
            Answer: answer,
            EvidencePackageId: string.Empty,
            EvidenceReferences: [],
            EvidenceItems: [],
            Confidence: "high",
            Limitations: [],
            SuggestedNextSteps: [],
            ToolExecutions: [],
            ValidationWarning: false,
            ToolResultsData: null,
            PlannedTools: [],
            PlannerReason: "Answered as an Agent behavior question; no audio analysis was needed.",
            InvestigationTrace: investigationTrace
        );
    }

    public static IReadOnlyList<AgentToolExecutionRecord> BuildToolExecutionRecords(
        List<ToolExecutionOutput> toolOutputs
    )
    {
        var records = new List<AgentToolExecutionRecord>();

        foreach (var output in toolOutputs)
        {
            records.Add(new AgentToolExecutionRecord(
                ToolName: output.ToolName,
                Status: output.Status,
                ResultRef: output.Status == "completed" ? output.ResultRef : null,
                ErrorCode: output.ErrorCode,
                ErrorMessage: output.ErrorMessage
            ));
        }

        return records;
    }

    public static IReadOnlyDictionary<string, object>? BuildToolResultsData(
        IEnumerable<ToolExecutionOutput> toolOutputs
    )
    {
        var dict = new Dictionary<string, object>();

        foreach (var output in toolOutputs)
        {
            if (output.Status == "completed"
                && output.ResultData is not null
                && !string.IsNullOrEmpty(output.ResultRef))
            {
                dict[output.ResultRef] = output.ResultData;
            }
        }

        return dict.Count > 0 ? dict : null;
    }

    public static IReadOnlyList<AgentEvidenceItem> BuildEvidenceItems(EvidencePackage evidencePackage)
    {
        var evidenceItems = new List<AgentEvidenceItem>();

        foreach (var item in evidencePackage.KeyEvidence)
        {
            evidenceItems.Add(new AgentEvidenceItem(
                EvidenceId: item.EvidenceId,
                Type: item.Type,
                Data: item.Data
            ));
        }

        return evidenceItems;
    }

    public static IReadOnlyList<PlannedToolTrace> BuildPlannedToolTraces(
        List<PlannerToolRequest> toolRequests
    )
    {
        var traces = new List<PlannedToolTrace>();

        foreach (var request in toolRequests)
        {
            traces.Add(new PlannedToolTrace(Name: request.Name, Arguments: request.Arguments));
        }

        return traces;
    }

    public static IReadOnlyList<ToolExecutionTrace> BuildToolExecutionTraces(
        List<ToolExecutionOutput> toolOutputs
    )
    {
        var traces = new List<ToolExecutionTrace>();

        foreach (var output in toolOutputs)
        {
            traces.Add(new ToolExecutionTrace(
                Name: output.ToolName,
                Status: output.Status,
                StartedAtUtc: output.StartedAtUtc,
                FinishedAtUtc: output.FinishedAtUtc,
                ErrorMessage: output.ErrorMessage
            ));
        }

        return traces;
    }

    public static InvestigationTrace BuildInvestigationTrace(
        string conversationId,
        string question,
        InvestigationPath path,
        IReadOnlyList<PlannedToolTrace> plannedTools,
        IReadOnlyList<ToolExecutionTrace> toolExecutions,
        string finalAnswer,
        string confidence
    )
    {
        return new InvestigationTrace(
            Question: question,
            ConversationId: conversationId,
            Path: path,
            PlannedTools: plannedTools,
            ToolExecutions: toolExecutions,
            FinalAnswer: finalAnswer,
            Confidence: confidence,
            TimestampUtc: DateTime.UtcNow
        );
    }

    public static IReadOnlyList<string> MergeAndDeduplicate(
        IReadOnlyList<string> fromAgent,
        IReadOnlyList<string> fromEvidence
    )
    {
        var merged = new List<string>();
        var seen = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var item in fromAgent)
        {
            if (!string.IsNullOrWhiteSpace(item) && seen.Add(item))
            {
                merged.Add(item);
            }
        }

        foreach (var item in fromEvidence)
        {
            if (!string.IsNullOrWhiteSpace(item) && seen.Add(item))
            {
                merged.Add(item);
            }
        }

        return merged;
    }
}
