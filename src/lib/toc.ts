/**
 * Table of Contents extraction utility
 * Parses HTML content to extract h2 and h3 headings and builds a hierarchical TOC structure
 */

export interface TocItem {
  id: string;
  text: string;
  level: 2 | 3;
  children: TocItem[];
}

/**
 * Generate a slug ID from heading text
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w一-鿿-]/g, '') // Keep alphanumeric, Chinese chars, and hyphens
    .replace(/--+/g, '-') // Replace multiple hyphens with single
    .replace(/^-+|-+$/g, ''); // Trim hyphens from start/end
}

/**
 * Extract text content from an HTML element string
 */
function extractText(html: string): string {
  // Simple regex to extract text between tags
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

/**
 * Parse HTML and extract h2/h3 headings with their IDs
 */
export function extractToc(html: string): TocItem[] {
  const toc: TocItem[] = [];
  let currentH2: TocItem | null = null;

  // Match h2 and h3 headings with class="section-h2" or class="section-h3"
  // Pattern: <h2 class="section-h2">text</h2> or <h3 class="section-h3">text</h3>
  const headingRegex = /<(h[23])\s+class="section-h[23]">([\s\S]*?)<\/\1>/gi;

  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1].slice(1)) as 2 | 3; // h2 -> 2, h3 -> 3
    const text = extractText(match[2]);
    const id = slugify(text);

    const item: TocItem = {
      id,
      text,
      level,
      children: [],
    };

    if (level === 2) {
      toc.push(item);
      currentH2 = item;
    } else if (level === 3 && currentH2) {
      currentH2.children.push(item);
    } else if (level === 3) {
      // h3 without preceding h2, add to root
      toc.push(item);
    }
  }

  return toc;
}

/**
 * Get flat list of all TOC items (for intersection observer tracking)
 */
export function flattenToc(toc: TocItem[]): Array<{ id: string; level: number }> {
  const result: Array<{ id: string; level: number }> = [];

  for (const item of toc) {
    result.push({ id: item.id, level: item.level });
    for (const child of item.children) {
      result.push({ id: child.id, level: child.level });
    }
  }

  return result;
}
