import { useEffect } from 'react';
import { HNStoryType } from '../types';
import { styled, theme } from '../theme';

interface TabOption {
  name: string;
  description: string;
  value: HNStoryType;
}

interface TabNavigationProps {
  selectedIndex: number;
  onStoryTypeChange: (storyType: HNStoryType) => void;
}

export const TAB_OPTIONS: TabOption[] = [
  { name: "Top", description: "Top stories of the day", value: "top" },
  { name: "New", description: "Newest stories", value: "new" },
  { name: "Show", description: "Show HN stories", value: "show" },
  { name: "Ask", description: "Ask HN stories", value: "ask" },
  { name: "Jobs", description: "Jobs postings", value: "jobs" }
];

export const TabNavigation = ({ selectedIndex, onStoryTypeChange }: TabNavigationProps) => {
  useEffect(() => {
    const selectedOption = TAB_OPTIONS[selectedIndex];
    if (selectedOption) {
      onStoryTypeChange(selectedOption.value);
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