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
}

export const StoryList = ({
  stories,
  loading,
  loadingMore,
  error,
  selectedIndex,
  scrollOffset,
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
        {stories.length > 0 && !loading && (
          <box flexDirection="column" backgroundColor={theme.bg.primary} padding={1}>
            {stories.slice(scrollOffset, scrollOffset + storiesPerScreen + 2).map((story, index) => {
              const actualIndex = scrollOffset + index;
              const isSelected = actualIndex === selectedIndex;
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
                      {styled.accent(`${actualIndex + 1}.`)} {styled.primary(story.title)}
                    </text>
                    <text>
                      {styled.tertiary(`${formatScore(story.score)} by ${story.by} | ${formatTimeAgo(story.time)}`)}
                      {story.descendants !== undefined && styled.tertiary(` | ${story.descendants} comments`)}
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