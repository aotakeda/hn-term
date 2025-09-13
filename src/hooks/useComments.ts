import { useState, useEffect } from 'react';
import { HNComment, NavigationItem } from '../types';
import { HN_API_BASE } from '../constants/api';

interface UseCommentsProps {
  parentCommentIds: number[];
}

interface UseCommentsReturn {
  allComments: Map<number, HNComment>;
  navigationOrder: NavigationItem[];
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
  expandedComments: Set<number>;
  loadingComments: Set<number>;
  loadedParentCount: number;
  fetchComment: (commentId: number, depth?: number) => Promise<HNComment | null>;
  expandComment: (commentId: number) => Promise<void>;
  collapseComment: (commentId: number) => void;
  loadMoreComments: () => Promise<void>;
  setAllComments: React.Dispatch<React.SetStateAction<Map<number, HNComment>>>;
  setNavigationOrder: React.Dispatch<React.SetStateAction<NavigationItem[]>>;
  setExpandedComments: React.Dispatch<React.SetStateAction<Set<number>>>;
  setLoadingComments: React.Dispatch<React.SetStateAction<Set<number>>>;
}

const PARENTS_PER_BATCH = 10;

export const useComments = ({ parentCommentIds }: UseCommentsProps): UseCommentsReturn => {
  const [allComments, setAllComments] = useState<Map<number, HNComment>>(new Map());
  const [navigationOrder, setNavigationOrder] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedParentCount, setLoadedParentCount] = useState(0);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [loadingComments, setLoadingComments] = useState<Set<number>>(new Set());

  const fetchComment = async (commentId: number, depth: number = 0): Promise<HNComment | null> => {
    try {
      const response = await fetch(`${HN_API_BASE}/item/${commentId}.json`);
      if (!response.ok) return null;
      const comment = await response.json();
      if (!comment) return null;

      return { ...comment, depth };
    } catch (err) {
      return null;
    }
  };

  const fetchParentOnly = async (parentId: number): Promise<HNComment | null> => {
    const parentComment = await fetchComment(parentId, 0);
    if (!parentComment || parentComment.deleted || parentComment.dead) {
      return null;
    }

    return parentComment;
  };

  const collapseComment = (commentId: number): void => {
    const comment = allComments.get(commentId);
    if (!comment || !comment.kids) return;

    const collectDescendants = (parentId: number): number[] => {
      const descendants: number[] = [];
      const parent = allComments.get(parentId);
      if (parent && parent.kids) {
        for (const childId of parent.kids) {
          descendants.push(childId);
          descendants.push(...collectDescendants(childId));
        }
      }
      return descendants;
    };

    const descendantIds = collectDescendants(commentId);

    setNavigationOrder(prev =>
      prev.map(item => ({
        ...item,
        isVisible: descendantIds.includes(item.commentId) ? false : item.isVisible
      }))
    );

    setExpandedComments(prev => {
      const newSet = new Set(prev);
      newSet.delete(commentId);
      return newSet;
    });
  };

  const expandComment = async (commentId: number): Promise<void> => {
    const comment = allComments.get(commentId);
    if (!comment || !comment.kids || comment.kids.length === 0) return;

    setLoadingComments(prev => new Set([...prev, commentId]));
    try {
      const childComments: HNComment[] = [];

      for (const childId of comment.kids) {
        const child = await fetchComment(childId, (comment.depth || 0) + 1);
        if (child && !child.deleted && !child.dead) {
          childComments.push(child);
        }
      }

      if (childComments.length > 0) {
        setAllComments(prev => {
          const newMap = new Map(prev);
          childComments.forEach(child => newMap.set(child.id, child));
          return newMap;
        });

        setNavigationOrder(prev => {
          const parentIndex = prev.findIndex(item => item.commentId === commentId);
          if (parentIndex === -1) return prev;

          const newOrder = [...prev];
          const childItems: NavigationItem[] = childComments.map(child => ({
            commentId: child.id,
            comment: child,
            isVisible: true
          }));

          newOrder.splice(parentIndex + 1, 0, ...childItems);
          return newOrder;
        });
      }

      setExpandedComments(prev => new Set([...prev, commentId]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to expand comment');
    } finally {
      setLoadingComments(prev => {
        const newSet = new Set(prev);
        newSet.delete(commentId);
        return newSet;
      });
    }
  };

  const loadMoreComments = async () => {
    if (loadingMore || loadedParentCount >= parentCommentIds.length) {
      return;
    }

    setLoadingMore(true);
    try {
      const startIndex = loadedParentCount;
      const endIndex = Math.min(startIndex + PARENTS_PER_BATCH, parentCommentIds.length);
      const batchParentIds = parentCommentIds.slice(startIndex, endIndex);

      const newComments: HNComment[] = [];

      for (const parentId of batchParentIds) {
        const parentComment = await fetchParentOnly(parentId);
        if (parentComment) {
          newComments.push(parentComment);
        }
      }

      if (newComments.length > 0) {
        setAllComments(prev => {
          const newMap = new Map(prev);
          newComments.forEach(comment => newMap.set(comment.id, comment));
          return newMap;
        });

        setNavigationOrder(prev => {
          const newItems: NavigationItem[] = newComments.map(comment => ({
            commentId: comment.id,
            comment: comment,
            isVisible: true
          }));
          return [...prev, ...newItems];
        });
      }

      setLoadedParentCount(endIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more comments');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    const loadInitialComments = async () => {
      if (!parentCommentIds || parentCommentIds.length === 0) {
        return;
      }

      setLoading(true);
      setError(null);
      setAllComments(new Map());
      setNavigationOrder([]);
      setLoadedParentCount(0);
      setLoadingComments(new Set());

      try {
        const initialParents = parentCommentIds.slice(0, Math.min(PARENTS_PER_BATCH, parentCommentIds.length));
        const initialComments: HNComment[] = [];

        for (const parentId of initialParents) {
          const parentComment = await fetchParentOnly(parentId);
          if (parentComment) {
            initialComments.push(parentComment);
          }
        }

        if (initialComments.length > 0) {
          const commentsMap = new Map();
          initialComments.forEach(comment => commentsMap.set(comment.id, comment));
          setAllComments(commentsMap);

          const navItems: NavigationItem[] = initialComments.map(comment => ({
            commentId: comment.id,
            comment: comment,
            isVisible: true
          }));
          setNavigationOrder(navItems);
        }

        setLoadedParentCount(initialParents.length);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    loadInitialComments();
  }, [parentCommentIds]);

  return {
    allComments,
    navigationOrder,
    loading,
    loadingMore,
    error,
    expandedComments,
    loadingComments,
    loadedParentCount,
    fetchComment,
    expandComment,
    collapseComment,
    loadMoreComments,
    setAllComments,
    setNavigationOrder,
    setExpandedComments,
    setLoadingComments
  };
};