import { useState, useRef, useCallback } from 'react';
import type { ScrollBoxRenderable } from '@opentui/core';
import { HNComment } from '../types';

interface UseCommentNavigationProps {
  visibleComments: HNComment[];
  headerHeight: number;
  commentsAreaHeight: number;
  hasMoreParentComments?: boolean;
}

const INDENT_SIZE = 2;
const BASE_COMMENT_HEIGHT = 2;
const MIN_COMMENT_HEIGHT = 5;
const DEFAULT_WIDTH = 100;
const LOAD_MORE_THRESHOLD = 10;

export const useCommentNavigation = ({
  visibleComments,
  headerHeight,
  commentsAreaHeight,
  hasMoreParentComments = false,
}: UseCommentNavigationProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commentHeights, setCommentHeights] = useState<Map<number, number>>(new Map());
  const scrollboxRef = useRef<ScrollBoxRenderable | null>(null);

  const calculateCommentHeight = useCallback((comment: HNComment, availableWidth: number): number => {
    const indentWidth = (comment.depth || 0) * INDENT_SIZE;
    const contentWidth = availableWidth - indentWidth - 2;

    let calculatedHeight = BASE_COMMENT_HEIGHT;

    if (comment.text) {
      const estimatedLines = Math.ceil(comment.text.length / contentWidth);
      calculatedHeight += estimatedLines;
    }

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
    requestAnimationFrame(() => {
      const scrollContainer = scrollboxRef.current;

      if (!scrollContainer || commentIndex >= visibleComments.length) {
        return;
      }

      const commentTop = calculateScrollPosition(commentIndex);
      const selectedCommentHeight = getCommentHeight(visibleComments[commentIndex]);
      const commentBottom = commentTop + selectedCommentHeight;
      const currentScrollTop = scrollContainer.scrollTop || 0;
      const viewportTop = currentScrollTop;
      const viewportBottom = currentScrollTop + commentsAreaHeight;

      const isCommentTallerThanViewport = selectedCommentHeight > commentsAreaHeight;
      const isCommentFullyVisible = commentTop >= viewportTop && commentBottom <= viewportBottom;

      if (isCommentFullyVisible) {
        return;
      }

      const scrollToTop = () => scrollContainer.scrollTo(commentTop);
      const scrollToFitBottom = () => {
        const newScrollTop = commentBottom - commentsAreaHeight;
        const isLastVisibleComment = commentIndex === visibleComments.length - 1;
        const isAbsoluteLastComment = isLastVisibleComment && !hasMoreParentComments;

        if (isAbsoluteLastComment) {
          scrollContainer.scrollTo(scrollContainer.scrollHeight);
          return;
        }

        scrollContainer.scrollTo(Math.max(0, newScrollTop));
      };

      if (isCommentTallerThanViewport) {
        scrollContainer.scrollTo(commentTop);
        return;
      }

      const isCommentAboveViewport = commentTop < viewportTop;
      if (isCommentAboveViewport) {
        scrollToTop();
        return;
      }

      const isCommentBelowViewport = commentBottom > viewportBottom;
      if (isCommentBelowViewport) {
        scrollToFitBottom();
      }
    });
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