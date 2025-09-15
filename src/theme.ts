import { ThemeColors } from './types';

const defaultTheme = {
  bg: {
    primary: '#0f0f0f',
    secondary: '#1a1a1a',
    tertiary: '#262626',
    quaternary: '#2d2d2d',
    selected: '#363636',
    accent: '#404040',
  },

  text: {
    primary: '#ffffff',
    secondary: '#b3b3b3',
    tertiary: '#808080',
    muted: '#666666',
    disabled: '#4d4d4d',
  },

  border: {
    primary: '#404040',
    secondary: '#333333',
    focused: '#606060',
    accent: '#757575',
  },

  accent: {
    primary: '#ff6b35',
    link: '#4a90e2',
    success: '#5cb85c',
    error: '#d9534f',
    warning: '#f0ad4e',
  }
} as const;

const deepMerge = (target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> => {
  const result = { ...target };

  for (const key in source) {
    const sourceValue = source[key];

    if (sourceValue === undefined) continue;

    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      result[key] = deepMerge(target[key] as Record<string, unknown> || {}, sourceValue as Record<string, unknown>);
      continue;
    }

    result[key] = sourceValue;
  }

  return result;
};

let currentTheme = defaultTheme;

export const setTheme = (customTheme?: ThemeColors) => {
  currentTheme = customTheme ? deepMerge(defaultTheme, customTheme as Record<string, unknown>) as typeof defaultTheme : defaultTheme;
};

export const getTheme = () => currentTheme;

export const theme = new Proxy({} as typeof defaultTheme, {
  get: (_, prop) => {
    return getTheme()[prop as keyof typeof defaultTheme];
  }
});

import { fg, bold, dim, t } from '@opentui/core';

export const styled = {
  primary: (text: string) => fg(theme.text.primary)(text),
  secondary: (text: string) => fg(theme.text.secondary)(text),
  tertiary: (text: string) => fg(theme.text.tertiary)(text),
  muted: (text: string) => fg(theme.text.muted)(text),

  accent: (text: string) => fg(theme.accent.primary)(text),
  link: (text: string) => fg(theme.accent.link)(text),
  success: (text: string) => fg(theme.accent.success)(text),
  error: (text: string) => fg(theme.accent.error)(text),
  warning: (text: string) => fg(theme.accent.warning)(text),

  title: (text: string) => bold(fg(theme.text.primary)(text)),
  subtitle: (text: string) => bold(fg(theme.text.secondary)(text)),
  dimmed: (text: string) => dim(fg(theme.text.tertiary)(text)),
  highlighted: (text: string) => bold(fg(theme.accent.primary)(text)),
};

export const styledText = {
  primary: (text: string) => t`${fg(theme.text.primary)(text)}`,
  secondary: (text: string) => t`${fg(theme.text.secondary)(text)}`,
  tertiary: (text: string) => t`${fg(theme.text.tertiary)(text)}`,
  muted: (text: string) => t`${fg(theme.text.muted)(text)}`,
  accent: (text: string) => t`${fg(theme.accent.primary)(text)}`,
  link: (text: string) => t`${fg(theme.accent.link)(text)}`,
  error: (text: string) => t`${fg(theme.accent.error)(text)}`,
  title: (text: string) => t`${bold(fg(theme.text.primary)(text))}`,
  dimmed: (text: string) => t`${dim(fg(theme.text.tertiary)(text))}`,
};