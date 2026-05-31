import type { JSX } from 'react';
import { useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { Loader } from '@mantine/core';
import { AnalysisInspector } from '../analysis/AnalysisInspector';
import type { AnalysisResult } from '../analysis/analysisTypes';
import type { AnalysisStatus } from '../analysis/analysisSlice';
import styles from './RightSidebar.module.scss';

interface RightSidebarProps {
  analysisResult: AnalysisResult | null;
  analysisStatus: AnalysisStatus;
  analysisError: string | null;
  selectedFileName: string | null;
}

export const RightSidebar = ({
  analysisResult,
  analysisStatus,
  analysisError,
  selectedFileName,
}: RightSidebarProps): JSX.Element => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
      {isCollapsed ? (
        <button
          className={styles.toggleButton}
          onClick={() => setIsCollapsed(false)}
          type="button"
          aria-label="Expand sidebar"
        >
          <IconChevronLeft size={16} />
        </button>
      ) : (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitleGroup}>
              <span className={styles.panelTitle}>Analysis</span>
              {selectedFileName && (
                <span className={styles.panelSubtitle}>{selectedFileName}</span>
              )}
            </div>
            <div className={styles.panelHeaderRight}>
              {analysisStatus === 'running' && <Loader size={12} color="teal" />}
              <button
                className={styles.toggleButton}
                onClick={() => setIsCollapsed(true)}
                type="button"
                aria-label="Collapse sidebar"
              >
                <IconChevronRight size={16} />
              </button>
            </div>
          </div>
          <div className={styles.panelContent}>
            <AnalysisInspector
              result={analysisResult}
              status={analysisStatus}
              error={analysisError}
            />
          </div>
        </div>
      )}
    </div>
  );
};
