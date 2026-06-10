import { describe, expect, it } from 'vitest';
import { getEvidenceArtifactId } from './evidenceArtifactMatching';
import type { AgentArtifact } from '../agentWorkspaceSlice';
import type { AgentEvidenceItem } from './evidenceFormatting';

const findingsArtifactA: AgentArtifact = {
  type: 'findings_result',
  id: 'artifact-a',
  timestamp: '2026-06-10T12:00:00.000Z',
  fileId: 'file-a',
  findingCount: 1,
  ranAt: '2026-06-10T12:00:00.000Z',
  findings: [],
};

const findingsArtifactB: AgentArtifact = {
  type: 'findings_result',
  id: 'artifact-b',
  timestamp: '2026-06-10T12:00:00.000Z',
  fileId: 'file-b',
  findingCount: 1,
  ranAt: '2026-06-10T12:00:00.000Z',
  findings: [],
};

describe('evidenceArtifactMatching', () => {
  it('matches findings evidence to the artifact for the same file', () => {
    const evidenceItem: AgentEvidenceItem = {
      evidenceId: 'ev_findings_file_b',
      type: 'findings',
      data: {
        fileId: 'file-b',
        fileName: 'sine_1000Hz.wav',
      },
    };

    const artifactId = getEvidenceArtifactId(evidenceItem, [findingsArtifactA, findingsArtifactB]);

    expect(artifactId).toBe('artifact-b');
  });
});
