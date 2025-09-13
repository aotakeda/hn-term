export async function openLinksInBrowser(links: string[]): Promise<void> {
  if (links.length === 0) return;

  try {
    const { exec } = require('child_process');
    const platform = process.platform;

    for (const link of links) {
      let command: string;
      if (platform === 'darwin') {
        command = `open "${link}"`;
      } else if (platform === 'win32') {
        command = `start "${link}"`;
      } else {
        command = `xdg-open "${link}"`;
      }

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