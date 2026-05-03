import VideoEmbed from './VideoEmbed';
import DemoEmbed from './DemoEmbed';

interface VideoData {
  type: 'video';
  provider: 'youtube' | 'bilibili' | 'local';
  videoId: string;
  caption?: string;
  title?: string;
}

interface DemoData {
  type: 'demo';
  demoType: 'simulator' | 'codepen' | 'jsfiddle' | 'replit' | 'local' | 'external';
  src?: string;
  title?: string;
  description?: string;
  height?: number;
}

type MediaData = VideoData | DemoData;

interface MediaEmbed {
  id: string;
  data: MediaData;
  placeholderId: string;
}

interface Props {
  html: string;
  mediaEmbeds: MediaEmbed[];
}

/**
 * MediaContent - Renders HTML content with hydrated media embeds
 *
 * This component receives HTML content with placeholder comments for media embeds,
 * splits the content at those placeholders, and renders React components in their place.
 */
export default function MediaContent({ html, mediaEmbeds }: Props) {
  // Split HTML by media placeholders and interleave with React components
  const parts: { type: 'html' | 'media'; content: string | MediaEmbed }[] = [];

  if (mediaEmbeds.length === 0) {
    // No media embeds, just render HTML
    return <div className="chapter-body" dangerouslySetInnerHTML={{ __html: html }} />;
  }

  // Create a map of placeholder ID to media embed
  const mediaMap = new Map<string, MediaEmbed>();
  mediaEmbeds.forEach((m) => mediaMap.set(m.placeholderId, m));

  // Split by placeholders
  const placeholderPattern = /<!--MEDIA_PLACEHOLDER:([^>]+)-->/g;
  let lastIndex = 0;
  let match;

  while ((match = placeholderPattern.exec(html)) !== null) {
    // Add HTML before this placeholder
    if (match.index > lastIndex) {
      parts.push({
        type: 'html',
        content: html.slice(lastIndex, match.index),
      });
    }

    // Add media embed
    const placeholderId = match[1];
    const media = mediaMap.get(placeholderId);
    if (media) {
      parts.push({ type: 'media', content: media });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining HTML
  if (lastIndex < html.length) {
    parts.push({
      type: 'html',
      content: html.slice(lastIndex),
    });
  }

  return (
    <div className="chapter-body">
      {parts.map((part, index) => {
        if (part.type === 'html') {
          return (
            <div
              key={`html-${index}`}
              dangerouslySetInnerHTML={{ __html: part.content as string }}
            />
          );
        }

        const media = part.content as MediaEmbed;

        if (media.data.type === 'video') {
          const videoData = media.data as VideoData;
          return (
            <VideoEmbed
              key={media.id}
              provider={videoData.provider}
              videoId={videoData.videoId}
              caption={videoData.caption}
              title={videoData.title}
            />
          );
        }

        const demoData = media.data as DemoData;
        return (
          <DemoEmbed
            key={media.id}
            type={demoData.demoType}
            src={demoData.src}
            title={demoData.title}
            description={demoData.description}
            height={demoData.height}
          />
        );
      })}
    </div>
  );
}
