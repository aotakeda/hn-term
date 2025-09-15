# HN Term

A terminal-based Hacker News reader built with React and [OpenTUI](https://github.com/sst/opentui), providing a keyboard-based way to browse Hacker News stories and comments.

## Features

- Browse different Hacker News story types (top, new, show, ask, jobs)
- Navigate through stories and comments using keyboard shortcuts
- Vim-like keybindings (hjkl navigation)
- Real-time story and comment loading by using official HN API
- Terminal-based UI with responsive layout
- Configurable key bindings and settings

## Project Architecture

```
src/
├── components/        # React components for UI
├── hooks/             # Custom React hooks for data fetching and navigation
├── contexts/          # React contexts for global state management
├── types/             # TypeScript type definitions
├── utils/             # Utility functions for text, time, and browser operations
├── constants/         # API endpoints and configuration
└── theme.ts           # UI theme configuration
```

### Key Components

- **App** (`src/index.tsx`): Main application entry point
- **TabNavigation**: Story type selection interface
- **StoryList**: Display list of stories with keyboard navigation
- **StoryDetail**: Individual story view with comments
- **CommentsList**: Threaded comment display with expand/collapse

### Data Flow

1. **useHackerNews** hook fetches stories from HN API based on selected type
2. **useViewNavigation** manages UI state and navigation between views
3. **KeyBindingsProvider** handles keyboard input and routing to appropriate handlers
4. **useComments** fetches and manages comment threads for individual stories

## Local Development Setup

### Prerequisites

- [Bun](https://bun.sh/) v1.2.20 or later

### Installation

```bash
# Clone the repository
git clone https://github.com/aotakeda/hn-term.git
cd hn-term

# Install dependencies
bun install
```

### Configuration

1. Copy the default configuration file:
```bash
cp .config.default.ts .config.ts
```

1. Customize key bindings and settings in `.config.ts` as needed.

### Running the Application

```bash
# Start the development server
bun dev
```

### Development Scripts

```bash
# Type checking
bun run tsc --noEmit
```

## Key Bindings

Default key bindings (configurable in `.config.ts`):

### Navigation
- `↑/k`: Move up
- `↓/j`: Move down
- `←/h`: Move left/collapse comments
- `→/l`: Move right/expand children comments

### Actions
- `Enter`: Select item
- `Escape`: Go back
- `Space`: Open modal
- `r`: Refresh current view

### Story Navigation
- `Space + o`: Open external links

## Configuration

The application supports customizable key bindings, settings, and theme colors through `.config.ts`:

### Key Bindings and Settings

```typescript
import { Config } from './src/types';

export const defaultConfig: Config = {
  keyBindings: {
    navigation: { up: ["up", "k"], down: ["down", "j"] },
    actions: { back: ["escape"], enter: ["return", "enter"] }
  },
  settings: {
    doubleKeyTimeout: 500,
    modalTimeout: 2000,
    showHelpText: true
  }
};
```

### Theme Customization

You can customize the application colors by adding a `theme` section to your `.config.ts`:

```typescript
export const defaultConfig: Config = {
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
```

#### Theme Color Categories

- **bg**: Background colors for different UI elements
- **text**: Text colors for various content types
- **border**: Border and outline colors
- **accent**: Semantic accent colors for different UI states:
  - `primary`: Main accent color for highlights
  - `link`: Color for links and interactive elements
  - `success`: Color for success states and positive feedback
  - `error`: Color for error states and warnings
  - `warning`: Color for warning states and cautions

You can customize any subset of these colors - unspecified colors will use the default values. The theme supports partial configuration, so you can change just the colors you want to customize.
