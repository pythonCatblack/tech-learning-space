import { useState } from 'react';

type DemoType = 'simulator' | 'codepen' | 'jsfiddle' | 'replit' | 'local' | 'external';

interface DemoEmbedProps {
  type: DemoType;
  src?: string;
  title?: string;
  description?: string;
  height?: number;
}

function getEmbedSrc(type: DemoType, src?: string): string | null {
  if (!src) return null;

  switch (type) {
    case 'codepen':
      // Convert to embed URL format
      if (src.includes('codepen.io')) {
        return src.replace(/\/pen\//, '/embed/');
      }
      return `https://codepen.io/embed/${src}`;
    case 'jsfiddle':
      if (src.includes('jsfiddle.net')) {
        return `${src}/embedded/`;
      }
      return `https://jsfiddle.net/${src}/embedded/`;
    case 'replit':
      if (src.includes('replit.com')) {
        return src;
      }
      return `https://replit.com/@${src}`;
    case 'simulator':
    case 'external':
      return src;
    case 'local':
    default:
      return src;
  }
}

export default function DemoEmbed({
  type,
  src,
  title = '交互演示',
  description = '点击加载交互内容',
  height = 400,
}: DemoEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const embedSrc = getEmbedSrc(type, src);

  const handleLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  const handleError = () => {
    setHasError(true);
    setIsLoaded(false);
  };

  const handleClick = () => {
    if (!isLoaded && !hasError) {
      setIsLoaded(true);
    }
  };

  const renderPlaceholder = () => (
    <div className="demo-embed-placeholder" onClick={handleClick}>
      <div className="demo-embed-icon">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
          <path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 15l-7-7 1.41-1.41L12 15.17l5.59-5.58L19 11l-7 7z" />
        </svg>
      </div>
      <div className="demo-embed-title">{title}</div>
      <div className="demo-embed-desc">{description}</div>
      <div className="demo-embed-badge">
        <span className="demo-embed-badge-icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </span>
        即将推出
      </div>
    </div>
  );

  const renderIframe = () => (
    <div className="demo-embed-frame-wrapper">
      <iframe
        src={embedSrc || undefined}
        title={title}
        className="demo-embed-iframe"
        style={{ height }}
        allow="accelerometer; camera; encrypted-media; geolocation; gyroscope; microphone; midi"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );

  const renderError = () => (
    <div className="demo-embed-error">
      <div className="demo-embed-error-icon">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      </div>
      <div className="demo-embed-error-title">演示加载失败</div>
      <div className="demo-embed-error-desc">
        无法加载此交互演示，请稍后重试或访问{' '}
        <a href={embedSrc || '#'} target="_blank" rel="noopener noreferrer">
          原链接
        </a>
      </div>
      <button
        className="demo-embed-retry-btn"
        type="button"
        onClick={() => {
          setHasError(false);
          setIsLoaded(false);
        }}
      >
        重试
      </button>
    </div>
  );

  return (
    <div className="demo-embed-wrapper">
      {!isLoaded && !hasError && renderPlaceholder()}
      {isLoaded && renderIframe()}
      {hasError && renderError()}

      <style>{`
        .demo-embed-wrapper {
          margin: 24px 0;
          border-radius: var(--radius, 18px);
          overflow: hidden;
          border: 1px solid var(--border, rgba(27, 29, 34, 0.12));
          background: var(--surface, #ffffff);
        }

        .demo-embed-placeholder {
          padding: 48px 24px;
          text-align: center;
          cursor: pointer;
          transition: background 0.2s ease;
          background: linear-gradient(
            135deg,
            rgba(15, 111, 255, 0.03),
            rgba(131, 71, 255, 0.03)
          );
        }

        .demo-embed-placeholder:hover {
          background: linear-gradient(
            135deg,
            rgba(15, 111, 255, 0.06),
            rgba(131, 71, 255, 0.06)
          );
        }

        .demo-embed-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent, #0f6fff), var(--accent-2, #8347ff));
          color: white;
          margin-bottom: 16px;
        }

        .demo-embed-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text, #1b1d22);
          margin-bottom: 8px;
        }

        .demo-embed-desc {
          font-size: 14px;
          color: var(--text-2, #5f6673);
          margin-bottom: 16px;
        }

        .demo-embed-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 999px;
          background: rgba(31, 157, 85, 0.1);
          color: var(--green, #1f9d55);
          font-size: 12px;
          font-weight: 600;
        }

        .demo-embed-badge-icon {
          display: flex;
          align-items: center;
        }

        .demo-embed-frame-wrapper {
          background: var(--surface, #ffffff);
        }

        .demo-embed-iframe {
          width: 100%;
          border: none;
          display: block;
        }

        .demo-embed-error {
          padding: 48px 24px;
          text-align: center;
        }

        .demo-embed-error-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: rgba(214, 58, 58, 0.1);
          color: var(--red, #d63a3a);
          margin-bottom: 16px;
        }

        .demo-embed-error-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text, #1b1d22);
          margin-bottom: 8px;
        }

        .demo-embed-error-desc {
          font-size: 14px;
          color: var(--text-2, #5f6673);
          margin-bottom: 16px;
        }

        .demo-embed-error-desc a {
          color: var(--accent, #0f6fff);
          text-decoration: underline;
        }

        .demo-embed-retry-btn {
          padding: 10px 20px;
          border-radius: 999px;
          border: 1px solid var(--border, rgba(27, 29, 34, 0.12));
          background: var(--surface, #ffffff);
          color: var(--text, #1b1d22);
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .demo-embed-retry-btn:hover {
          background: var(--surface-2, #f6f2ea);
          border-color: var(--accent, #0f6fff);
        }
      `}</style>
    </div>
  );
}
