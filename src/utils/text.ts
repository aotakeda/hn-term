export function wrapText(text: string, maxWidth: number, indent: string = ""): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = indent;
  const indentLength = indent.length;
  const effectiveWidth = maxWidth - indentLength;

  for (const word of words) {
    if (currentLine.length - indentLength + word.length + 1 > effectiveWidth && currentLine.length > indentLength) {
      lines.push(currentLine);
      currentLine = indent + word;
    } else {
      if (currentLine.length > indentLength) {
        currentLine += ' ';
      }
      currentLine += word;
    }
  }

  if (currentLine.length > indentLength) {
    lines.push(currentLine);
  }

  return lines.join('\n');
}

export function stripHtml(html: string): string {
  return html
    .replace(/<p>/g, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&')
    .replace(/&#x2F;/g, '/')
    .replace(/&#x3A;/g, ':')
    .replace(/&&#x2F;/g, '&/')
    .replace(/\n\n+/g, '\n\n')
    .trim();
}

export function extractLinks(html: string): string[] {
  const links: string[] = [];
  const linkRegex = /<a[^>]*href="([^"]*)"[^>]*>/gi;
  let match;

  while ((match = linkRegex.exec(html)) !== null) {
    const url = match[1];
    const decodedUrl = url
      .replace(/&#x27;/g, "'")
      .replace(/&quot;/g, '"')
      .replace(/&gt;/g, '>')
      .replace(/&lt;/g, '<')
      .replace(/&amp;/g, '&')
      .replace(/&#x2F;/g, '/')
      .replace(/&#x3A;/g, ':')
      .replace(/&&#x2F;/g, '&/');

    if (decodedUrl && !links.includes(decodedUrl)) {
      links.push(decodedUrl);
    }
  }

  return links;
}