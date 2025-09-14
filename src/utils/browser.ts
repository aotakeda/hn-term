const getOpenCommand = (platform: string, link: string): string => {
  if (platform === 'darwin') {
    return `open "${link}"`;
  }

  if (platform === 'win32') {
    return `start "${link}"`;
  }

  return `xdg-open "${link}"`;
};

export const openLinksInBrowser = async (links: string[]): Promise<void> => {
  if (links.length === 0) return;

  try {
    const { exec } = require('child_process');
    const platform = process.platform;

    for (const link of links) {
      const command = getOpenCommand(platform, link);

      exec(command, (error: unknown) => {
        if (error) {
          console.error(`Failed to open link: ${link}`, error);
        }
      });
    }
  } catch (error) {
    console.error('Failed to open links:', error);
  }
}