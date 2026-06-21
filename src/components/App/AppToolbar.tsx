import React from 'react';
import CustomDropdown from './CustomDropdown';
import styles from './AppToolbar.module.css';

interface ServiceOption {
  id: string;
  name: string;
}

interface AppToolbarProps {
  logoSrc: string;
  services: ServiceOption[];
  currentServiceId: string;
  onServiceChange: (id: string) => void;
  onEnvironmentChange: (env: string) => void;
  exampleKeys: string[];
  onExampleSelect: (key: string) => void;
  onToggleMap: () => void;
  onSearchForId: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const AppToolbar: React.FC<AppToolbarProps> = ({
  logoSrc,
  services,
  currentServiceId,
  onServiceChange,
  onEnvironmentChange,
  exampleKeys,
  onExampleSelect,
  onToggleMap,
  onSearchForId,
  currentTheme,
  onThemeChange,
}) => {
  return (
    <div className={styles.toolbar}>
      <img alt="logo" src={logoSrc} className={styles.logo} />

      <CustomDropdown
        label="Service"
        selected={currentServiceId}
        onChange={onServiceChange}
        options={services.map((s) => ({ value: s.id, label: s.name }))}
      />

      <CustomDropdown
        label="Environment"
        selected=""
        onChange={onEnvironmentChange}
        options={[
          { value: 'prod', label: 'Prod' },
          { value: 'staging', label: 'Staging' },
          { value: 'dev', label: 'Dev' },
        ]}
      />

      {exampleKeys.length > 0 && (
        <CustomDropdown
          label="Examples"
          selected=""
          onChange={onExampleSelect}
          options={exampleKeys.map((k) => ({ value: k, label: k }))}
        />
      )}

      <CustomDropdown
        label="Theme"
        selected={currentTheme}
        onChange={onThemeChange}
        options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ]}
      />

      <button type="button" className={styles.button} onClick={onToggleMap}>
        Map
      </button>
      <button type="button" className={styles.button} onClick={onSearchForId}>
        Search for ID
      </button>
    </div>
  );
};

export default AppToolbar;
