import { describe, expect, it } from 'vitest';
import { buildDeterministicRoutingHint, routeIntent } from './intentRouter';
import { INTENT_ROUTING_FIXTURES } from './intentRouting.fixtures';

describe('routeIntent', () => {
  it('maps prompt variants to canonical tools', () => {
    for (const fixture of INTENT_ROUTING_FIXTURES) {
      const result = routeIntent(fixture.user);
      expect(result.toolName).toBe(fixture.expected.toolName);
      expect(result.args).toEqual(fixture.expected.args);
    }
  });

  it('returns low confidence unknown for empty input', () => {
    const result = routeIntent('   ');
    expect(result.toolName).toBe('unknown');
    expect(result.confidence).toBe('low');
  });
});

describe('buildDeterministicRoutingHint', () => {
  it('returns a hint for routed intents', () => {
    const hint = buildDeterministicRoutingHint('Find clicks in this file');
    expect(hint).toContain('find(kind="transient")');
  });

  it('returns null for unknown intents', () => {
    const hint = buildDeterministicRoutingHint('Define crest factor in plain terms');
    expect(hint).toBeNull();
  });
});
