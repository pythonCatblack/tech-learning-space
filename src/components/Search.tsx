import { useState, useEffect, useCallback, useRef } from 'react';
import type { SearchIndex, SearchCourse, SearchChapter, SearchSection } from '../lib/search-index';

interface SearchResult {
  course: SearchCourse;
  chapter: SearchChapter;
  section?: SearchSection;
  matchType: 'title' | 'heading' | 'content';
  snippet: string;
  score: number;
}

const DEBOUNCE_MS = 150;
const MAX_RESULTS = 20;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;

  const escaped = escapeRegex(query);
  const regex = new RegExp(`(${escaped})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

function fuzzyMatch(text: string, query: string): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // Exact substring match
  if (lowerText.includes(lowerQuery)) {
    return 1;
  }

  // Word-based fuzzy matching
  const queryWords = lowerQuery.split(/\s+/).filter(Boolean);
  const textWords = lowerText.split(/\s+/).filter(Boolean);

  if (queryWords.length === 0) return 0;

  let matchCount = 0;
  for (const qWord of queryWords) {
    let found = false;
    for (const tWord of textWords) {
      if (tWord.includes(qWord) || qWord.includes(tWord)) {
        found = true;
        // Partial match
        if (tWord.startsWith(qWord) || qWord.startsWith(tWord)) {
          matchCount += 0.8;
        } else {
          matchCount += 0.5;
        }
      }
    }
    if (!found && queryWords.length === 1) {
      // Single word typo tolerance - character by character match
      let queryIdx = 0;
      for (let i = 0; i < lowerText.length && queryIdx < lowerQuery.length; i++) {
        if (lowerText[i] === lowerQuery[queryIdx]) {
          queryIdx++;
        }
      }
      if (queryIdx === lowerQuery.length) {
        matchCount += 0.3;
      }
    }
  }

  return matchCount / Math.max(queryWords.length, 1);
}

function performSearch(index: SearchIndex, query: string): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  for (const course of index.courses) {
    for (const chapter of course.chapters) {
      // Match against chapter title
      const titleScore = fuzzyMatch(chapter.title, query);
      if (titleScore > 0) {
        results.push({
          course,
          chapter,
          matchType: 'title',
          snippet: chapter.title,
          score: titleScore * 100 + 50, // Title matches get a bonus
        });
      }

      // Match against sections
      for (const section of chapter.sections) {
        let bestScore = 0;
        let bestSnippet = '';
        let bestMatchType: 'heading' | 'content' = 'content';

        // Heading match
        if (section.heading) {
          const headingScore = fuzzyMatch(section.heading, query);
          if (headingScore > bestScore) {
            bestScore = headingScore;
            bestSnippet = section.heading;
            bestMatchType = 'heading';
          }
        }

        // Content match
        if (section.content) {
          const contentScore = fuzzyMatch(section.content, query);
          if (contentScore > 0 && contentScore >= bestScore * 0.7) {
            // Content is weighted lower than heading
            bestScore = Math.max(contentScore * 0.8, bestScore);
            if (contentScore >= bestScore) {
              bestSnippet = section.content;
              bestMatchType = 'content';
            }
          }
        }

        if (bestScore > 0) {
          results.push({
            course,
            chapter,
            section,
            matchType: bestMatchType,
            snippet: bestSnippet || section.heading || '',
            score: bestScore * 100,
          });
        }
      }
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, MAX_RESULTS);
}

function groupResultsByCourse(results: SearchResult[]): Map<string, SearchResult[]> {
  const grouped = new Map<string, SearchResult[]>();

  for (const result of results) {
    const courseSlug = result.course.slug;
    if (!grouped.has(courseSlug)) {
      grouped.set(courseSlug, []);
    }
    grouped.get(courseSlug)!.push(result);
  }

  return grouped;
}

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchIndex, setSearchIndex] = useState<SearchIndex | null>(null);
  const [indexLoading, setIndexLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load search index when modal opens
  useEffect(() => {
    if (isOpen && !searchIndex && !indexLoading) {
      setIndexLoading(true);
      fetch('/search-index.json')
        .then((res) => res.json())
        .then((data: SearchIndex) => {
          setSearchIndex(data);
          setIndexLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load search index:', err);
          setIndexLoading(false);
        });
    }
  }, [isOpen, searchIndex, indexLoading]);

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }

      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        setQuery('');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (searchIndex) {
        const searchResults = performSearch(searchIndex, query);
        setResults(searchResults);
        setSelectedIndex(0);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchIndex]);

  // Navigate to result
  const navigateToResult = useCallback((result: SearchResult) => {
    const url = result.section
      ? `/course/${result.course.slug}/chapter/${result.chapter.id}/#${result.section.anchor}`
      : `/course/${result.course.slug}/chapter/${result.chapter.id}/`;

    window.location.href = url;
    setIsOpen(false);
    setQuery('');
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && results.length > 0) {
        e.preventDefault();
        navigateToResult(results[selectedIndex]);
      }
    },
    [results, selectedIndex, navigateToResult]
  );

  const groupedResults = groupResultsByCourse(results);
  let flatIndex = 0;

  const getCourseIcon = (slug: string) => {
    switch (slug) {
      case 'chip':
        return '⚡';
      case 'sensor-fusion':
        return '📡';
      case 'ai-dev-lifecycle':
        return '🔄';
      case 'ai-3d-manufacturing':
        return '🏭';
      default:
        return '📚';
    }
  };

  if (!isOpen) {
    return (
      <button
        className="search-trigger"
        onClick={() => setIsOpen(true)}
        aria-label="打开搜索 (Ctrl+K)"
        title="搜索 (Ctrl+K)"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <span className="search-trigger-text">搜索</span>
        <kbd className="search-trigger-kbd">⌘K</kbd>
      </button>
    );
  }

  return (
    <div className="search-modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="search-modal" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <svg
            className="search-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="搜索课程内容..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="search-close"
            onClick={() => {
              setIsOpen(false);
              setQuery('');
            }}
          >
            <kbd>Esc</kbd>
          </button>
        </div>

        <div className="search-results">
          {indexLoading && (
            <div className="search-empty">
              <p>加载搜索索引...</p>
            </div>
          )}

          {!indexLoading && query.trim() === '' && (
            <div className="search-empty">
              <p>输入关键词搜索课程内容</p>
              <div className="search-tips">
                <span>支持模糊匹配</span>
                <span>标题 &gt; 章节 &gt; 内容</span>
              </div>
            </div>
          )}

          {!indexLoading && query.trim() !== '' && results.length === 0 && (
            <div className="search-empty">
              <p>未找到相关结果</p>
              <p className="search-empty-hint">尝试使用不同的关键词</p>
            </div>
          )}

          {!indexLoading &&
            Array.from(groupedResults.entries()).map(([, courseResults]) => {
              const course = courseResults[0].course;
              const courseStartIndex = flatIndex;

              return (
                <div key={course.slug} className="search-course-group">
                  <div className="search-course-title">
                    <span className="search-course-icon">{getCourseIcon(course.slug)}</span>
                    {course.title}
                  </div>
                  {courseResults.map((result) => {
                    const currentIndex = courseStartIndex + courseResults.indexOf(result);
                    const isSelected = currentIndex === selectedIndex;

                    return (
                      <button
                        key={`${result.chapter.id}-${result.section?.anchor || 'main'}`}
                        className={`search-result ${isSelected ? 'selected' : ''}`}
                        onClick={() => navigateToResult(result)}
                        onMouseEnter={() => setSelectedIndex(currentIndex)}
                      >
                        <div className="search-result-header">
                          <span className="search-result-chapter">第{result.chapter.id}章</span>
                          <span
                            className="search-result-title"
                            dangerouslySetInnerHTML={{
                              __html: highlightText(result.chapter.title, query),
                            }}
                          />
                          {result.section && (
                            <span
                              className="search-result-section"
                              dangerouslySetInnerHTML={{
                                __html: ` › ${highlightText(result.section.heading, query)}`,
                              }}
                            />
                          )}
                        </div>
                        {result.section && result.matchType === 'content' && (
                          <div
                            className="search-result-snippet"
                            dangerouslySetInnerHTML={{
                              __html: `...${highlightText(result.snippet.slice(0, 120), query)}...`,
                            }}
                          />
                        )}
                        <div className="search-result-meta">
                          <span
                            className={`search-result-type search-result-type-${result.matchType}`}
                          >
                            {result.matchType === 'title'
                              ? '标题'
                              : result.matchType === 'heading'
                                ? '章节'
                                : '内容'}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {(() => {
                    flatIndex += courseResults.length;
                    return null;
                  })()}
                </div>
              );
            })}
        </div>

        <div className="search-footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> 导航
          </span>
          <span>
            <kbd>Enter</kbd> 跳转
          </span>
          <span>
            <kbd>Esc</kbd> 关闭
          </span>
        </div>
      </div>
    </div>
  );
}
