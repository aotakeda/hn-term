import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Config } from '../types';

interface KeyBindingsContextType {
  config: Config;
  isModalMode: boolean;
  setIsModalMode: (mode: boolean) => void;
  getKeyString: (key: any) => string;
  isKeyMatch: (keyStr: string, keyList: string[]) => boolean;
  isDoubleKeyMatch: (keyStr: string, keyList: string[], lastKey: string, lastTime: number) => boolean;
  handleModalKey: (key: any, callback?: (key: string) => void) => boolean;
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
      modal: ['space']
    },
    tabs: {
      navigate: ['up', 'down', 'k', 'j'],
      select: ['right', 'l', 'return', 'enter']
    },
    stories: {
      navigate: ['up', 'down', 'k', 'j'],
      select: ['right', 'l', 'return', 'enter'],
      openLinks: ['space+o'],
      back: ['escape']
    },
    comments: {
      navigate: ['up', 'down', 'k', 'j'],
      expand: ['right', 'l'],
      collapse: ['left', 'h'],
      openLinks: ['space+o'],
      back: ['escape']
    }
  },
  settings: {
    doubleKeyTimeout: 500,
    modalTimeout: 2000,
    showHelpText: true
  }
};

const KeyBindingsContext = createContext<KeyBindingsContextType | undefined>(undefined);

interface KeyBindingsProviderProps {
  children: ReactNode;
}

export function KeyBindingsProvider({ children }: KeyBindingsProviderProps) {
  const [config, setConfig] = useState<Config>(defaultConfig);
  const [isModalMode, setIsModalMode] = useState(false);
  const [modalTimeout, setModalTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const userConfigResponse = await fetch('/.config.json').catch(() => null);
        if (userConfigResponse?.ok) {
          const userConfig = await userConfigResponse.json();
          setConfig({ ...defaultConfig, ...userConfig });
          return;
        }

        const exampleConfigResponse = await fetch('/.config.example.json');
        if (exampleConfigResponse.ok) {
          const exampleConfig = await exampleConfigResponse.json();
          setConfig({ ...defaultConfig, ...exampleConfig });
        }
      } catch (error) {
        console.warn('Failed to load config, using defaults:', error);
      }
    };

    loadConfig();
  }, []);

  const getKeyString = (key: any): string => {
    return typeof key === 'string' ? key : key.name || '';
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

  const handleModalKey = (key: any, callback?: (key: string) => void): boolean => {
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
        return `${kb.tabs.navigate.join('/')} navigate • ${kb.tabs.select.join('/')} ${selectAction}`;

      case 'stories':
        return `${kb.stories.navigate.join('/')} navigate • ${kb.stories.select.join('/')} to view story • ${kb.stories.openLinks.join('/')} open external link • ${kb.stories.back.join('/')} to go back`;

      case 'comments':
        return `${kb.comments.navigate.join('/')} navigate • ${kb.comments.expand.join('/')} expand • ${kb.comments.collapse.join('/')} collapse • ${kb.comments.openLinks.join('/')} open links • ${kb.comments.back.join('/')} back`;

      default:
        return '';
    }
  };

  const contextValue: KeyBindingsContextType = {
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
    <KeyBindingsContext.Provider value={contextValue}>
      {children}
    </KeyBindingsContext.Provider>
  );
}

export function useKeyBindings(): KeyBindingsContextType {
  const context = useContext(KeyBindingsContext);
  if (context === undefined) {
    throw new Error('useKeyBindings must be used within a KeyBindingsProvider');
  }
  return context;
}

