import { parseColor } from '@opentui/core';
import { styled, theme } from '../theme';

export const Header = () => {
  return (
    <box justifyContent="center" alignItems="center" flexBasis={5}>
      <ascii-font font="tiny" text="HN Term" bg={parseColor(theme.bg.tertiary)} fg={parseColor(theme.accent.primary)} />
      <text>{styled.secondary('Read HN in your terminal')}</text>
    </box>
  );
};