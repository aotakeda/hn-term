import { useState, useEffect } from 'react';
import { getSavedStories, SavedStory } from '../utils/savedStories';

export const useSavedStories = () => {
  const [savedStories, setSavedStories] = useState<SavedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSavedStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const stories = await getSavedStories();
      setSavedStories(stories);
    } catch (err) {
      setError('Failed to load saved stories');
      console.error('Error loading saved stories:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshSavedStories = () => {
    loadSavedStories();
  };

  useEffect(() => {
    loadSavedStories();
  }, []);

  const isStorySaved = (storyId: number): boolean => {
    return savedStories.some(story => story.id === storyId);
  };

  return {
    savedStories,
    loading,
    error,
    refreshSavedStories,
    totalCount: savedStories.length,
    isStorySaved
  };
};