import React from 'react';
import { createPortal } from 'react-dom';
import styles from './MapPortal.module.css';

interface MapPortalProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const MapPortal: React.FC<MapPortalProps> = ({ show, onClose, children }) => {
  if (typeof document === 'undefined') return null;
  const host = document.getElementById('map-portal-root');
  if (!show || !host) return null;
  return createPortal(
    <div className={styles['map-portal-container']}>
      <button
        type="button"
        onClick={onClose}
        className={styles['map-portal-close']}
        aria-label="Close map"
        title="Close map"
      >
        ×
      </button>
      <div className={styles['map-portal-content']}>{children}</div>
    </div>,
    host
  );
};

export default MapPortal;
