import { useState, useRef, useCallback } from 'react';
import { HNComment } from '../types';

interface UseCommentNavigationProps {
  visibleComments: HNComment[];
  headerHeight: number;
  commentsAreaHeight: number;
}

export const useCommentNavigation = ({
  visibleComments,
  headerHeight,
  commentsAreaHeight
}: UseCommentNavigationProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commentHeights, setCommentHeights] = useState<Map<number, number>>(new Map());
  const scrollboxRef = useRef<any>(null);

  const calculateCommentHeight = useCallback((comment: HNComment, availableWidth: number): number => {
    const indent = (comment.depth || 0) * 2;
    const effectiveWidth = availableWidth - indent - 2;

    let height = 0;

    height += 1;

    height += 2;

    if (comment.text) {
      const approximateLines = Math.ceil(comment.text.length / effectiveWidth);
      height += approximateLines;
    }

    height += 2;

    return Math.max(height, 5);
  }, []);

  const scrollToComment = useCallback((commentIndex: number) => {
    requestAnimationFrame(() => {
      if (scrollboxRef.current && commentIndex < visibleComments.length) {
        let cumulativeHeight = headerHeight;
        for (let i = 0; i < commentIndex; i++) {
          const commentHeight = commentHeights.get(visibleComments[i].id) ||
            calculateCommentHeight(visibleComments[i], 80);
          cumulativeHeight += commentHeight;
        }

        const selectedCommentHeight = commentHeights.get(visibleComments[commentIndex].id) ||
          calculateCommentHeight(visibleComments[commentIndex], 80);
        const currentScrollTop = scrollboxRef.current.scrollTop || 0;

        const commentBottom = cumulativeHeight + selectedCommentHeight;
        const viewportBottom = currentScrollTop + commentsAreaHeight;

        if (commentBottom > viewportBottom) {
          const scrollY = Math.max(0, commentBottom - commentsAreaHeight);
          scrollboxRef.current.scrollTo(scrollY);
        } else if (cumulativeHeight < currentScrollTop) {
          scrollboxRef.current.scrollTo(cumulativeHeight);
        } else if (cumulativeHeight < currentScrollTop + 3 && currentScrollTop > 0) {
          scrollboxRef.current.scrollTo(Math.max(0, cumulativeHeight));
        }
      }
    });
  }, [visibleComments, headerHeight, commentsAreaHeight, commentHeights, calculateCommentHeight]);

  const navigateUp = useCallback(() => {
    if (selectedIndex > 0) {
      const newIndex = selectedIndex - 1;
      setSelectedIndex(newIndex);
      scrollToComment(newIndex);
    }
  }, [selectedIndex, scrollToComment]);

  const navigateDown = useCallback((loadMoreCallback?: () => void) => {
    if (selectedIndex < visibleComments.length - 1) {
      const newIndex = selectedIndex + 1;
      setSelectedIndex(newIndex);
      scrollToComment(newIndex);

      if (newIndex >= visibleComments.length - 10 && loadMoreCallback) {
        loadMoreCallback();
      }
    } else if (loadMoreCallback) {
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