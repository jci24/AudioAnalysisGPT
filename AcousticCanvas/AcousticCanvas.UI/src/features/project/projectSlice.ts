import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import type { ProjectStatus, AudioFile, AudioFileId } from '../../store/projectState';

const PROJECT_SLICE_NAME = 'project';

export interface IProjectState {
  projectName: string;
  status: ProjectStatus;
  files: AudioFile[];
  selectedSignalId: string | null;
}

const initialState: IProjectState = {
  projectName: 'Untitled Project',
  status: 'no-project',
  files: [],
  selectedSignalId: null,
};

const projectSlice = createSlice({
  name: PROJECT_SLICE_NAME,
  initialState,
  reducers: {
    setProjectName: (state, action: PayloadAction<string>) => {
      state.projectName = action.payload;
    },
    setStatus: (state, action: PayloadAction<ProjectStatus>) => {
      state.status = action.payload;
    },
    addAudioFile: (state, action: PayloadAction<AudioFile>) => {
      const exists = state.files.some((file) => file.id === action.payload.id);
      if (!exists) {
        state.files.push(action.payload);
        state.status = 'ready';
        state.selectedSignalId = action.payload.id;
      }
    },
    removeAudioFile: (state, action: PayloadAction<AudioFileId>) => {
      state.files = state.files.filter((file) => file.id !== action.payload);
      if (state.selectedSignalId === action.payload) {
        state.selectedSignalId = state.files[0]?.id ?? null;
      }
      if (state.files.length === 0) {
        state.status = 'no-project';
      }
    },
    setSelectedSignal: (state, action: PayloadAction<string>) => {
      state.selectedSignalId = action.payload;
    },
    clearProject: () => initialState,
  },
});

export const {
  setProjectName,
  setStatus,
  addAudioFile,
  removeAudioFile,
  setSelectedSignal,
  clearProject,
} = projectSlice.actions;

export default projectSlice.reducer;

export const projectNameSelector = (state: { project: IProjectState }): string =>
  state.project.projectName;

export const projectStatusSelector = (state: { project: IProjectState }): ProjectStatus =>
  state.project.status;

export const projectFilesSelector = (state: { project: IProjectState }): AudioFile[] =>
  state.project.files;

export const selectedSignalIdSelector = (state: { project: IProjectState }): string | null =>
  state.project.selectedSignalId;

export const activeFileSelector = (
  state: { project: IProjectState; navigation: { activeFileId: AudioFileId | null } },
): AudioFile | null => {
  const activeFileId = state.navigation.activeFileId;
  if (!activeFileId) {
    return null;
  }
  return state.project.files.find((file) => file.id === activeFileId) ?? null;
};
