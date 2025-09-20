import { useState } from 'react';
import { useTerminalDimensions } from '@opentui/react';
import type { ParsedKey } from '@opentui/core';
import { HNStory, ViewMode, Config } from '../types';
import { TAB_OPTIONS } from '../components/TabNavigation';
import { useConfig } from '../contexts/ConfigContext';
import { openLinksInBrowser } from '../utils/browser';
import { saveStory, removeSavedStory } from '../utils/savedStories';
import { extractModalKeyFromBindings } from '../utils/keyUtils';

export const useViewNavigation = () => {
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('tabs');
  const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
  const [selectedStory, setSelectedStory] = useState<HNStory | null>(null);
  const [storyScrollOffset, setStoryScrollOffset] = useState(0);

  const { height } = useTerminalDimensions();
  const visibleHeight = height - 8;
  const storiesPerScreen = Math.floor(visibleHeight / 8);
  const { getKeyString, isKeyMatch, handleModalKey } = useConfig();

  const handleTabNavigation = (key: ParsedKey, config: Config, refetchCallback?: () => void) => {
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
      const selectedTab = TAB_OPTIONS[selectedTabIndex];
      if (!selectedTab) return;

      if (selectedTab.value === 'repository') {
        openLinksInBrowser(['https://github.com/aotakeda/hn-term']);
        return;
      }

      setViewMode('stories');
      setSelectedStoryIndex(0);
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.tabs.refresh) && refetchCallback) {
      refetchCallback();
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

    const selectedStory = stories[selectedStoryIndex];

    if (selectedStory.type === 'job' && selectedStory.url) {
      openLinksInBrowser([selectedStory.url]);
      return;
    }

    setSelectedStory(selectedStory);
    setViewMode('story-detail');
  };

  const handleBackToTabs = () => {
    setViewMode('tabs');
    setStoryScrollOffset(0);
    setSelectedStoryIndex(0);
  };

  const handleStoryNavigation = (key: ParsedKey, stories: HNStory[], config: Config, loadMoreCallback?: () => void, refetchCallback?: () => void, refreshSavedStoriesCallback?: () => void) => {
    const keyStr = getKeyString(key);

    if (handleModalKey(key, (modalKey: string) => {
      const openLinkKey = extractModalKeyFromBindings(config.keyBindings.stories.openLinks);
      const saveKey = extractModalKeyFromBindings(config.keyBindings.stories.save);
      const removeKey = extractModalKeyFromBindings(config.keyBindings.stories.remove);

      if (modalKey === openLinkKey && stories.length > 0) {
        const selectedStory = stories[selectedStoryIndex];
        if (selectedStory?.url) {
          openLinksInBrowser([selectedStory.url]);
        }
      }
      if (modalKey === saveKey && stories.length > 0) {
        const selectedStory = stories[selectedStoryIndex];
        if (selectedStory) {
          (async () => {
            await saveStory(selectedStory);
            if (refreshSavedStoriesCallback) {
              refreshSavedStoriesCallback();
            }
          })();
        }
      }
      if (modalKey === removeKey && stories.length > 0) {
        const selectedStory = stories[selectedStoryIndex];
        if (selectedStory) {
          (async () => {
            await removeSavedStory(selectedStory.id);
            if (refreshSavedStoriesCallback) {
              refreshSavedStoriesCallback();
            }
          })();
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

    if (isKeyMatch(keyStr, config.keyBindings.stories.refresh) && refetchCallback) {
      refetchCallback();
      setSelectedStoryIndex(0);
      setStoryScrollOffset(0);
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

  const updateSelectedStory = (updatedStory: HNStory) => {
    setSelectedStory(updatedStory);
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
    updateSelectedStory,
    setTabIndex
  };
}