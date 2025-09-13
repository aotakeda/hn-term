import { HNStory } from '../types';
import { formatTimeAgo, formatScore, wrapText, stripHtml } from '../utils';
import { styled, theme } from '../theme';

interface StoryHeaderProps {
  story: HNStory;
  availableWidth: number;
  isSelected?: boolean;
}

export const StoryHeader = ({ story, availableWidth, isSelected = false }: StoryHeaderProps) => {
  return (
    <box
      flexDirection="column"
      backgroundColor={isSelected ? theme.bg.selected : theme.bg.secondary}
      borderColor={isSelected ? theme.border.focused : theme.border.primary}
      paddingBottom={1}
    >
      <text>{styled.title(story.title)}</text>
      <text>
        {styled.tertiary(`${formatScore(story.score)} by ${story.by} | ${formatTimeAgo(story.time)}`)}
        {story.descendants !== undefined && styled.tertiary(` | ${story.descendants} comments`)}
      </text>
      {story.url && (
        <text>{styled.link(`URL: ${story.url}`)}</text>
      )}
      {story.text && (
        <text>{styled.secondary(wrapText(stripHtml(story.text), availableWidth))}</text>
      )}
    </box>
  );
};