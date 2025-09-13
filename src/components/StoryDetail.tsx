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
    loadMoreComments,
    getValidChildrenCount
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

  const handleOpenLinks = () => {
    const selectedComment = visibleComments[selectedIndex];
    if (!selectedComment?.text) return;

    const links = extractLinks(selectedComment.text);
    if (links.length > 0) {
      openLinksInBrowser(links);
    }
  };

  const handleCollapseComment = () => {
    const selectedComment = visibleComments[selectedIndex];
    if (!selectedComment) return;

    if (expandedComments.has(selectedComment.id)) {
      collapseComment(selectedComment.id);
    }
  };

  const handleExpandComment = () => {
    const selectedComment = visibleComments[selectedIndex];
    const validChildrenCount = getValidChildrenCount(selectedComment.id);

    if (!selectedComment || validChildrenCount === 0) return;

    const isExpanded = expandedComments.has(selectedComment.id);
    const hasVisibleChildren = navigationOrder.some(item =>
      item.comment.parent === selectedComment.id && item.isVisible
    );

    if (!isExpanded || !hasVisibleChildren) {
      expandComment(selectedComment.id);
    }
  };

  const handleNavigateDown = () => {
    navigateDown(() => {
      const shouldLoadMore = loadedParentCount < parentCommentIds.length && !loadingMore;
      if (shouldLoadMore) {
        loadMoreComments();
      }
    });
  };

  useKeyboard((key) => {
    const keyStr = getKeyString(key);

    const isModalHandled = handleModalKey(key, (modalKey) => {
      if (modalKey === 'o') {
        handleOpenLinks();
      }
    });

    if (isModalHandled) return;

    if (isKeyMatch(keyStr, config.keyBindings.comments.back)) {
      onBack();
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.comments.collapse)) {
      handleCollapseComment();
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.comments.expand)) {
      handleExpandComment();
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.navigation.up)) {
      navigateUp();
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.navigation.down)) {
      handleNavigateDown();
      return;
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
            getValidChildrenCount={getValidChildrenCount}
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