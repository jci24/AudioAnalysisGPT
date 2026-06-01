import type { AppDispatch, RootState } from '../../../store/reduxStore';
import type { OpenAiToolCall } from './openAiClient';
import { getStateTool } from '../../agent/utils/getStateTool';
import { callAnalyzeTool } from '../../agent/services/analyzeToolService';
import { callCompareTool } from '../../agent/services/compareToolService';
import { callFindTool } from '../../agent/services/findToolService';
import { applyWorkspaceAction } from '../../agent/utils/workspaceTool';
import type { AnalysisKind, WorkspaceAction } from '../../agent/agentToolTypes';
import { analysisArtifactAdded, markerArtifactAdded, selectionArtifactAdded, compareArtifactAdded, findArtifactAdded, reportArtifactAdded } from '../agentWorkspaceSlice';
import type { AgentArtifact } from '../agentWorkspaceSlice';

export type ToolExecutionResult = {
  toolCallId: string;
  toolName: string;
  resultJson: string;
};

function stripPathToFileName(value: string): string {
  const lastSlash = Math.max(value.lastIndexOf('/'), value.lastIndexOf('\\'));
  return lastSlash >= 0 ? value.slice(lastSlash + 1) : value;
}

function sanitizeResultForLlm(json: string): string {
  try {
    const parsed = JSON.parse(json) as unknown;
    const sanitized = sanitizeValue(parsed);
    return JSON.stringify(sanitized);
  } catch {
    return json;
  }
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }
  if (value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>;
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      const isPathField = k === 'fileId' || k === 'fileIdA' || k === 'fileIdB';
      if (isPathField && typeof v === 'string') {
        result[k] = stripPathToFileName(v);
      } else {
        result[k] = sanitizeValue(v);
      }
    }
    return result;
  }
  return value;
}

function executeGetState(state: RootState): string {
  const result = getStateTool(state);
  const safeResult = {
    projectName: result.projectName,
    projectStatus: result.projectStatus,
    loadedFiles: result.loadedFiles,
    activeFile: result.activeFile,
    activeSelection: result.activeSelection,
    visibleViews: result.visibleViews,
    availableTools: result.capabilities.tools.map((tool) => tool.tool),
    availableAnalysisKinds: result.capabilities.analysisKinds.map((entry) => entry.kind),
  };
  return JSON.stringify(safeResult);
}

async function executeAnalyze(
  dispatch: AppDispatch,
  parsedArgs: Record<string, unknown>,
  state: RootState,
): Promise<string> {
  const kind = parsedArgs['kind'] as AnalysisKind;
  const fileId = parsedArgs['fileId'] as string;

  const activeSelection = state.waveformSelection.activeSelection;
  const selectionIsValid = activeSelection !== null
    && activeSelection.endSeconds > activeSelection.startSeconds;

  const argsStartSeconds = typeof parsedArgs['startSeconds'] === 'number' ? parsedArgs['startSeconds'] : null;
  const argsEndSeconds = typeof parsedArgs['endSeconds'] === 'number' ? parsedArgs['endSeconds'] : null;

  const startSeconds = argsStartSeconds ?? (selectionIsValid ? activeSelection!.startSeconds : null);
  const endSeconds = argsEndSeconds ?? (selectionIsValid ? activeSelection!.endSeconds : null);

  const validKinds: AnalysisKind[] = ['file_info', 'level', 'spectrum'];
  const isValidKind = validKinds.includes(kind);
  if (!isValidKind) {
    return JSON.stringify({ error: `Unknown analysis kind: ${kind}. Supported: file_info, level, spectrum.` });
  }

  if (!fileId) {
    return JSON.stringify({ error: 'fileId is required for analyze().' });
  }

  const result = await callAnalyzeTool({ kind, fileId, startSeconds, endSeconds });

  dispatch(analysisArtifactAdded({
    type: 'analysis_result',
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    result,
  }));

  return JSON.stringify(result);
}

function executeWorkspace(
  dispatch: AppDispatch,
  parsedArgs: Record<string, unknown>,
): string {
  const action = parsedArgs['action'] as string;

  const workspaceAction = parsedArgs as unknown as WorkspaceAction;
  const workspaceResult = applyWorkspaceAction(dispatch, workspaceAction);

  if (workspaceResult.success) {
    if (action === 'add_marker') {
      dispatch(markerArtifactAdded({
        type: 'marker_added',
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        fileId: parsedArgs['fileId'] as string,
        timeSeconds: parsedArgs['timeSeconds'] as number,
        label: parsedArgs['label'] as string,
      }));
    }

    if (action === 'set_selection' || action === 'set_loop_region') {
      dispatch(selectionArtifactAdded({
        type: 'selection_set',
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        startSeconds: parsedArgs['startSeconds'] as number,
        endSeconds: parsedArgs['endSeconds'] as number,
      }));
    }
  }

  return JSON.stringify(workspaceResult);
}

function buildReportMarkdown(title: string, artifacts: AgentArtifact[], generatedAt: string): string {
  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push(`*Generated: ${generatedAt}*`);
  lines.push('');

  const analysisArtifacts = artifacts.filter((a) => a.type === 'analysis_result');
  const compareArtifacts = artifacts.filter((a) => a.type === 'compare_result');
  const findArtifacts = artifacts.filter((a) => a.type === 'find_result');
  const markerArtifacts = artifacts.filter((a) => a.type === 'marker_added');

  if (analysisArtifacts.length > 0) {
    lines.push('## Analysis Results');
    lines.push('');
    for (const artifact of analysisArtifacts) {
      if (artifact.type !== 'analysis_result') continue;
      const result = artifact.result;
      const regionText = result.regionStart !== null && result.regionEnd !== null
        ? ` (${result.regionStart.toFixed(3)}s – ${result.regionEnd.toFixed(3)}s)`
        : ' (full file)';
      lines.push(`### ${result.kind}${regionText}`);
      lines.push('');
      for (const [key, value] of Object.entries(result.summary)) {
        if (value === null || value === undefined) continue;
        const formattedKey = key.replace(/([A-Z])/g, ' $1').toLowerCase();
        const formattedValue = typeof value === 'number'
          ? (Number.isInteger(value) ? String(value) : (value as number).toFixed(4))
          : String(value);
        lines.push(`- **${formattedKey}:** ${formattedValue}`);
      }
      lines.push('');
    }
  }

  if (compareArtifacts.length > 0) {
    lines.push('## Comparisons');
    lines.push('');
    for (const artifact of compareArtifacts) {
      if (artifact.type !== 'compare_result') continue;
      const result = artifact.result;
      lines.push('### File Comparison');
      lines.push('');
      for (const file of result.files) {
        const fileName = stripPathToFileName(file.fileId);
        lines.push(`**${fileName}** — peak: ${file.peakDb.toFixed(2)} dBFS · RMS: ${file.rmsDb.toFixed(2)} dBFS · crest: ${file.crestFactorDb.toFixed(2)} dB · peak freq: ${file.peakFrequencyHz.toFixed(0)} Hz`);
      }
      lines.push('');
      for (const diff of result.pairwiseDiffs) {
        const nameA = stripPathToFileName(diff.fileIdA);
        const nameB = stripPathToFileName(diff.fileIdB);
        lines.push(`**${nameA} vs ${nameB}** — peak Δ: ${diff.peakDeltaDb.toFixed(2)} dB · RMS Δ: ${diff.rmsDeltaDb.toFixed(2)} dB`);
      }
      lines.push('');
    }
  }

  if (findArtifacts.length > 0) {
    lines.push('## Detected Events');
    lines.push('');
    for (const artifact of findArtifacts) {
      if (artifact.type !== 'find_result') continue;
      const result = artifact.result;
      const fileName = stripPathToFileName(result.fileId);
      lines.push(`### ${result.kind} — ${fileName}`);
      lines.push(`*${result.eventCount} event(s) found*`);
      lines.push('');
      for (const event of result.events) {
        lines.push(`- **${event.startSeconds.toFixed(3)}s – ${event.endSeconds.toFixed(3)}s** (${event.durationSeconds.toFixed(3)}s): ${event.description}`);
      }
      lines.push('');
    }
  }

  if (markerArtifacts.length > 0) {
    lines.push('## Markers');
    lines.push('');
    for (const artifact of markerArtifacts) {
      if (artifact.type !== 'marker_added') continue;
      lines.push(`- **${artifact.label}** at ${artifact.timeSeconds.toFixed(3)}s`);
    }
    lines.push('');
  }

  if (analysisArtifacts.length === 0 && compareArtifacts.length === 0 && findArtifacts.length === 0 && markerArtifacts.length === 0) {
    lines.push('*No analysis results found in this session. Run some analyses first.*');
  }

  return lines.join('\n');
}

function executeReport(
  dispatch: AppDispatch,
  parsedArgs: Record<string, unknown>,
  state: RootState,
): string {
  const artifacts = state.agentWorkspace.artifacts;
  const customTitle = typeof parsedArgs['title'] === 'string' ? parsedArgs['title'] : null;
  const generatedAt = new Date().toLocaleString();
  const title = customTitle ?? `AcousticCanvas Session Report — ${generatedAt}`;

  const markdownContent = buildReportMarkdown(title, artifacts, generatedAt);

  dispatch(reportArtifactAdded({
    type: 'report',
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    title,
    markdownContent,
  }));

  return JSON.stringify({ success: true, title, characterCount: markdownContent.length });
}

type ParseSuccess = { success: true; value: Record<string, unknown> };
type ParseFailure = { success: false };
type ParseJsonResult = ParseSuccess | ParseFailure;

function tryParseJson(raw: string): ParseJsonResult {
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    return { success: true, value };
  } catch {
    return { success: false };
  }
}

export async function executeToolCall(
  toolCall: OpenAiToolCall,
  dispatch: AppDispatch,
  state: RootState,
): Promise<ToolExecutionResult> {
  const toolName = toolCall.function.name;

  const parseResult = tryParseJson(toolCall.function.arguments);
  if (!parseResult.success) {
    return {
      toolCallId: toolCall.id,
      toolName,
      resultJson: JSON.stringify({ error: 'Failed to parse tool arguments.' }),
    };
  }
  const parsedArgs = parseResult.value;

  let resultJson: string;

  if (toolName === 'getState') {
    resultJson = executeGetState(state);
  } else if (toolName === 'analyze') {
    try {
      resultJson = await executeAnalyze(dispatch, parsedArgs, state);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      resultJson = JSON.stringify({ error: errorMessage });
    }
  } else if (toolName === 'compare') {
    try {
      const fileIds = Array.isArray(parsedArgs['fileIds']) ? parsedArgs['fileIds'] as string[] : [];
      const startSeconds = typeof parsedArgs['startSeconds'] === 'number' ? parsedArgs['startSeconds'] : null;
      const endSeconds = typeof parsedArgs['endSeconds'] === 'number' ? parsedArgs['endSeconds'] : null;
      const compareResult = await callCompareTool({ fileIds, startSeconds, endSeconds });
      dispatch(compareArtifactAdded({
        type: 'compare_result',
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        result: compareResult,
      }));
      resultJson = JSON.stringify(compareResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Compare failed';
      resultJson = JSON.stringify({ error: errorMessage });
    }
  } else if (toolName === 'find') {
    try {
      const fileId = typeof parsedArgs['fileId'] === 'string' ? parsedArgs['fileId'] : '';
      const kind = typeof parsedArgs['kind'] === 'string' ? parsedArgs['kind'] as 'clipping' | 'silence' | 'loudest' | 'transient' : 'clipping';
      const startSeconds = typeof parsedArgs['startSeconds'] === 'number' ? parsedArgs['startSeconds'] : null;
      const endSeconds = typeof parsedArgs['endSeconds'] === 'number' ? parsedArgs['endSeconds'] : null;
      const findResult = await callFindTool({ fileId, kind, startSeconds, endSeconds });
      dispatch(findArtifactAdded({
        type: 'find_result',
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        result: findResult,
      }));
      resultJson = JSON.stringify(findResult);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Find failed';
      resultJson = JSON.stringify({ error: errorMessage });
    }
  } else if (toolName === 'workspace') {
    resultJson = executeWorkspace(dispatch, parsedArgs);
  } else if (toolName === 'report') {
    resultJson = executeReport(dispatch, parsedArgs, state);
  } else {
    resultJson = JSON.stringify({ error: `Unknown tool: ${toolName}. Available tools: getState, analyze, compare, find, workspace, report.` });
  }

  return {
    toolCallId: toolCall.id,
    toolName,
    resultJson: sanitizeResultForLlm(resultJson),
  };
}
