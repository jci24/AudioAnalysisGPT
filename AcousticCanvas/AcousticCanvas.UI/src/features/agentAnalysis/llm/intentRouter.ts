export type RoutedToolHint =
  | {
      toolName: 'analyze';
      args: { kind: 'file_info' | 'level' | 'spectrum' };
      confidence: 'high' | 'medium';
      reason: string;
    }
  | {
      toolName: 'find';
      args: { kind: 'clipping' | 'silence' | 'loudest' | 'transient' };
      confidence: 'high' | 'medium';
      reason: string;
    }
  | {
      toolName: 'compare';
      args: Record<string, never>;
      confidence: 'high' | 'medium';
      reason: string;
    }
  | {
      toolName: 'workspace';
      args: { action: 'add_marker' | 'set_selection' };
      confidence: 'high' | 'medium';
      reason: string;
    }
  | {
      toolName: 'getState';
      args: Record<string, never>;
      confidence: 'high' | 'medium';
      reason: string;
    }
  | {
      toolName: 'unknown';
      args: Record<string, never>;
      confidence: 'low';
      reason: string;
    };

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesKeyword(text: string, keyword: string): boolean {
  if (keyword.includes(' ')) {
    return text.includes(keyword);
  }

  const pattern = new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i');
  return pattern.test(text);
}

function includesAny(text: string, keywords: string[]): boolean {
  return keywords.some((keyword) => matchesKeyword(text, keyword));
}

export function routeIntent(userText: string): RoutedToolHint {
  const normalized = userText.trim().toLowerCase();

  if (!normalized) {
    return {
      toolName: 'unknown',
      args: {},
      confidence: 'low',
      reason: 'Empty input.',
    };
  }

  if (includesAny(normalized, ['compare', 'comparison', 'versus', 'vs ', 'difference', 'different between'])) {
    return {
      toolName: 'compare',
      args: {},
      confidence: 'high',
      reason: 'The prompt asks for cross-file comparison.',
    };
  }

  if (includesAny(normalized, ['add marker', 'marker', 'mark this', 'pin this', 'pin point'])) {
    return {
      toolName: 'workspace',
      args: { action: 'add_marker' },
      confidence: 'medium',
      reason: 'The prompt requests placing a marker.',
    };
  }

  if (includesAny(normalized, ['selection', 'set region', 'select region', 'loop region', 'set loop'])) {
    return {
      toolName: 'workspace',
      args: { action: 'set_selection' },
      confidence: 'medium',
      reason: 'The prompt requests a region/selection update.',
    };
  }

  if (includesAny(normalized, ['clipping', 'clip', 'distortion', 'distorted'])) {
    return {
      toolName: 'find',
      args: { kind: 'clipping' },
      confidence: 'medium',
      reason: 'The prompt asks for clipping/distortion events.',
    };
  }

  if (includesAny(normalized, ['silence', 'silent', 'quiet gap', 'pause gap'])) {
    return {
      toolName: 'find',
      args: { kind: 'silence' },
      confidence: 'medium',
      reason: 'The prompt asks for silence events.',
    };
  }

  if (includesAny(normalized, ['loudest', 'loudest part', 'loudest moment'])) {
    return {
      toolName: 'find',
      args: { kind: 'loudest' },
      confidence: 'medium',
      reason: 'The prompt asks for the loudest region.',
    };
  }

  if (includesAny(normalized, ['click', 'clicks', 'clicking', 'click artifact', 'pops'])) {
    return {
      toolName: 'find',
      args: { kind: 'transient' },
      confidence: 'high',
      reason: 'Click requests map to transient-based click candidate detection.',
    };
  }

  if (includesAny(normalized, ['spectrum', 'fft', 'frequency', 'spectral', 'harsh', 'muddy', 'sibilance', 'boomy'])) {
    return {
      toolName: 'analyze',
      args: { kind: 'spectrum' },
      confidence: 'medium',
      reason: 'The prompt asks about spectral content or tonal balance.',
    };
  }

  if (includesAny(normalized, ['loudness', 'too loud', 'peak', 'true peak', 'rms', 'crushed', 'dynamic range'])) {
    return {
      toolName: 'analyze',
      args: { kind: 'level' },
      confidence: 'medium',
      reason: 'The prompt asks about amplitude or dynamics metrics.',
    };
  }

  if (includesAny(normalized, ['metadata', 'file info', 'format', 'sample rate', 'duration', 'channels', 'bit depth'])) {
    return {
      toolName: 'analyze',
      args: { kind: 'file_info' },
      confidence: 'high',
      reason: 'The prompt asks for file metadata.',
    };
  }

  if (includesAny(normalized, ['state', 'workspace', 'what is loaded', 'show loaded', 'what file is loaded'])) {
    return {
      toolName: 'getState',
      args: {},
      confidence: 'medium',
      reason: 'The prompt asks for current workspace state.',
    };
  }

  return {
    toolName: 'unknown',
    args: {},
    confidence: 'low',
    reason: 'No deterministic keyword rule matched.',
  };
}

export function buildDeterministicRoutingHint(userText: string): string | null {
  const routed = routeIntent(userText);
  if (routed.toolName === 'unknown') {
    return null;
  }

  if (routed.toolName === 'analyze') {
    return `Deterministic routing hint: this request likely maps to analyze(kind="${routed.args.kind}"). Use getState() first to obtain fileId, then run the tool.`;
  }

  if (routed.toolName === 'find') {
    return `Deterministic routing hint: this request likely maps to find(kind="${routed.args.kind}"). Use getState() first to obtain fileId, then run the tool.`;
  }

  if (routed.toolName === 'workspace') {
    return `Deterministic routing hint: this request likely maps to workspace(action="${routed.args.action}").`;
  }

  if (routed.toolName === 'compare') {
    return 'Deterministic routing hint: this request likely maps to compare(). Use getState() first to list candidate file IDs.';
  }

  return 'Deterministic routing hint: this request likely maps to getState().';
}
