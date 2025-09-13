import { useKeyboard, useTerminalDimensions } from '@opentui/react';
import { HNStory } from '../types';
import { extractLinks, openLinksInBrowser } from '../utils';
import { styled, theme } from '../theme';
import { useKeyBindings } from '../contexts/KeyBindingsContext';
import { useComments } from '../hooks/useComments';
import { useCommentNavigation } from '../hooks/useCommentNavigation';
import { StoryHeader } from './StoryHeader';
import { CommentsList } from './CommentsList';

interface StoryDetailProps {
  story: HNStory;
  onBack: () => void;
}

export const StoryDetail = ({ story, onBack }: StoryDetailProps) => {
  const { width, height } = useTerminalDimensions();
  const { config, isModalMode, getKeyString, isKeyMatch, handleModalKey, getHelpText } = useKeyBindings();

  const commentsAreaHeight = height - 2;
  const availableWidth = Math.max(40, width - 8);
  const parentCommentIds = story.kids || [];

  const calculateHeaderHeight = (): number => {
    let headerHeight = 2;
    headerHeight += 1;
    headerHeight += 1;
    if (story.url) headerHeight += 1;
    if (story.text) {
      headerHeight += Math.ceil(story.text.length / availableWidth);
    }
    headerHeight += 1;
    return headerHeight;
  };

  const headerHeight = calculateHeaderHeight();

  const {
    navigationOrder,
    loading,
    loadingMore,
    error,
    expandedComments,
    loadingComments,
    loadedParentCount,
    expandComment,
    collapseComment,
    loadMoreComments
  } = useComments({
    parentCommentIds
  });

  const visibleComments = navigationOrder.filter(item => item.isVisible).map(item => item.comment);

  const {
    selectedIndex,
    scrollboxRef,
    navigateUp,
    navigateDown
  } = useCommentNavigation({
    visibleComments,
    headerHeight,
    commentsAreaHeight
  });

  useKeyboard((key) => {
    const keyStr = getKeyString(key);

    if (handleModalKey(key, (modalKey) => {
      if (modalKey === 'o') {
        const selectedComment = visibleComments[selectedIndex];
        if (selectedComment && selectedComment.text) {
          const links = extractLinks(selectedComment.text);
          if (links.length > 0) {
            openLinksInBrowser(links);
          }
        }
      }
    })) {
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.comments.back)) {
      onBack();
    } else if (isKeyMatch(keyStr, config.keyBindings.comments.collapse)) {
      const selectedComment = visibleComments[selectedIndex];
      if (selectedComment && expandedComments.has(selectedComment.id)) {
        collapseComment(selectedComment.id);
      }
    } else if (isKeyMatch(keyStr, config.keyBindings.comments.expand)) {
      const selectedComment = visibleComments[selectedIndex];
      if (selectedComment && selectedComment.kids && selectedComment.kids.length > 0) {
        if (!expandedComments.has(selectedComment.id)) {
          expandComment(selectedComment.id);
        }
      }
    } else if (isKeyMatch(keyStr, config.keyBindings.navigation.up)) {
      navigateUp();
    } else if (isKeyMatch(keyStr, config.keyBindings.navigation.down)) {
      navigateDown(() => {
        if (loadedParentCount < parentCommentIds.length && !loadingMore) {
          loadMoreComments();
        }
      });
    }
  });

  return (
    <box flexGrow={1} flexDirection="column" backgroundColor={theme.bg.primary}>
      <box flexGrow={1}>
        <scrollbox ref={scrollboxRef} height={height - 2} width="100%" backgroundColor={theme.bg.primary}>
          <StoryHeader story={story} availableWidth={availableWidth} />

          <CommentsList
            comments={visibleComments}
            selectedIndex={selectedIndex}
            availableWidth={availableWidth}
            expandedComments={expandedComments}
            loadingComments={loadingComments}
            loading={loading}
            loadingMore={loadingMore}
            error={error}
          />
        </scrollbox>
      </box>

      <box
        justifyContent="center"
        alignItems="center"
        flexBasis={2}
        backgroundColor={theme.bg.secondary}
        borderColor={theme.border.primary}
      >
        <text>
          {isModalMode ? styled.warning('Modal mode - press o to open links | ') : ''}
          {styled.tertiary(getHelpText('comments'))}
          {loadingMore ? styled.warning(' • Loading...') : ''}
        </text>
      </box>
    </box>
  );
};