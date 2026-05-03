/**
 * Media Processing Utilities
 *
 * Server-side utilities for parsing video and demo embeds from HTML content.
 * These functions run in Node.js during Astro's static site generation.
 */

export interface VideoEmbedData {
  type: 'video';
  provider: 'youtube' | 'bilibili' | 'local';
  videoId: string;
  caption?: string;
  title?: string;
}

export interface DemoEmbedData {
  type: 'demo';
  demoType: 'simulator' | 'codepen' | 'jsfiddle' | 'replit' | 'local' | 'external';
  src?: string;
  title?: string;
  description?: string;
  height?: number;
}

export type MediaEmbedData = VideoEmbedData | DemoEmbedData;

interface ParsedMedia {
  id: string;
  data: MediaEmbedData;
  placeholderId: string;
}

/**
 * Parse a video-embed div element
 */
function parseVideoElement(element: {
  getAttribute: (name: string) => string | null;
}): VideoEmbedData | null {
  const provider = element.getAttribute('data-provider');
  const videoId = element.getAttribute('data-id');

  if (!provider || !videoId) {
    return null;
  }

  if (!['youtube', 'bilibili', 'local'].includes(provider)) {
    return null;
  }

  return {
    type: 'video',
    provider: provider as VideoEmbedData['provider'],
    videoId,
    caption: element.getAttribute('data-caption') || undefined,
    title: element.getAttribute('data-title') || '视频内容',
  };
}

/**
 * Parse a demo-embed div element
 */
function parseDemoElement(element: {
  getAttribute: (name: string) => string | null;
}): DemoEmbedData | null {
  const demoType = element.getAttribute('data-type');

  if (!demoType) {
    return null;
  }

  const validTypes = ['simulator', 'codepen', 'jsfiddle', 'replit', 'local', 'external'];
  if (!validTypes.includes(demoType)) {
    return null;
  }

  return {
    type: 'demo',
    demoType: demoType as DemoEmbedData['demoType'],
    src: element.getAttribute('data-src') || undefined,
    title: element.getAttribute('data-title') || '交互演示',
    description: element.getAttribute('data-description') || undefined,
    height: element.getAttribute('data-height')
      ? parseInt(element.getAttribute('data-height')!, 10)
      : undefined,
  };
}

/**
 * Find all media embed elements in an HTML string and parse them
 */
export function parseMediaEmbeds(html: string): ParsedMedia[] {
  const results: ParsedMedia[] = [];

  // Simple regex-based parsing for Node.js environment
  // Match video embeds: <div class="video-embed" data-provider="..." data-id="..." ...>...</div>
  const videoRegex =
    /<div\s+class="video-embed"[^>]*data-provider="([^"]+)"[^>]*data-id="([^"]+)"[^>]*>[\s\S]*?<\/div>/g;
  let match;

  while ((match = videoRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const provider = match[1];
    const videoId = match[2];

    // Extract additional attributes
    const captionMatch = fullMatch.match(/data-caption="([^"]*)"/);
    const titleMatch = fullMatch.match(/data-title="([^"]*)"/);

    const data: VideoEmbedData = {
      type: 'video',
      provider: provider as VideoEmbedData['provider'],
      videoId,
      caption: captionMatch ? captionMatch[1] : undefined,
      title: titleMatch ? titleMatch[1] : '视频内容',
    };

    const placeholderId = `media-video-${results.length}`;
    results.push({ id: placeholderId, data, placeholderId });
  }

  // Match demo embeds: <div class="demo-embed" data-type="..." ...>...</div>
  const demoRegex = /<div\s+class="demo-embed"[^>]*data-type="([^"]+)"[^>]*>[\s\S]*?<\/div>/g;

  while ((match = demoRegex.exec(html)) !== null) {
    const fullMatch = match[0];
    const demoType = match[1];

    // Extract additional attributes
    const srcMatch = fullMatch.match(/data-src="([^"]*)"/);
    const titleMatch = fullMatch.match(/data-title="([^"]*)"/);
    const descMatch = fullMatch.match(/data-description="([^"]*)"/);
    const heightMatch = fullMatch.match(/data-height="([^"]*)"/);

    const data: DemoEmbedData = {
      type: 'demo',
      demoType: demoType as DemoEmbedData['demoType'],
      src: srcMatch ? srcMatch[1] : undefined,
      title: titleMatch ? titleMatch[1] : '交互演示',
      description: descMatch ? descMatch[1] : undefined,
      height: heightMatch ? parseInt(heightMatch[1], 10) : undefined,
    };

    const placeholderId = `media-demo-${results.length}`;
    results.push({ id: placeholderId, data, placeholderId });
  }

  return results;
}

/**
 * Transform HTML content by replacing media embed divs with placeholder comments
 * The placeholders will be used by the client-side component to render React components
 */
export function transformMediaEmbeds(html: string): {
  transformedHtml: string;
  mediaEmbeds: ParsedMedia[];
} {
  const mediaEmbeds = parseMediaEmbeds(html);

  let transformedHtml = html;

  // Replace video embeds with placeholder comments
  mediaEmbeds
    .filter((m) => m.data.type === 'video')
    .forEach((media) => {
      const data = media.data as VideoEmbedData;
      const placeholder = `<!--MEDIA_PLACEHOLDER:${media.placeholderId}-->`;

      // Match the video embed div
      const videoRegex = new RegExp(
        `<div\\s+class="video-embed"[^>]*data-provider="${escapeRegex(data.provider)}"[^>]*data-id="${escapeRegex(data.videoId)}"[^>]*>[\\s\\S]*?<\\/div>`,
        'g'
      );
      transformedHtml = transformedHtml.replace(videoRegex, placeholder);
    });

  // Replace demo embeds with placeholder comments
  mediaEmbeds
    .filter((m) => m.data.type === 'demo')
    .forEach((media) => {
      const data = media.data as DemoEmbedData;
      const placeholder = `<!--MEDIA_PLACEHOLDER:${media.placeholderId}-->`;

      const demoRegex = new RegExp(
        `<div\\s+class="demo-embed"[^>]*data-type="${escapeRegex(data.demoType)}"[^>]*>[\\s\\S]*?<\\/div>`,
        'g'
      );
      transformedHtml = transformedHtml.replace(demoRegex, placeholder);
    });

  return { transformedHtml, mediaEmbeds };
}

/**
 * Escape special regex characters in a string
 */
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Serialize media data for passing to client components
 */
export function serializeMediaEmbeds(mediaEmbeds: ParsedMedia[]): string {
  return JSON.stringify(mediaEmbeds);
}
