export interface HNStory {
  id: number;
  title: string;
  by: string;
  time: number;
  score: number;
  descendants?: number;
  url?: string;
  text?: string;
  type: string;
  kids?: number[];
}

export interface HNComment {
  id: number;
  by?: string;
  time: number;
  text?: string;
  kids?: number[];
  deleted?: boolean;
  dead?: boolean;
  parent: number;
  depth?: number;
}

export type HNApiStoryType = 'top' | 'new' | 'show' | 'ask' | 'jobs';
export type HNStoryType = HNApiStoryType | 'repository';

export type ViewMode = 'tabs' | 'stories' | 'story-detail';

export interface KeyBindings {
  navigation: {
    up: string[];
    down: string[];
    left: string[];
    right: string[];
  };
  actions: {
    back: string[];
    enter: string[];
    expand: string[];
    collapse: string[];
    modal: string[];
    refresh: string[];
  };
  tabs: {
    navigate: string[];
    select: string[];
    refresh: string[];
  };
  stories: {
    navigate: string[];
    select: string[];
    openLinks: string[];
    back: string[];
    refresh: string[];
  };
  comments: {
    navigate: string[];
    expand: string[];
    collapse: string[];
    openLinks: string[];
    back: string[];
    refresh: string[];
  };
}

export interface ThemeColors {
  bg?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
    quaternary?: string;
    selected?: string;
    accent?: string;
  };
  text?: {
    primary?: string;
    secondary?: string;
    tertiary?: string;
    muted?: string;
    disabled?: string;
  };
  border?: {
    primary?: string;
    secondary?: string;
    focused?: string;
    accent?: string;
  };
  accent?: {
    primary?: string;
    link?: string;
    success?: string;
    error?: string;
    warning?: string;
  };
}

export interface Config {
  keyBindings: KeyBindings;
  settings: {
    doubleKeyTimeout: number;
    modalTimeout: number;
    showHelpText: boolean;
  };
  theme?: ThemeColors;
}

export interface NavigationItem {
  commentId: number;
  comment: HNComment;
  isVisible: boolean;
}