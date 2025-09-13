import { render, useKeyboard } from '@opentui/react';
import { useState } from 'react';
import { useHackerNews } from './hooks/useHackerNews';
import { useViewNavigation } from './hooks/useViewNavigation';
import { KeyBindingsProvider, useKeyBindings } from './contexts/KeyBindingsContext';
import { Header } from './components/Header';
import { TabNavigation } from './components/TabNavigation';
import { StoryList } from './components/StoryList';
import { Footer } from './components/Footer';
import { StoryDetail } from './components/StoryDetail';
import { theme } from './theme';
import { HNStoryType } from './types';

const AppContent = () => {
  const [activeStoryType, setActiveStoryType] = useState<HNStoryType>('top');
  const { stories, loading, loadingMore, error, hasMore, loadMore, totalCount } = useHackerNews(activeStoryType, 15);
  const { config } = useKeyBindings();

  const {
    selectedTabIndex,
    viewMode,
    selectedStoryIndex,
    selectedStory,
    storyScrollOffset,
    handleTabNavigation,
    handleStoryNavigation,
    handleBackFromStory,
  } = useViewNavigation();

  useKeyboard((key) => {
    if (viewMode === 'tabs') {
      handleTabNavigation(key, config);
      return;
    }

    if (viewMode === 'stories') {
      handleStoryNavigation(key, stories, config, hasMore ? loadMore : undefined);
      return;
    }
  });

  if (viewMode === 'story-detail' && selectedStory) {
    return <StoryDetail story={selectedStory} onBack={handleBackFromStory} />;
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
          loadingMore={loadingMore}
          error={error}
          selectedIndex={selectedStoryIndex}
          scrollOffset={storyScrollOffset}
        />
      )}

      <Footer
        viewMode={viewMode}
        selectedStoryIndex={selectedStoryIndex}
        stories={stories}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        totalCount={totalCount}
      />
    </box>
  );
};

const App = () => {
  return (
    <KeyBindingsProvider>
      <AppContent />
    </KeyBindingsProvider>
  );
};

render(
  <box backgroundColor={theme.bg.primary} width="100%" height="100%">
    <App />
  </box>
);
