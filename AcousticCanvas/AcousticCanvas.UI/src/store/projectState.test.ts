import { describe, it, expect } from 'vitest';
import {
  initialProjectState,
  initialWorkspaceState,
} from './projectState';
import {
  fixtureAudioFile,
  fixtureRegion,
  fixtureMarker,
  fixtureAnalysisResult,
  fixtureWorkspaceState,
  fixtureProjectState,
} from './projectState.fixtures';

describe('initialProjectState', () => {
  it('starts with empty files array', () => {
    expect(initialProjectState.files).toEqual([]);
  });

  it('starts with empty regions array', () => {
    expect(initialProjectState.regions).toEqual([]);
  });

  it('starts with empty markers array', () => {
    expect(initialProjectState.markers).toEqual([]);
  });

  it('starts with empty analysisResults array', () => {
    expect(initialProjectState.analysisResults).toEqual([]);
  });

  it('starts with null active file selection', () => {
    expect(initialProjectState.activeFileId).toBeNull();
  });

  it('starts with null active region selection', () => {
    expect(initialProjectState.activeRegionId).toBeNull();
  });

  it('starts with manual mode', () => {
    expect(initialProjectState.activeMode).toBe('manual');
  });

  it('starts with no-project status', () => {
    expect(initialProjectState.status).toBe('no-project');
  });

  it('starts with Untitled Project name', () => {
    expect(initialProjectState.projectName).toBe('Untitled Project');
  });

  it('starts with null project id', () => {
    expect(initialProjectState.id).toBeNull();
  });
});

describe('initialWorkspaceState', () => {
  it('starts with all three views visible', () => {
    expect(initialWorkspaceState.visibleViews).toContain('waveform');
    expect(initialWorkspaceState.visibleViews).toContain('spectrogram');
    expect(initialWorkspaceState.visibleViews).toContain('spectrum');
  });

  it('starts with null active marker', () => {
    expect(initialWorkspaceState.activeMarkerId).toBeNull();
  });
});

describe('ProjectState stores data correctly', () => {
  it('can store an audio file with all required fields', () => {
    const projectWithFile = { ...initialProjectState, files: [fixtureAudioFile] };

    expect(projectWithFile.files).toHaveLength(1);
    expect(projectWithFile.files[0].id).toBe('file-001');
    expect(projectWithFile.files[0].name).toBe('kick_drum.wav');
    expect(projectWithFile.files[0].sampleRate).toBe(44100);
  });

  it('can store a region linked to a file', () => {
    const projectWithRegion = { ...initialProjectState, regions: [fixtureRegion] };

    expect(projectWithRegion.regions[0].fileId).toBe('file-001');
    expect(projectWithRegion.regions[0].startSeconds).toBe(0.1);
    expect(projectWithRegion.regions[0].endSeconds).toBe(0.9);
  });

  it('can store a marker with a source', () => {
    const projectWithMarker = { ...initialProjectState, markers: [fixtureMarker] };

    expect(projectWithMarker.markers[0].source).toBe('manual');
    expect(projectWithMarker.markers[0].timeSeconds).toBe(0.5);
  });

  it('can store an analysis result with parameters and output', () => {
    const projectWithResult = { ...initialProjectState, analysisResults: [fixtureAnalysisResult] };

    expect(projectWithResult.analysisResults[0].type).toBe('rms');
    expect(projectWithResult.analysisResults[0].parameters).toEqual({ windowSize: 1024 });
    expect(projectWithResult.analysisResults[0].output).toEqual({ rmsDb: -12.4 });
  });

  it('can set active file and region selections', () => {
    const projectWithSelection = {
      ...initialProjectState,
      activeFileId: 'file-001',
      activeRegionId: 'region-001',
    };

    expect(projectWithSelection.activeFileId).toBe('file-001');
    expect(projectWithSelection.activeRegionId).toBe('region-001');
  });

  it('can store workspace visible views', () => {
    const projectWithViews = {
      ...initialProjectState,
      workspace: fixtureWorkspaceState,
    };

    expect(projectWithViews.workspace.visibleViews).toContain('waveform');
    expect(projectWithViews.workspace.visibleViews).toContain('spectrogram');
    expect(projectWithViews.workspace.visibleViews).not.toContain('spectrum');
  });
});

describe('ProjectState serializes to JSON', () => {
  it('initialProjectState round-trips through JSON without data loss', () => {
    const serialized = JSON.stringify(initialProjectState);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual(initialProjectState);
  });

  it('fixtureProjectState round-trips through JSON without data loss', () => {
    const serialized = JSON.stringify(fixtureProjectState);
    const deserialized = JSON.parse(serialized);

    expect(deserialized).toEqual(fixtureProjectState);
  });

  it('serialized state is valid JSON string', () => {
    const serialized = JSON.stringify(initialProjectState);

    expect(typeof serialized).toBe('string');
    expect(() => JSON.parse(serialized)).not.toThrow();
  });

  it('nested workspace state survives serialization', () => {
    const serialized = JSON.stringify(fixtureProjectState);
    const deserialized = JSON.parse(serialized);

    expect(deserialized.workspace.visibleViews).toEqual(fixtureWorkspaceState.visibleViews);
    expect(deserialized.workspace.activeMarkerId).toBe('marker-001');
  });
});

describe('Empty arrays and null selections do not cause issues', () => {
  it('accessing files on empty state returns empty array, not null', () => {
    expect(Array.isArray(initialProjectState.files)).toBe(true);
    expect(initialProjectState.files.length).toBe(0);
  });

  it('mapping over empty collections does not throw', () => {
    const mapFiles = (): string[] => initialProjectState.files.map((file) => file.id);
    const mapRegions = (): string[] => initialProjectState.regions.map((region) => region.id);
    const mapMarkers = (): string[] => initialProjectState.markers.map((marker) => marker.id);

    expect(() => mapFiles()).not.toThrow();
    expect(() => mapRegions()).not.toThrow();
    expect(() => mapMarkers()).not.toThrow();
    expect(mapFiles()).toEqual([]);
  });

  it('null activeFileId does not break equality checks', () => {
    const isFileActive = initialProjectState.activeFileId === 'file-001';

    expect(isFileActive).toBe(false);
  });
});
