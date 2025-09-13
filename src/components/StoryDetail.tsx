import { useKeyboard, useTerminalDimensions } from '@opentui/react';
import { useState } from 'react';
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
  const [isStorySelected, setIsStorySelected] = useState(true);

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
    setSelectedIndex,
    scrollboxRef,
    navigateUp,
    navigateDown
  } = useCommentNavigation({
    visibleComments,
    headerHeight,
    commentsAreaHeight
  });

  const openStoryLinks = () => {
    if (story.url) {
      openLinksInBrowser([story.url]);
      return;
    }

    if (story.text) {
      const links = extractLinks(story.text);
      if (links.length > 0) {
        openLinksInBrowser(links);
      }
    }
  };

  const openCommentLinks = () => {
    const selectedComment = visibleComments[selectedIndex];
    if (!selectedComment?.text) return;

    const links = extractLinks(selectedComment.text);
    if (links.length > 0) {
      openLinksInBrowser(links);
    }
  };

  const handleOpenLinks = () => {
    if (isStorySelected) {
      openStoryLinks();
    } else {
      openCommentLinks();
    }
  };

  const handleCollapseComment = () => {
    if (isStorySelected) return;

    const selectedComment = visibleComments[selectedIndex];
    if (!selectedComment) return;

    if (expandedComments.has(selectedComment.id)) {
      collapseComment(selectedComment.id);
    }
  };

  const handleExpandComment = () => {
    if (isStorySelected) return;

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

  const selectStoryAndScrollToTop = () => {
    setIsStorySelected(true);
    const scrollContainer = scrollboxRef.current;
    if (scrollContainer) {
      scrollContainer.scrollTo(0);
    }
  };

  const handleNavigateUp = () => {
    if (isStorySelected) {
      return;
    }

    if (selectedIndex === 0) {
      selectStoryAndScrollToTop();
      return;
    }

    navigateUp();
  };

  const selectFirstComment = () => {
    setIsStorySelected(false);
    setSelectedIndex(0);
  };

  const loadMoreIfNeeded = () => {
    const shouldLoadMore = loadedParentCount < parentCommentIds.length && !loadingMore;
    if (shouldLoadMore) {
      loadMoreComments();
    }
  };

  const handleNavigateDown = () => {
    if (isStorySelected) {
      selectFirstComment();
      return;
    }

    navigateDown(loadMoreIfNeeded);
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
      handleNavigateUp();
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
          <StoryHeader story={story} availableWidth={availableWidth} isSelected={isStorySelected} />

          <CommentsList
            comments={visibleComments}
            selectedIndex={isStorySelected ? -1 : selectedIndex}
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