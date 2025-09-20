import { useTerminalDimensions } from '@opentui/react';
import { HNStory } from '../types';
import { formatTimeAgo, formatScore } from '../utils';
import { styled, theme } from '../theme';

interface StoryListProps {
  stories: HNStory[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  selectedIndex: number;
  scrollOffset: number;
  isStorySaved?: (storyId: number) => boolean;
  showEmptyState?: boolean;
  emptyStateMessage?: string;
  saveKeyBinding?: string;
}

export const StoryList = ({
  stories,
  loading,
  loadingMore,
  error,
  selectedIndex,
  scrollOffset,
  isStorySaved,
  showEmptyState = false,
  emptyStateMessage = "No stories available",
  saveKeyBinding = "space+s",
}: StoryListProps) => {
  const { height } = useTerminalDimensions();
  const visibleHeight = height - 8;
  const storiesPerScreen = Math.floor(visibleHeight / 8);

  return (
    <box flexGrow={1} backgroundColor={theme.bg.primary} height="100%">
      <box flexGrow={1} width="100%" overflow="hidden" backgroundColor={theme.bg.primary}>
        {loading && (
          <text>{styled.secondary("Loading stories...")}</text>
        )}
        {error && (
          <text>{styled.error(`Error: ${error}`)}</text>
        )}
        {showEmptyState && stories.length === 0 && !loading && !error && (
          <box
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="100%"
            backgroundColor={theme.bg.primary}
            padding={4}
          >
            <text>{styled.secondary(emptyStateMessage)}</text>
            <text>{styled.tertiary(`Press ${saveKeyBinding} on any story to save it here`)}</text>
          </box>
        )}
        {stories.length > 0 && !loading && (
          <box flexDirection="column" backgroundColor={theme.bg.primary} padding={1}>
            {stories.slice(scrollOffset, scrollOffset + storiesPerScreen + 2).map((story, index) => {
              const actualIndex = scrollOffset + index;
              const isSelected = actualIndex === selectedIndex;
              const isSaved = isStorySaved?.(story.id) ?? false;
              return (
                <box
                  key={story.id}
                  marginBottom={1}
                  padding={1}
                  backgroundColor={isSelected ? theme.bg.selected : theme.bg.secondary}
                  borderColor={isSelected ? theme.border.focused : theme.border.secondary}
                >
                  <box flexDirection="column" width="100%">
                    <text>
                      {styled.accent(`${actualIndex + 1}.`)} {styled.primary(story.title)}{isSaved ? styled.accent(' ●') : ''}
                    </text>
                    <text>
                      {styled.tertiary(`${formatScore(story.score)} by ${story.by} | ${formatTimeAgo(story.time)}`)}
                      {story.descendants !== undefined ? styled.tertiary(` | ${story.descendants} comments`) : null}
                    </text>
                    {story.url && (
                      <text>{styled.link(story.url)}</text>
                    )}
                  </box>
                </box>
              );
            })}
            {loadingMore && (
              <box padding={1}>
                <text>{styled.secondary('Loading more stories...')}</text>
              </box>
            )}
          </box>
        )}
      </box>
    </box>
  );
};