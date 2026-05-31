import { useAppDispatch } from '../../store/reduxHooks';
import { apiClient } from '../../shared/api/apiClient';
import { API_ENDPOINTS } from '../../shared/api/apiEndpoints';
import { analysisStarted, analysisCompleted, analysisFailed } from './analysisSlice';
import type { AnalysisResult } from './analysisTypes';

export const useRunAnalysis = (): { runAnalysis: (fileId: string) => Promise<void> } => {
  const dispatch = useAppDispatch();

  const runAnalysis = async (fileId: string): Promise<void> => {
    dispatch(analysisStarted());
    try {
      const result = await apiClient.requestJson<AnalysisResult>(
        API_ENDPOINTS.AUDIO.RUN_ANALYSIS(fileId),
      );
      dispatch(analysisCompleted(result));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Analysis failed';
      dispatch(analysisFailed(message));
    }
  };

  return { runAnalysis };
};
