import { useState } from 'react';
import { useTerminalDimensions } from '@opentui/react';
import { HNStory, ViewMode, Config } from '../types';
import { TAB_OPTIONS } from '../components/TabNavigation';
import { useKeyBindings } from '../contexts/KeyBindingsContext';
import { openLinksInBrowser } from '../utils/browser';

export function useViewNavigation() {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('tabs');
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [selectedStory, setSelectedStory] = useState<HNStory | null>(null);
  const [storyScrollOffset, setStoryScrollOffset] = useState(0);

  const { height } = useTerminalDimensions();
  const visibleHeight = height - 8;
  const storiesPerScreen = Math.floor(visibleHeight / 8);
  const { getKeyString, isKeyMatch, handleModalKey } = useKeyBindings();

  const handleTabNavigation = (key: any, config: Config) => {
    const keyStr = getKeyString(key);

    if (handleModalKey(key)) {
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.navigation.up)) {
      setSelectedTabIndex(prev => prev > 0 ? prev - 1 : TAB_OPTIONS.length - 1);
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.navigation.down)) {
      setSelectedTabIndex(prev => prev < TAB_OPTIONS.length - 1 ? prev + 1 : 0);
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.tabs.select)) {
      setViewMode('stories');
      setSelectedStoryIndex(0);
      return;
    }
  };

  const setTabIndex = (index: number) => {
    setSelectedTabIndex(index);
  };

  const handleNavigateUp = () => {
    if (selectedStoryIndex <= 0) return;

    const newIndex = selectedStoryIndex - 1;
    setSelectedStoryIndex(newIndex);

    if (newIndex < storyScrollOffset) {
      setStoryScrollOffset(Math.max(0, newIndex));
    }
  };

  const handleNavigateDown = (stories: HNStory[], loadMoreCallback?: () => void) => {
    if (selectedStoryIndex < stories.length - 1) {
      const newIndex = selectedStoryIndex + 1;
      setSelectedStoryIndex(newIndex);

      const visibleEnd = storyScrollOffset + storiesPerScreen - 1;
      if (newIndex >= visibleEnd) {
        setStoryScrollOffset(Math.max(0, newIndex - storiesPerScreen + 2));
      }

      if (newIndex >= stories.length - 10 && loadMoreCallback) {
        loadMoreCallback();
      }
      return;
    }

    if (selectedStoryIndex === stories.length - 1 && loadMoreCallback) {
      loadMoreCallback();
    }
  };

  const handleSelectStory = (stories: HNStory[]) => {
    if (stories.length === 0) return;

    setSelectedStory(stories[selectedStoryIndex]);
    setViewMode('story-detail');
  };

  const handleBackToTabs = () => {
    setViewMode('tabs');
    setStoryScrollOffset(0);
    setSelectedStoryIndex(0);
  };

  const handleStoryNavigation = (key: any, stories: HNStory[], config: Config, loadMoreCallback?: () => void) => {
    const keyStr = getKeyString(key);

    if (handleModalKey(key, (modalKey: string) => {
      if (modalKey === 'o' && stories.length > 0) {
        const selectedStory = stories[selectedStoryIndex];
        if (selectedStory?.url) {
          openLinksInBrowser([selectedStory.url]);
        }
      }
    })) {
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.navigation.up)) {
      handleNavigateUp();
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.navigation.down)) {
      handleNavigateDown(stories, loadMoreCallback);
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.stories.select)) {
      handleSelectStory(stories);
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.stories.back)) {
      handleBackToTabs();
      return;
    }
  };

  const handleBackFromStory = () => {
    setViewMode('stories');
    setSelectedStory(null);
  };

  const selectStory = (story: HNStory) => {
    setSelectedStory(story);
    setViewMode('story-detail');
  };

  return {
    selectedTabIndex,
    viewMode,
    selectedStoryIndex,
    selectedStory,
    storyScrollOffset,
    storiesPerScreen,
    handleTabNavigation,
    handleStoryNavigation,
    handleBackFromStory,
    selectStory,
    setTabIndex
  };
}