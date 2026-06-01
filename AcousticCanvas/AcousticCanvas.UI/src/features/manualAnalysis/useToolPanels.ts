import { useState } from 'react';

interface ToolPanel {
  id: string;
  type: 'spectrogram' | 'spectrum';
  fileId: string | null;
}

interface UseToolPanelsReturn {
  toolPanels: ToolPanel[];
  hasSpectrogramPanel: boolean;
  hasSpectrumPanel: boolean;
  handleAddSpectrogramPanel: (fileId: string | null) => void;
  handleAddSpectrumPanel: (fileId: string | null) => void;
  handleToolPanelFileSelect: (panelId: string, fileId: string | null) => void;
  handleToolPanelClose: (panelId: string) => void;
}

export const useToolPanels = (): UseToolPanelsReturn => {
  const [toolPanels, setToolPanels] = useState<ToolPanel[]>([]);

  const hasSpectrogramPanel = toolPanels.some((panel) => panel.type === 'spectrogram');
  const hasSpectrumPanel = toolPanels.some((panel) => panel.type === 'spectrum');

  const handleAddSpectrogramPanel = (fileId: string | null): void => {
    if (hasSpectrogramPanel) return;
    const newPanelId = `spectrogram-${Date.now()}`;
    setToolPanels((prev) => [...prev, { id: newPanelId, type: 'spectrogram', fileId }]);
  };

  const handleAddSpectrumPanel = (fileId: string | null): void => {
    if (hasSpectrumPanel) return;
    const newPanelId = `spectrum-${Date.now()}`;
    setToolPanels((prev) => [...prev, { id: newPanelId, type: 'spectrum', fileId }]);
  };

  const handleToolPanelFileSelect = (panelId: string, fileId: string | null): void => {
    setToolPanels((prev) => prev.map((p) => p.id === panelId ? { ...p, fileId } : p));
  };

  const handleToolPanelClose = (panelId: string): void => {
    setToolPanels((prev) => prev.filter((p) => p.id !== panelId));
  };

  return {
    toolPanels,
    hasSpectrogramPanel,
    hasSpectrumPanel,
    handleAddSpectrogramPanel,
    handleAddSpectrumPanel,
    handleToolPanelFileSelect,
    handleToolPanelClose,
  };
};
