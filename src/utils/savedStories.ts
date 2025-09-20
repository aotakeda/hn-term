import { HNStory } from '../types';

const SAVED_STORIES_FILE = '.saved-stories.json';

export interface SavedStory extends HNStory {
  savedAt: number;
}

export const getSavedStories = async (): Promise<SavedStory[]> => {
  try {
    const file = Bun.file(SAVED_STORIES_FILE);
    if (await file.exists()) {
      const content = await file.text();
      return JSON.parse(content) || [];
    }
    return [];
  } catch (error) {
    console.warn('Failed to load saved stories:', error);
    return [];
  }
};

export const saveStory = async (story: HNStory): Promise<boolean> => {
  try {
    const savedStories = await getSavedStories();

    const existingIndex = savedStories.findIndex(s => s.id === story.id);
    if (existingIndex !== -1) {
      return false;
    }

    const savedStory: SavedStory = {
      ...story,
      savedAt: Date.now()
    };

    savedStories.unshift(savedStory);

    await Bun.write(SAVED_STORIES_FILE, JSON.stringify(savedStories, null, 2));
    return true;
  } catch (error) {
    console.warn('Failed to save story:', error);
    return false;
  }
};

export const removeSavedStory = async (storyId: number): Promise<boolean> => {
  try {
    const savedStories = await getSavedStories();
    const filteredStories = savedStories.filter(s => s.id !== storyId);

    if (filteredStories.length === savedStories.length) {
      return false;
    }

    await Bun.write(SAVED_STORIES_FILE, JSON.stringify(filteredStories, null, 2));
    return true;
  } catch (error) {
    console.warn('Failed to remove saved story:', error);
    return false;
  }
};

export const isStorySaved = async (storyId: number): Promise<boolean> => {
  try {
    const savedStories = await getSavedStories();
    return savedStories.some(s => s.id === storyId);
  } catch (error) {
    console.warn('Failed to check if story is saved:', error);
    return false;
  }
};

export const clearAllSavedStories = async (): Promise<boolean> => {
  try {
    await Bun.write(SAVED_STORIES_FILE, JSON.stringify([], null, 2));
    return true;
  } catch (error) {
    console.warn('Failed to clear saved stories:', error);
    return false;
  }
};