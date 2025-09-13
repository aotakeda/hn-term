import { useState } from 'react';
import { useTerminalDimensions } from '@opentui/react';
import { HNStory, ViewMode, Config } from '../types';
import { TAB_OPTIONS } from '../components/TabNavigation';
import { useKeyBindings } from '../contexts/KeyBindingsContext';

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
    } else if (isKeyMatch(keyStr, config.keyBindings.navigation.down)) {
      setSelectedTabIndex(prev => prev < TAB_OPTIONS.length - 1 ? prev + 1 : 0);
    } else if (isKeyMatch(keyStr, config.keyBindings.tabs.select)) {
      setViewMode('stories');
      setSelectedStoryIndex(0);
    }
  };

  const setTabIndex = (index: number) => {
    setSelectedTabIndex(index);
  };

  const handleStoryNavigation = (key: any, stories: HNStory[], config: Config, loadMoreCallback?: () => void) => {
    const keyStr = getKeyString(key);

    if (handleModalKey(key)) {
      return;
    }

    if (isKeyMatch(keyStr, config.keyBindings.navigation.up) && selectedStoryIndex > 0) {
      const newIndex = selectedStoryIndex - 1;
      setSelectedStoryIndex(newIndex);

      if (newIndex < storyScrollOffset) {
        setStoryScrollOffset(Math.max(0, newIndex));
      }
    } else if (isKeyMatch(keyStr, config.keyBindings.navigation.down) && selectedStoryIndex < stories.length - 1) {
      const newIndex = selectedStoryIndex + 1;
      setSelectedStoryIndex(newIndex);

      const visibleEnd = storyScrollOffset + storiesPerScreen - 1;
      if (newIndex >= visibleEnd) {
        setStoryScrollOffset(Math.max(0, newIndex - storiesPerScreen + 2));
      }

      if (newIndex >= stories.length - 10 && loadMoreCallback) {
        loadMoreCallback();
      }
    } else if (isKeyMatch(keyStr, config.keyBindings.navigation.down) && selectedStoryIndex === stories.length - 1 && loadMoreCallback) {
      loadMoreCallback();
    } else if (isKeyMatch(keyStr, config.keyBindings.stories.select) && stories.length > 0) {
      setSelectedStory(stories[selectedStoryIndex]);
      setViewMode('story-detail');
    } else if (isKeyMatch(keyStr, config.keyBindings.stories.back)) {
      setViewMode('tabs');
      setStoryScrollOffset(0);
      setSelectedStoryIndex(0);
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