import { useEffect, useState, useCallback } from 'react';
import type { TocItem } from '../lib/toc';

interface TableOfContentsProps {
  items: TocItem[];
  className?: string;
}

function scrollToHeading(id: string) {
  const element = document.getElementById(id);
  if (element) {
    const offset = 80; // Account for fixed header if any
    const top = element.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

const MOBILE_BREAKPOINT = 1080;

export default function TableOfContents({ items, className = '' }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Build flat list of all IDs for tracking
  const allIds = items.flatMap((item) => [item.id, ...item.children.map((child) => child.id)]);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Set up intersection observer for active section tracking
  useEffect(() => {
    if (allIds.length === 0) return;

    const headingElements = allIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the topmost visible heading
        const visibleEntries = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => {
            const aTop = a.boundingClientRect.top;
            const bTop = b.boundingClientRect.top;
            return aTop - bTop;
          });

        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [allIds.join(',')]);

  const handleClick = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    scrollToHeading(id);
    setIsMobileOpen(false);
  }, []);

  if (items.length === 0) {
    return null;
  }

  // Mobile: Dropdown selector
  if (isMobile) {
    return (
      <div className={`toc-mobile ${className}`}>
        <button
          className="toc-mobile-toggle"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-expanded={isMobileOpen}
        >
          <span className="toc-mobile-toggle-icon">{isMobileOpen ? '▲' : '▼'}</span>
          <span>章节导航</span>
        </button>
        {isMobileOpen && (
          <div className="toc-mobile-dropdown">
            {items.map((item) => (
              <div key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`toc-link toc-h2 ${activeId === item.id ? 'active' : ''}`}
                  onClick={(e) => handleClick(e, item.id)}
                >
                  {item.text}
                </a>
                {item.children.map((child) => (
                  <a
                    key={child.id}
                    href={`#${child.id}`}
                    className={`toc-link toc-h3 ${activeId === child.id ? 'active' : ''}`}
                    onClick={(e) => handleClick(e, child.id)}
                  >
                    {child.text}
                  </a>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop: Fixed sidebar TOC
  return (
    <nav className={`toc-sidebar ${className}`} aria-label="Table of contents">
      <div className="toc-header">目录</div>
      <ul className="toc-list">
        {items.map((item) => (
          <li key={item.id} className="toc-item toc-item-h2">
            <a
              href={`#${item.id}`}
              className={`toc-link ${activeId === item.id ? 'active' : ''}`}
              onClick={(e) => handleClick(e, item.id)}
            >
              <span className="toc-indicator" />
              <span className="toc-text">{item.text}</span>
            </a>
            {item.children.length > 0 && (
              <ul className="toc-list toc-sublist">
                {item.children.map((child) => (
                  <li key={child.id} className="toc-item toc-item-h3">
                    <a
                      href={`#${child.id}`}
                      className={`toc-link ${activeId === child.id ? 'active' : ''}`}
                      onClick={(e) => handleClick(e, child.id)}
                    >
                      <span className="toc-indicator" />
                      <span className="toc-text">{child.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
