import fs from 'node:fs';
import path from 'node:path';
import { courses } from '../courses';

export interface SearchSection {
  heading: string;
  anchor: string;
  content: string;
}

export interface SearchChapter {
  id: string;
  title: string;
  sections: SearchSection[];
}

export interface SearchCourse {
  slug: string;
  title: string;
  chapters: SearchChapter[];
}

export interface SearchIndex {
  courses: SearchCourse[];
  builtAt: string;
}

/**
 * Extract text content from HTML, stripping tags
 */
function extractText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();
}

/**
 * Generate anchor ID from heading text
 */
function generateAnchor(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Extract sections from HTML chapter file
 * Looks for h2 and h3 headings with their associated content
 * HTML uses class="section-h2" and class="section-h3" instead of ids
 */
function extractSections(html: string): SearchSection[] {
  const sections: SearchSection[] = [];

  // Match headings (h2, h3) with class="section-h2" or class="section-h3"
  // Format: <h2 class="section-h2">1.1 什么是芯片？</h2>
  const headingRegex = /<h([23])\s+class="section-h[23]"[^>]*>([^<]+)<\/h[23]>/gi;

  let match;
  const headingMatches: Array<{
    level: number;
    anchor: string;
    heading: string;
    startIndex: number;
  }> = [];

  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    const heading = extractText(match[2]);
    const anchor = generateAnchor(heading);
    headingMatches.push({
      level,
      anchor,
      heading,
      startIndex: match.index,
    });
  }

  // For each heading, extract content until the next heading
  for (let i = 0; i < headingMatches.length; i++) {
    const current = headingMatches[i];
    const nextStart =
      i + 1 < headingMatches.length ? headingMatches[i + 1].startIndex : html.length;
    const sectionHtml = html.slice(current.startIndex, nextStart);

    // Extract meaningful content (paragraphs with class="p")
    const contentParts: string[] = [];

    // Get text from paragraph elements
    const pRegex = /<p[^>]*class="p"[^>]*>([\s\S]*?)<\/p>/gi;
    let pMatch;
    while ((pMatch = pRegex.exec(sectionHtml)) !== null) {
      const text = extractText(pMatch[1]);
      if (text.length > 30) {
        contentParts.push(text);
      }
    }

    // Also get span class="kw" (key terms)
    const kwRegex = /<span[^>]*class="kw"[^>]*>([^<]+)<\/span>/gi;
    let kwMatch;
    while ((kwMatch = kwRegex.exec(sectionHtml)) !== null) {
      const term = extractText(kwMatch[1]);
      if (term.length > 2 && term.length < 50) {
        contentParts.push(`[${term}]`);
      }
    }

    const content = contentParts.slice(0, 5).join(' ');

    if (current.heading.length > 0) {
      sections.push({
        heading: current.heading,
        anchor: current.anchor,
        content: content.slice(0, 300),
      });
    }
  }

  return sections;
}

/**
 * Extract chapter title from HTML
 */
function extractChapterTitle(html: string): string {
  // Look for h1 inside the chapter section
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) {
    return extractText(h1Match[1]);
  }

  // Fallback: look for chapter-tag
  const tagMatch = html.match(/<div[^>]*class="chapter-tag"[^>]*>([^<]+)<\/div>/i);
  if (tagMatch) {
    return extractText(tagMatch[1]);
  }

  return 'Untitled Chapter';
}

/**
 * Build search index from all course HTML files
 */
export async function buildSearchIndex(): Promise<SearchIndex> {
  const searchCourses: SearchCourse[] = [];

  for (const course of courses) {
    const searchChapters: SearchChapter[] = [];

    for (const chapter of course.chapters) {
      const htmlPath = path.join(course.sourceRoot, chapter.sourceFile);

      if (!fs.existsSync(htmlPath)) {
        console.warn(`Warning: HTML file not found: ${htmlPath}`);
        continue;
      }

      const rawHtml = fs.readFileSync(htmlPath, 'utf-8');
      const title = extractChapterTitle(rawHtml);
      const sections = extractSections(rawHtml);

      searchChapters.push({
        id: chapter.id,
        title,
        sections,
      });
    }

    searchCourses.push({
      slug: course.slug,
      title: course.title,
      chapters: searchChapters,
    });
  }

  return {
    courses: searchCourses,
    builtAt: new Date().toISOString(),
  };
}
