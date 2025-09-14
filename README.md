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

1. Copy the example configuration file:
```bash
cp .config.example.json .config.json
```

2. Customize key bindings and settings in `.config.json` as needed.

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

Default key bindings (configurable in `.config.json`):

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

The application supports customizable key bindings and settings through `.config.json`:

```json
{
  "keyBindings": {
    "navigation": { "up": ["up", "k"], "down": ["down", "j"] },
    "actions": { "back": ["escape"], "enter": ["return", "enter"] }
  },
  "settings": {
    "doubleKeyTimeout": 500,
    "modalTimeout": 2000,
    "showHelpText": true
  }
}
```
