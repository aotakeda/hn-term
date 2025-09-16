import { useState, useRef, useCallback } from 'react';
import type { ScrollBoxRenderable } from '@opentui/core';
import { HNComment } from '../types';

interface UseCommentNavigationProps {
  visibleComments: HNComment[];
  headerHeight: number;
  commentsAreaHeight: number;
  hasMoreParentComments?: boolean;
}

const INDENT_PER_LEVEL = 3;
const BASE_COMMENT_HEIGHT = 3;
const MIN_COMMENT_HEIGHT = 4;
const DEFAULT_WIDTH = 100;
const LOAD_MORE_THRESHOLD = 10;

export const useCommentNavigation = ({
  visibleComments,
  headerHeight,
  commentsAreaHeight,
}: UseCommentNavigationProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commentHeights, setCommentHeights] = useState<Map<number, number>>(new Map());
  const scrollboxRef = useRef<ScrollBoxRenderable | null>(null);

  const calculateCommentHeight = useCallback((comment: HNComment, availableWidth: number): number => {
    const indentWidth = (comment.depth || 0) * INDENT_PER_LEVEL;
    const effectiveWidth = Math.max(20, availableWidth - indentWidth - 4);

    let calculatedHeight = BASE_COMMENT_HEIGHT;

    if (comment.text) {
      const estimatedChars = comment.text.length * 0.7;
      const estimatedLines = Math.ceil(estimatedChars / effectiveWidth);
      calculatedHeight += Math.max(1, estimatedLines);
    }

    calculatedHeight += 1;

    return Math.max(calculatedHeight, MIN_COMMENT_HEIGHT);
  }, []);

  const getCommentHeight = useCallback((comment: HNComment): number => {
    return commentHeights.get(comment.id) || calculateCommentHeight(comment, DEFAULT_WIDTH);
  }, [commentHeights, calculateCommentHeight]);

  const calculateScrollPosition = useCallback((targetIndex: number) => {
    let totalHeight = headerHeight;

    for (let i = 0; i < targetIndex; i++) {
      totalHeight += getCommentHeight(visibleComments[i]);
    }

    return totalHeight;
  }, [visibleComments, headerHeight, getCommentHeight]);

  const scrollToComment = useCallback((commentIndex: number) => {
    const scrollContainer = scrollboxRef.current;

    if (!scrollContainer || commentIndex >= visibleComments.length || commentIndex < 0) {
      return;
    }

    const commentTop = calculateScrollPosition(commentIndex);
    const selectedCommentHeight = getCommentHeight(visibleComments[commentIndex]);

    const viewportCenter = Math.floor(commentsAreaHeight / 2);
    const commentCenter = Math.floor(selectedCommentHeight / 2);
    const idealScrollTop = commentTop - viewportCenter + commentCenter;

    const maxScroll = Math.max(0, scrollContainer.scrollHeight - commentsAreaHeight);
    let targetScrollTop = Math.max(0, Math.min(idealScrollTop, maxScroll));

    if (selectedCommentHeight > commentsAreaHeight * 0.8) {
      targetScrollTop = Math.max(0, commentTop - 2);
    }

    scrollContainer.scrollTo(targetScrollTop);
  }, [visibleComments, commentsAreaHeight, calculateScrollPosition, getCommentHeight]);

  const navigateUp = useCallback(() => {
    const canNavigateUp = selectedIndex > 0;

    if (canNavigateUp) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      scrollToComment(newIndex);
    }
  }, [selectedIndex, scrollToComment]);

  const navigateDown = useCallback((loadMoreCallback?: () => void) => {
    const canNavigateDown = selectedIndex < visibleComments.length - 1;
    const isNearEnd = selectedIndex >= visibleComments.length - LOAD_MORE_THRESHOLD;

    if (canNavigateDown) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      scrollToComment(newIndex);

      if (isNearEnd && loadMoreCallback) {
        loadMoreCallback();
      }
      return;
    }

    if (loadMoreCallback) {
      loadMoreCallback();
    }
  }, [selectedIndex, visibleComments.length, scrollToComment]);

  return {
    selectedIndex,
    setSelectedIndex,
    commentHeights,
    setCommentHeights,
    scrollboxRef,
    calculateCommentHeight,
    scrollToComment,
    navigateUp,
    navigateDown
  };
};