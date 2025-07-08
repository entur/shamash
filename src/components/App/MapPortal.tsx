import React from 'react';
import ReactDOM from 'react-dom';
import styles from './MapPortal.module.css';

interface MapPortalProps {
  show: boolean;
  onClose: () => void;
  response: any;
  children: React.ReactNode;
}

const MapPortal: React.FC<MapPortalProps> = ({ show, onClose, response, children }) => {
  if (typeof window === 'undefined') return null;
  const graphiqlSession = document.querySelector('#graphiql-session');
  if (!show || !graphiqlSession) return null;
  return ReactDOM.createPortal(
    <div className={styles['map-portal-container']}>
      <button
        onClick={onClose}
        className={styles['map-portal-close']}
        aria-label="Close map"
        title="Close map"
      >
        ×
      </button>
      <div className={styles['map-portal-content']}>
        {children}
      </div>
    </div>,
    graphiqlSession
  );
};

export default MapPortal;

