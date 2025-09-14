import { useState, useEffect } from 'react';
import { HNStory, HNApiStoryType } from '../types';
import { HN_API_BASE, STORY_ENDPOINTS } from '../constants/api';

export function useHackerNews(storyType: HNApiStoryType, initialLimit: number = 30) {
  const [stories, setStories] = useState<HNStory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allStoryIds, setAllStoryIds] = useState<number[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const STORIES_PER_BATCH = 15;

  const fetchInitialStories = async () => {
    if (!storyType) return;

    setLoading(true);
    setError(null);
    setStories([]);
    setLoadedCount(0);
    setHasMore(true);

    try {
      const idsResponse = await fetch(STORY_ENDPOINTS[storyType]);
      if (!idsResponse.ok) {
        throw new Error(`Failed to fetch ${storyType} stories`);
      }

      const storyIds: number[] = await idsResponse.json();
      setAllStoryIds(storyIds);

      const initialIds = storyIds.slice(0, Math.min(initialLimit, storyIds.length));

      const storyPromises = initialIds.map(async (id) => {
        const response = await fetch(`${HN_API_BASE}/item/${id}.json`);
        if (!response.ok) return null;
        return response.json();
      });

      const fetchedStories = await Promise.all(storyPromises);
      const validStories = fetchedStories.filter(Boolean);

      setStories(validStories);
      setLoadedCount(initialIds.length);
      setHasMore(initialIds.length < storyIds.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreStories = async () => {
    if (loadingMore || !hasMore || loadedCount >= allStoryIds.length) {
      return;
    }

    setLoadingMore(true);
    try {
      const nextBatchStart = loadedCount;
      const nextBatchEnd = Math.min(nextBatchStart + STORIES_PER_BATCH, allStoryIds.length);
      const nextBatchIds = allStoryIds.slice(nextBatchStart, nextBatchEnd);

      if (nextBatchIds.length === 0) {
        setHasMore(false);
        return;
      }

      const storyPromises = nextBatchIds.map(async (id) => {
        const response = await fetch(`${HN_API_BASE}/item/${id}.json`);
        if (!response.ok) return null;
        return response.json();
      });

      const fetchedStories = await Promise.all(storyPromises);
      const validStories = fetchedStories.filter(Boolean);

      setStories(prev => [...prev, ...validStories]);
      setLoadedCount(nextBatchEnd);
      setHasMore(nextBatchEnd < allStoryIds.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more stories');
    } finally {
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchInitialStories();
  }, [storyType]);

  return {
    stories,
    loading,
    loadingMore,
    error,
    hasMore,
    loadedCount,
    totalCount: allStoryIds.length,
    refetch: fetchInitialStories,
    loadMore: loadMoreStories,
  };
}

