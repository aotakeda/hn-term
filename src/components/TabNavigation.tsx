import { useEffect } from 'react';
import { HNStoryType, HNApiStoryType } from '../types';
import { styled, theme } from '../theme';

interface TabOption {
  name: string;
  description: string;
  value: HNStoryType;
}

interface ApiTabOption {
  name: string;
  description: string;
  value: HNApiStoryType;
}

interface TabNavigationProps {
  selectedIndex: number;
  onStoryTypeChange: (storyType: HNApiStoryType) => void;
}

const API_TAB_OPTIONS: ApiTabOption[] = [
  { name: "Top", description: "Top stories of the day", value: "top" },
  { name: "New", description: "Newest stories", value: "new" },
  { name: "Show", description: "Show HN stories", value: "show" },
  { name: "Ask", description: "Ask HN stories", value: "ask" },
  { name: "Jobs", description: "Jobs postings", value: "jobs" }
];

export const TAB_OPTIONS: TabOption[] = [
  ...API_TAB_OPTIONS,
  { name: "Repository", description: "Check the code, it's open-source!", value: "repository" }
];

export const TabNavigation = ({ selectedIndex, onStoryTypeChange }: TabNavigationProps) => {
  useEffect(() => {
    const selectedOption = TAB_OPTIONS[selectedIndex];
    if (selectedOption && selectedOption.value !== 'repository') {
      const apiOption = API_TAB_OPTIONS.find(opt => opt.value === selectedOption.value);
      if (apiOption) {
        onStoryTypeChange(apiOption.value);
      }
    }
  }, [selectedIndex, onStoryTypeChange]);

  return (
    <box flexDirection="column" width="100%" backgroundColor={theme.bg.primary} padding={1}>
      {TAB_OPTIONS.map((option, index) => {
        const isSelected = index === selectedIndex;
        return (
          <box
            key={option.value}
            padding={1}
            marginBottom={1}
            backgroundColor={isSelected ? theme.bg.selected : theme.bg.secondary}
            borderColor={isSelected ? theme.border.focused : theme.border.secondary}
          >
            <box flexDirection="column" width="100%">
              <text>
                {styled.accent(`${index + 1}.`)} {isSelected ? styled.highlighted(option.name) : styled.primary(option.name)}
              </text>
              <text>
                {styled.tertiary(option.description)}
              </text>
            </box>
          </box>
        );
      })}
    </box>
  );
};