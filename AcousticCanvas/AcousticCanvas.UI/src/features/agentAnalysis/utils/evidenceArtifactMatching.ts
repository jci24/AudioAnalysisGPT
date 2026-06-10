import type { AgentArtifact } from '../agentWorkspaceSlice';
import type { AgentEvidenceItem } from './evidenceFormatting';

export function getEvidenceArtifactId(
  evidenceItem: AgentEvidenceItem,
  artifacts: AgentArtifact[],
): string | null {
  if (evidenceItem.type === 'findings') {
    const fileId = typeof evidenceItem.data.fileId === 'string' ? evidenceItem.data.fileId : null;
    const matchingArtifact = artifacts.find((artifact) =>
      artifact.type === 'findings_result' && artifact.fileId === fileId);
    return matchingArtifact?.id ?? null;
  }

  if (evidenceItem.type === 'event_detection') {
    const matchingArtifact = artifacts.find((artifact) => artifact.type === 'find_result');
    return matchingArtifact?.id ?? null;
  }

  if (evidenceItem.type.includes('comparison')) {
    const matchingArtifact = artifacts.find((artifact) => artifact.type === 'compare_result');
    return matchingArtifact?.id ?? null;
  }

  return null;
}
