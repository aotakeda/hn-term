import { styled, theme } from '../theme';

export const Header = () => {
  return (
    <box justifyContent="center" alignItems="center" flexBasis={5} backgroundColor={theme.bg.primary}>
      <ascii-font font="tiny" text="HN Term" />
      <text>{styled.secondary('Read HN in your terminal')}</text>
    </box>
  );
};