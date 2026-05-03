/**
 * Progress persistence utilities for chip tutorial
 * Provides localStorage-based tracking of chapter completion, quiz scores, and reading positions
 */

export interface ProgressData {
  completedChapters: string[];
  quizScores: Record<string, number>;
  lastAccessed: string;
  readingPosition: Record<string, number>;
}

const PROGRESS_STORAGE_PREFIX = 'chip-tutorial-progress:';

const defaultProgressData: ProgressData = {
  completedChapters: [],
  quizScores: {},
  lastAccessed: new Date().toISOString(),
  readingPosition: {},
};

/**
 * Get the storage key for a specific course
 */
function getStorageKey(courseSlug: string): string {
  return `${PROGRESS_STORAGE_PREFIX}${courseSlug}`;
}

/**
 * Read progress data from localStorage
 */
function readProgressData(courseSlug: string): ProgressData {
  if (typeof window === 'undefined') {
    return { ...defaultProgressData };
  }

  try {
    const raw = window.localStorage.getItem(getStorageKey(courseSlug));
    if (!raw) {
      return { ...defaultProgressData };
    }
    const parsed = JSON.parse(raw);
    return {
      completedChapters: Array.isArray(parsed.completedChapters)
        ? parsed.completedChapters.filter((v: unknown) => typeof v === 'string')
        : [],
      quizScores:
        parsed.quizScores && typeof parsed.quizScores === 'object' ? parsed.quizScores : {},
      lastAccessed: parsed.lastAccessed || new Date().toISOString(),
      readingPosition:
        parsed.readingPosition && typeof parsed.readingPosition === 'object'
          ? parsed.readingPosition
          : {},
    };
  } catch {
    return { ...defaultProgressData };
  }
}

/**
 * Write progress data to localStorage and dispatch update event
 */
function writeProgressData(courseSlug: string, data: ProgressData): void {
  if (typeof window === 'undefined') {
    return;
  }

  data.lastAccessed = new Date().toISOString();
  window.localStorage.setItem(getStorageKey(courseSlug), JSON.stringify(data));
  window.dispatchEvent(new Event('chip-progress:updated'));
}

/**
 * Get the full progress data for a course
 */
export function getProgress(courseSlug: string): ProgressData {
  return readProgressData(courseSlug);
}

/**
 * Mark a chapter as complete
 */
export function setChapterComplete(courseSlug: string, chapterId: string): void {
  const data = readProgressData(courseSlug);
  if (!data.completedChapters.includes(chapterId)) {
    data.completedChapters.push(chapterId);
    writeProgressData(courseSlug, data);
  }
}

/**
 * Set quiz score for a chapter
 */
export function setQuizScore(courseSlug: string, chapterId: string, score: number): void {
  const data = readProgressData(courseSlug);
  data.quizScores[chapterId] = score;
  writeProgressData(courseSlug, data);
}

/**
 * Set reading position (scroll percentage) for a chapter
 */
export function setReadingPosition(courseSlug: string, chapterId: string, position: number): void {
  const data = readProgressData(courseSlug);
  data.readingPosition[chapterId] = Math.min(100, Math.max(0, position));
  writeProgressData(courseSlug, data);
}

/**
 * Get reading position for a chapter
 */
export function getReadingPosition(courseSlug: string, chapterId: string): number {
  const data = readProgressData(courseSlug);
  return data.readingPosition[chapterId] ?? 0;
}

/**
 * Clear all progress data for a course
 */
export function clearProgress(courseSlug: string): void {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(getStorageKey(courseSlug));
  window.dispatchEvent(new Event('chip-progress:updated'));
}

/**
 * Check if a chapter is completed
 */
export function isChapterComplete(courseSlug: string, chapterId: string): boolean {
  const data = readProgressData(courseSlug);
  return data.completedChapters.includes(chapterId);
}

/**
 * Get quiz score for a chapter
 */
export function getQuizScore(courseSlug: string, chapterId: string): number | undefined {
  const data = readProgressData(courseSlug);
  return data.quizScores[chapterId];
}

/**
 * Get all quiz scores for a course
 */
export function getAllQuizScores(courseSlug: string): Record<string, number> {
  const data = readProgressData(courseSlug);
  return { ...data.quizScores };
}

/**
 * Get completed chapters for a course
 */
export function getCompletedChapters(courseSlug: string): string[] {
  const data = readProgressData(courseSlug);
  return [...data.completedChapters];
}

/**
 * Calculate overall course progress percentage
 */
export function getCourseProgressPercentage(courseSlug: string, totalChapters: number): number {
  if (totalChapters === 0) return 0;
  const data = readProgressData(courseSlug);
  return Math.round((data.completedChapters.length / totalChapters) * 100);
}

/**
 * Get last accessed timestamp
 */
export function getLastAccessed(courseSlug: string): string | null {
  const data = readProgressData(courseSlug);
  return data.lastAccessed;
}

/**
 * Format a timestamp for display
 */
export function formatLastAccessed(isoTimestamp: string | null): string {
  if (!isoTimestamp) return '从未访问';
  const date = new Date(isoTimestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN');
}
