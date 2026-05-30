import type { JSX } from 'react';
import { IconHome, IconUpload, IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import styles from './Sidebar.module.scss';

interface SidebarProps {
  onHomeClick?: () => void;
  onImportClick?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar = ({
  onHomeClick,
  onImportClick,
  isCollapsed = false,
  onToggleCollapse,
}: SidebarProps): JSX.Element => {
  return (
    <nav
      className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}
      aria-label="Sidebar navigation"
    >
      <div className={styles.header}>
        {isCollapsed ? (
          <div className={styles.collapsedHeader}>
            <div className={styles.logoOnly}>
              <img src="/logo.svg" width={36} height={36} alt="SoundLens" />
            </div>
            <button
              className={styles.expandButton}
              onClick={onToggleCollapse}
              type="button"
              aria-label="Expand sidebar"
            >
              <IconChevronRight size={16} />
            </button>
          </div>
        ) : (
          <>
            <div className={styles.brand}>
              <img src="/logo.svg" width={32} height={32} alt="" className={styles.brandIcon} />
              <span className={styles.brandName}>SoundLens</span>
            </div>
            <button
              className={styles.collapseButton}
              onClick={onToggleCollapse}
              type="button"
              aria-label="Collapse sidebar"
            >
              <IconChevronLeft size={16} />
            </button>
          </>
        )}
      </div>

      <div className={styles.section}>
        <ul className={styles.menuList}>
          <li>
            <button
              className={styles.menuItem}
              onClick={onHomeClick}
              type="button"
              title="Home"
            >
              <div className={styles.menuItemContent}>
                <div className={styles.icon}>
                  <IconHome size={20} />
                </div>
                {!isCollapsed && <div className={styles.label}>Home</div>}
              </div>
            </button>
          </li>
          <li>
            <button
              className={styles.menuItem}
              onClick={onImportClick}
              type="button"
              title="Import"
            >
              <div className={styles.menuItemContent}>
                <div className={styles.icon}>
                  <IconUpload size={20} />
                </div>
                {!isCollapsed && <div className={styles.label}>Import</div>}
              </div>
            </button>
          </li>
        </ul>
      </div>

      <div className={styles.spacer} />
    </nav>
  );
};
