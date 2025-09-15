import { Config } from './src/types';

export const defaultConfig: Config = {
  keyBindings: {
    navigation: {
      up: ["up", "k"],
      down: ["down", "j"],
      left: ["left", "h"],
      right: ["right", "l"]
    },
    actions: {
      back: ["escape"],
      enter: ["return", "enter"],
      expand: ["right", "l"],
      collapse: ["left", "h"],
      modal: ["space"],
      refresh: ["r"]
    },
    tabs: {
      navigate: ["up", "down", "k", "j"],
      select: ["right", "l", "return", "enter"],
      refresh: ["r"]
    },
    stories: {
      navigate: ["up", "down", "k", "j"],
      select: ["right", "l", "return", "enter"],
      openLinks: ["space+o"],
      back: ["escape"],
      refresh: ["r"]
    },
    comments: {
      navigate: ["up", "down", "k", "j"],
      expand: ["right", "l"],
      collapse: ["left", "h"],
      openLinks: ["space+o"],
      back: ["escape"],
      refresh: ["r"]
    }
  },
  settings: {
    doubleKeyTimeout: 500,
    modalTimeout: 2000,
    showHelpText: true
  },
  theme: {
    bg: {
      primary: "#0f0f0f",
      secondary: "#1a1a1a",
      tertiary: "#262626",
      quaternary: "#2d2d2d",
      selected: "#363636",
      accent: "#404040"
    },
    text: {
      primary: "#ffffff",
      secondary: "#b3b3b3",
      tertiary: "#808080",
      muted: "#666666",
      disabled: "#4d4d4d"
    },
    border: {
      primary: "#404040",
      secondary: "#333333",
      focused: "#606060",
      accent: "#757575"
    },
    accent: {
      primary: "#ff6b35",
      link: "#4a90e2",
      success: "#5cb85c",
      error: "#d9534f",
      warning: "#f0ad4e"
    }
  }
};