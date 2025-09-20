import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { ParsedKey } from '@opentui/core';
import { Config } from '../types';
import { setTheme } from '../theme';

interface ConfigContextType {
  config: Config;
  isModalMode: boolean;
  setIsModalMode: (mode: boolean) => void;
  getKeyString: (key: ParsedKey) => string;
  isKeyMatch: (keyStr: string, keyList: string[]) => boolean;
  isDoubleKeyMatch: (keyStr: string, keyList: string[], lastKey: string, lastTime: number) => boolean;
  handleModalKey: (key: ParsedKey, callback?: (key: string) => void) => boolean;
  getHelpText: (context: 'tabs' | 'stories' | 'comments', selectedTabValue?: string) => string;
}

const defaultConfig: Config = {
  keyBindings: {
    navigation: {
      up: ['up', 'k'],
      down: ['down', 'j'],
      left: ['left', 'h'],
      right: ['right', 'l']
    },
    actions: {
      back: ['escape'],
      enter: ['return', 'enter'],
      expand: ['right', 'l'],
      collapse: ['left', 'h'],
      modal: ['space'],
      refresh: ['r']
    },
    tabs: {
      navigate: ['up', 'down', 'k', 'j'],
      select: ['right', 'l', 'return', 'enter'],
      refresh: ['r']
    },
    stories: {
      navigate: ['up', 'down', 'k', 'j'],
      select: ['right', 'l', 'return', 'enter'],
      openLinks: ['space+o'],
      save: ['space+s'],
      remove: ['space+r'],
      back: ['escape'],
      refresh: ['r']
    },
    comments: {
      navigate: ['up', 'down', 'k', 'j'],
      expand: ['right', 'l'],
      collapse: ['left', 'h'],
      openLinks: ['space+o'],
      back: ['escape'],
      refresh: ['r']
    }
  },
  settings: {
    doubleKeyTimeout: 500,
    modalTimeout: 2000,
    showHelpText: true
  }
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

interface ConfigProviderProps {
  children: ReactNode;
}

export const ConfigProvider = ({ children }: ConfigProviderProps) => {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [isModalMode, setIsModalMode] = useState(false);
  const [modalTimeout, setModalTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      const loadConfigFile = async (filename: string) => {
        const configFile = Bun.file(filename);
        if (await configFile.exists()) {
          try {
            const module = await import(`../../${filename}`);
            return module.defaultConfig || module.default || module.config;
          } catch (error) {
            console.warn(`Failed to import ${filename}:`, error);
            return null;
          }
        }
        return null;
      };

      try {
        const userConfig = await loadConfigFile('.config.ts');
        if (userConfig) {
          const mergedConfig = { ...defaultConfig, ...userConfig };
          setConfig(mergedConfig);
          setTheme(mergedConfig.theme);
          return;
        }

        const exampleConfig = await loadConfigFile('.config.default.ts');
        if (exampleConfig) {
          const mergedConfig = { ...defaultConfig, ...exampleConfig };
          setConfig(mergedConfig);
          setTheme(mergedConfig.theme);
        }
      } catch (error) {
        console.warn('Failed to load config, using defaults:', error);
      }
    };

    loadConfig();
  }, []);

  const getKeyString = (key: ParsedKey): string => {
    return key.name || '';
  };

  const isKeyMatch = (keyStr: string, keyList: string[]): boolean => {
    return keyList.includes(keyStr);
  };

  const isDoubleKeyMatch = (keyStr: string, keyList: string[], lastKey: string, lastTime: number): boolean => {
    const doubleKeys = keyList.filter(k => k.includes('+'));
    for (const doubleKey of doubleKeys) {
      const [first, second] = doubleKey.split('+');
      if (keyStr === second && lastKey === first &&
          Date.now() - lastTime < config.settings.doubleKeyTimeout) {
        return true;
      }
    }
    return false;
  };

  const activateModalMode = () => {
    setIsModalMode(true);

    if (modalTimeout) {
      clearTimeout(modalTimeout);
    }

    const timeout = setTimeout(() => {
      setIsModalMode(false);
    }, config.settings.modalTimeout);

    setModalTimeout(timeout);
  };

  const exitModalMode = () => {
    setIsModalMode(false);
    if (modalTimeout) {
      clearTimeout(modalTimeout);
      setModalTimeout(null);
    }
  };

  const handleModalKey = (key: ParsedKey, callback?: (key: string) => void): boolean => {
    const keyStr = getKeyString(key);

    if (isKeyMatch(keyStr, config.keyBindings.actions.modal)) {
      activateModalMode();
      return true;
    }

    if (isModalMode) {
      callback?.(keyStr);
      exitModalMode();
      return true;
    }

    return false;
  };

  const getHelpText = (context: 'tabs' | 'stories' | 'comments', selectedTabValue?: string): string => {
    if (!config.settings.showHelpText) return '';

    const kb = config.keyBindings;

    switch (context) {
      case 'tabs':
        const selectAction = selectedTabValue === 'repository' ? 'to open repository' : 'to view stories';
        return `${kb.tabs.navigate.join('/')} navigate • ${kb.tabs.select.join('/')} ${selectAction} • ${kb.tabs.refresh.join('/')} refresh`;

      case 'stories':
        return `${kb.stories.navigate.join('/')} navigate • ${kb.stories.select.join('/')} to view story • ${kb.stories.openLinks.join('/')} open external link • ${kb.stories.save.join('/')} save story • ${kb.stories.remove.join('/')} remove saved • ${kb.stories.refresh.join('/')} refresh • ${kb.stories.back.join('/')} to go back`;

      case 'comments':
        return `${kb.comments.navigate.join('/')} navigate • ${kb.comments.expand.join('/')} expand • ${kb.comments.collapse.join('/')} collapse • ${kb.comments.openLinks.join('/')} open links • ${kb.comments.refresh.join('/')} refresh • ${kb.comments.back.join('/')} back`;

      default:
        return '';
    }
  };

  const contextValue: ConfigContextType = {
    config,
    isModalMode,
    setIsModalMode,
    getKeyString,
    isKeyMatch,
    isDoubleKeyMatch,
    handleModalKey,
    getHelpText
  };

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

