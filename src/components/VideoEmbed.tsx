import { useState, useEffect, useRef } from 'react';

interface VideoEmbedProps {
  provider: 'youtube' | 'bilibili' | 'local';
  videoId: string;
  caption?: string;
  title?: string;
}

function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`;
}

function getYouTubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

function getBilibiliEmbedUrl(bvId: string): string {
  return `https://player.bilibili.com/player.html?bvid=${bvId}&autoPlay=false`;
}

function getBilibiliThumbnail(bvId: string): string {
  return `https://player.bilibili.com/player.html?bvid=${bvId}`;
}

function isValidYouTubeId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{11}$/.test(id);
}

function isValidBVId(id: string): boolean {
  return /^BV[a-zA-Z0-9]{10}$/.test(id);
}

export default function VideoEmbed({
  provider,
  videoId,
  caption,
  title = '视频内容',
}: VideoEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getEmbedUrl = () => {
    switch (provider) {
      case 'youtube':
        return getYouTubeEmbedUrl(videoId);
      case 'bilibili':
        return getBilibiliEmbedUrl(videoId);
      case 'local':
        return videoId;
      default:
        return '';
    }
  };

  const getThumbnail = () => {
    if (provider === 'youtube' && isValidYouTubeId(videoId)) {
      return getYouTubeThumbnail(videoId);
    }
    return null;
  };

  const thumbnail = getThumbnail();

  const handlePlay = () => {
    setIsPlaying(true);
    setIsLoaded(true);
  };

  const handleIframeLoad = () => {
    setIsLoaded(true);
  };

  // Lazy loading via Intersection Observer
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isPlaying) {
            // Start loading when visible
            setIsLoaded(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [isPlaying]);

  return (
    <div className="video-embed-wrapper" ref={containerRef}>
      <figure className="video-embed-figure">
        <div className="video-embed-container" data-provider={provider}>
          {!isPlaying ? (
            <div className="video-embed-poster" onClick={handlePlay}>
              {thumbnail && (
                <img
                  src={thumbnail}
                  alt={`${title} 封面`}
                  className="video-embed-thumbnail"
                  loading="lazy"
                />
              )}
              <div className="video-embed-overlay">
                <button className="video-embed-play-btn" aria-label={`播放 ${title}`} type="button">
                  <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <iframe
              src={getEmbedUrl()}
              title={title}
              className="video-embed-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onLoad={handleIframeLoad}
            />
          )}
        </div>
        {caption && <figcaption className="video-embed-caption">{caption}</figcaption>}
      </figure>

      <style>{`
        .video-embed-wrapper {
          margin: 24px 0;
        }

        .video-embed-figure {
          margin: 0;
        }

        .video-embed-container {
          position: relative;
          width: 100%;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
          height: 0;
          overflow: hidden;
          border-radius: var(--radius, 18px);
          background: var(--surface-2, #f6f2ea);
        }

        .video-embed-container[data-provider="local"] {
          padding-bottom: 0;
          height: auto;
        }

        .video-embed-poster {
          position: absolute;
          inset: 0;
          cursor: pointer;
        }

        .video-embed-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-embed-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
          transition: background 0.2s ease;
        }

        .video-embed-poster:hover .video-embed-overlay {
          background: rgba(0, 0, 0, 0.4);
        }

        .video-embed-play-btn {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          border: none;
          background: rgba(255, 255, 255, 0.95);
          color: var(--accent, #0f6fff);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .video-embed-play-btn:hover {
          transform: scale(1.08);
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
        }

        .video-embed-play-btn svg {
          margin-left: 4px;
        }

        .video-embed-iframe {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: none;
          border-radius: var(--radius, 18px);
        }

        .video-embed-caption {
          margin-top: 12px;
          font-size: 14px;
          color: var(--text-3, #7a818f);
          text-align: center;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}
