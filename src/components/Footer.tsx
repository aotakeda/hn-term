import { HNStory, ViewMode } from '../types';
import { styled, theme } from '../theme';
import { useKeyBindings } from '../contexts/KeyBindingsContext';
import { TAB_OPTIONS } from './TabNavigation';

interface FooterProps {
  viewMode: ViewMode;
  selectedStoryIndex: number;
  selectedTabIndex?: number;
  stories: HNStory[];
  loading: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  totalCount?: number;
}

export const Footer = ({
  viewMode,
  selectedStoryIndex,
  selectedTabIndex,
  stories,
  loading,
  loadingMore,
  hasMore,
  totalCount
}: FooterProps) => {
  const { isModalMode, config } = useKeyBindings();

  const getFooterContent = () => {
    if (viewMode === 'tabs') {
      const selectedTabValue = selectedTabIndex !== undefined ? TAB_OPTIONS[selectedTabIndex]?.value : undefined;
      const kb = config.keyBindings;
      const selectAction = selectedTabValue === 'repository' ? 'to open repository' : 'to view stories';

      return `${kb.tabs.navigate.join('/')} navigate • ${kb.tabs.select.join('/')} ${selectAction}`;
    }

    if (viewMode === 'stories') {
      const kb = config.keyBindings;
      let content = `${kb.stories.navigate.join('/')} navigate • ${kb.stories.select.join('/')} to view story • ${kb.stories.openLinks.join('/')} open external link • ${kb.stories.back.join('/')} to go back`;

      content += ` • ${selectedStoryIndex + 1}/${stories.length}`;
      if (totalCount && totalCount > stories.length) {
        content += ` of ${totalCount} total`;
      }
      if (loadingMore) {
        content += ' • Loading more...';
      } else if (!hasMore && totalCount) {
        content += ' • All stories loaded';
      }

      return content;
    }

    return '';
  };

  let footerContent = getFooterContent();
  if (loading) {
    footerContent += " • Loading...";
  }

  return (
    <box justifyContent="center" alignItems="center" flexBasis={1} backgroundColor={theme.bg.secondary} borderColor={theme.border.primary}>
      <text>
        {isModalMode ? styled.warning('Modal mode - press any key | ') : ''}
        {styled.primary(footerContent)}
      </text>
    </box>
  );
};