import { HNStory, ViewMode } from '../types';
import { styled, theme } from '../theme';
import { useKeyBindings } from '../contexts/KeyBindingsContext';

interface FooterProps {
  viewMode: ViewMode;
  selectedStoryIndex: number;
  stories: HNStory[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  totalCount?: number;
}

export const Footer = ({
  viewMode,
  selectedStoryIndex,
  stories,
  loading,
  loadingMore,
  hasMore,
  totalCount
}: FooterProps) => {
  const { isModalMode, getHelpText } = useKeyBindings();

  const getFooterText = () => {
    let text = 'Select a category to browse';

    if (viewMode === 'stories') {
      text = `${getHelpText('stories')} • ${selectedStoryIndex + 1}/${stories.length}`;
      if (totalCount && totalCount > stories.length) {
        text += ` of ${totalCount} total`;
      }
      if (loadingMore) {
        text += ' • Loading more...';
      } else if (!hasMore && totalCount) {
        text += ' • All stories loaded';
      }
    }

    if (loading) {
      text += " • Loading...";
    }

    return text;
  };

  return (
    <box justifyContent="center" alignItems="center" flexBasis={1} backgroundColor={theme.bg.secondary} borderColor={theme.border.primary}>
      <text>
        {isModalMode ? styled.warning('Modal mode - press any key | ') : '-'}
        {styled.tertiary(getFooterText())}
      </text>
    </box>
  );
};