import { createContext, useContext, useEffect, useState } from 'react';
import configreader from './readConfig.js';

const defaultConfig = {
  services: [],
  enturClientName: undefined,
};

export const ConfigContext = createContext(defaultConfig);

export const useConfig = () => useContext(ConfigContext);

export const useFetchConfig = () => {
  const [config, setConfig] = useState(defaultConfig);

  useEffect(() => {
    const fetchConfig = async () => {
      configreader.readConfig((config) => setConfig(config));
    };
    fetchConfig();
  }, []);

  return config;
};
