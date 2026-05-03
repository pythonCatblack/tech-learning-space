import VideoEmbed from './VideoEmbed';
import DemoEmbed from './DemoEmbed';

type MediaType = 'video' | 'demo' | 'interactive';
type VideoProvider = 'youtube' | 'bilibili' | 'local';
type DemoType = 'simulator' | 'codepen' | 'jsfiddle' | 'replit' | 'local' | 'external';

interface BaseMediaCardProps {
  title?: string;
  description?: string;
  type: MediaType;
  badge?: string;
}

interface VideoMediaCardProps extends BaseMediaCardProps {
  type: 'video';
  provider: VideoProvider;
  videoId: string;
  caption?: string;
}

interface DemoMediaCardProps extends BaseMediaCardProps {
  type: 'demo';
  demoType: DemoType;
  src?: string;
  height?: number;
}

interface InteractiveMediaCardProps extends BaseMediaCardProps {
  type: 'interactive';
  demoType: DemoType;
  src?: string;
  height?: number;
}

type MediaCardProps = VideoMediaCardProps | DemoMediaCardProps | InteractiveMediaCardProps;

export default function MediaCard(props: MediaCardProps) {
  const { title, description, type, badge } = props;

  const renderBadge = () => {
    if (!badge) return null;

    let badgeClass = 't-blue';
    if (badge.toLowerCase().includes('demo') || badge.toLowerCase().includes('演示')) {
      badgeClass = 't-purple';
    } else if (badge.toLowerCase().includes('视频') || badge.toLowerCase().includes('video')) {
      badgeClass = 't-green';
    } else if (badge.toLowerCase().includes('实验') || badge.toLowerCase().includes('lab')) {
      badgeClass = 't-orange';
    }

    return <span className={`tag ${badgeClass}`}>{badge}</span>;
  };

  const renderHeader = () => (
    <div className="media-card-header">
      {badge && renderBadge()}
      {title && <h4 className="media-card-title">{title}</h4>}
      {description && <p className="media-card-description">{description}</p>}
    </div>
  );

  const renderContent = () => {
    switch (type) {
      case 'video':
        return (
          <VideoEmbed
            provider={props.provider}
            videoId={props.videoId}
            caption={props.caption}
            title={title}
          />
        );
      case 'demo':
      case 'interactive':
        return (
          <DemoEmbed
            type={props.demoType}
            src={props.src}
            title={title}
            description={description}
            height={props.height}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="media-card">
      {renderHeader()}
      {renderContent()}

      <style>{`
        .media-card {
          margin: 24px 0;
          border: 1px solid var(--border, rgba(27, 29, 34, 0.12));
          border-radius: var(--radius, 18px);
          background: var(--surface, #ffffff);
          overflow: hidden;
          box-shadow: 0 8px 30px rgba(27, 29, 34, 0.04);
        }

        .media-card-header {
          padding: 18px 20px 14px;
          border-bottom: 1px solid var(--border, rgba(27, 29, 34, 0.08));
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.8),
            rgba(255, 255, 255, 0.4)
          );
        }

        .media-card-title {
          margin: 8px 0 4px;
          font-size: 15px;
          font-weight: 700;
          color: var(--text, #1b1d22);
          line-height: 1.35;
        }

        .media-card-description {
          margin: 0;
          font-size: 13px;
          color: var(--text-2, #5f6673);
          line-height: 1.6;
        }

        .tag {
          display: inline-block;
          padding: 4px 11px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 4px;
        }

        .t-blue {
          background: rgba(15, 111, 255, 0.09);
          color: var(--accent, #0f6fff);
        }

        .t-green {
          background: rgba(31, 157, 85, 0.09);
          color: var(--green, #1f9d55);
        }

        .t-orange {
          background: rgba(217, 119, 6, 0.09);
          color: var(--orange, #d97706);
        }

        .t-purple {
          background: rgba(131, 71, 255, 0.09);
          color: var(--accent-2, #8347ff);
        }

        .t-gray {
          background: rgba(122, 129, 143, 0.09);
          color: var(--text-3, #7a818f);
        }
      `}</style>
    </div>
  );
}
