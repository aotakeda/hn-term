import { render, useKeyboard } from '@opentui/react';
import { useState } from 'react';
import { useHackerNews } from './hooks/useHackerNews';
import { useViewNavigation } from './hooks/useViewNavigation';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { StoryList } from './components/StoryList';
import { Footer } from './components/Footer';
import { StoryDetail } from './components/StoryDetail';
import { theme } from './theme';
import { HNApiStoryType } from './types';
import { useSavedStories } from './hooks/useSavedStories';
import { TAB_OPTIONS } from './components/TabNavigation';

const AppContent = () => {
  const [activeStoryType, setActiveStoryType] = useState<HNApiStoryType>('top');
  const { stories: hnStories, loading: hnLoading, loadingMore, error: hnError, hasMore, loadMore, totalCount: hnTotalCount, refetch } = useHackerNews(activeStoryType, 15);
  const { savedStories, loading: savedLoading, error: savedError, refreshSavedStories, totalCount: savedTotalCount, isStorySaved } = useSavedStories();
  const { config } = useConfig();

  const {
    selectedTabIndex,
    viewMode,
    selectedStoryIndex,
    selectedStory,
    storyScrollOffset,
    handleTabNavigation,
    handleStoryNavigation,
    handleBackFromStory,
    updateSelectedStory,
  } = useViewNavigation();

  const selectedTab = TAB_OPTIONS[selectedTabIndex];
  const isShowingSaved = selectedTab?.value === 'saved';
  const stories = isShowingSaved ? savedStories : hnStories;
  const loading = isShowingSaved ? savedLoading : hnLoading;
  const error = isShowingSaved ? savedError : hnError;
  const totalCount = isShowingSaved ? savedTotalCount : hnTotalCount;
  const refreshCallback = isShowingSaved ? refreshSavedStories : refetch;

  useKeyboard((key) => {
    if (viewMode === 'tabs') {
      handleTabNavigation(key, config, refreshCallback);
      return;
    }

    if (viewMode === 'stories') {
      const loadMoreCallback = isShowingSaved ? undefined : (hasMore ? loadMore : undefined);
      handleStoryNavigation(key, stories, config, loadMoreCallback, refreshCallback, refreshSavedStories);
      return;
    }
  });

  if (viewMode === 'story-detail' && selectedStory) {
    return <StoryDetail story={selectedStory} onBack={handleBackFromStory} onStoryUpdate={updateSelectedStory} />;
  }

  return (
    <box
      flexGrow={1}
      flexDirection="column"
      backgroundColor={theme.bg.primary}
      width="100%"
      height="100%"
    >
      <Header />
      
      {viewMode === 'tabs' && (
        <TabNavigation 
          selectedIndex={selectedTabIndex}
          onStoryTypeChange={setActiveStoryType}
        />
      )}

      {viewMode === 'stories' && (
        <StoryList
          stories={stories}
          loading={loading}
          loadingMore={isShowingSaved ? false : loadingMore}
          error={error}
          selectedIndex={selectedStoryIndex}
          scrollOffset={storyScrollOffset}
          isStorySaved={isStorySaved}
          showEmptyState={isShowingSaved}
          emptyStateMessage="No saved stories yet"
          saveKeyBinding={config.keyBindings.stories.save[0]}
        />
      )}

      <Footer
        viewMode={viewMode}
        selectedStoryIndex={selectedStoryIndex}
        selectedTabIndex={selectedTabIndex}
        stories={stories}
        loading={loading}
        loadingMore={isShowingSaved ? false : loadingMore}
        hasMore={isShowingSaved ? false : hasMore}
        totalCount={totalCount}
      />
    </box>
  );
};

const App = () => {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  );
};

render(
  <box backgroundColor={theme.bg.primary} width="100%" height="100%">
    <App />
  </box>
);
