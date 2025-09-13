export const theme = {
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
    orange: '#ff6b35',
    blue: '#4a90e2',
    green: '#5cb85c',
    red: '#d9534f',
    yellow: '#f0ad4e',
  }
} as const;

import { fg, bold, dim, t } from '@opentui/core';

export const styled = {
  primary: (text: string) => fg(theme.text.primary)(text),
  secondary: (text: string) => fg(theme.text.secondary)(text),
  tertiary: (text: string) => fg(theme.text.tertiary)(text),
  muted: (text: string) => fg(theme.text.muted)(text),
  
  accent: (text: string) => fg(theme.accent.orange)(text),
  link: (text: string) => fg(theme.accent.blue)(text),
  success: (text: string) => fg(theme.accent.green)(text),
  error: (text: string) => fg(theme.accent.red)(text),
  warning: (text: string) => fg(theme.accent.yellow)(text),
  
  title: (text: string) => bold(fg(theme.text.primary)(text)),
  subtitle: (text: string) => bold(fg(theme.text.secondary)(text)),
  dimmed: (text: string) => dim(fg(theme.text.tertiary)(text)),
  highlighted: (text: string) => bold(fg(theme.accent.orange)(text)),
};

export const styledText = {
  primary: (text: string) => t`${fg(theme.text.primary)(text)}`,
  secondary: (text: string) => t`${fg(theme.text.secondary)(text)}`,
  tertiary: (text: string) => t`${fg(theme.text.tertiary)(text)}`,
  muted: (text: string) => t`${fg(theme.text.muted)(text)}`,
  accent: (text: string) => t`${fg(theme.accent.orange)(text)}`,
  link: (text: string) => t`${fg(theme.accent.blue)(text)}`,
  error: (text: string) => t`${fg(theme.accent.red)(text)}`,
  title: (text: string) => t`${bold(fg(theme.text.primary)(text))}`,
  dimmed: (text: string) => t`${dim(fg(theme.text.tertiary)(text))}`,
};