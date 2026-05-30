export const API_ENDPOINTS = {
  AUDIO: {
    UPLOAD: 'api/audio/upload',
  },
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;
