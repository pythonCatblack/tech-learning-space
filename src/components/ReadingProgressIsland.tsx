import { useEffect, useState } from 'react';

const STORAGE_KEY = 'chip-tutorial-completed-chapters';

interface Props {
  chapterId?: string;
  chapterTitle?: string;
  totalChapters: number;
  storageKey?: string;
  courseSlug: string;
  chapters: Array<{
    id: string;
    label: string;
  }>;
}

function readCompleted(storageKey: string): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(storageKey);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((value) => typeof value === 'string') : [];
  } catch {
    return [];
  }
}

function writeCompleted(storageKey: string, completed: string[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(completed));
  window.dispatchEvent(new Event('chip-progress:updated'));
}

export default function ReadingProgressIsland({
  chapterId,
  chapterTitle,
  totalChapters,
  storageKey = STORAGE_KEY,
  courseSlug,
  chapters,
}: Props) {
  const [completed, setCompleted] = useState<string[]>([]);

  const completedSet = new Set(completed);
  const currentIndex = chapterId ? chapters.findIndex((chapter) => chapter.id === chapterId) : -1;
  const nextSequentialChapter = currentIndex >= 0 ? chapters[currentIndex + 1] : undefined;
  const firstIncompleteChapter = chapters.find((chapter) => !completedSet.has(chapter.id));
  const resumeChapter = chapterId
    ? (nextSequentialChapter ?? chapters[0])
    : (firstIncompleteChapter ?? chapters[0]);
  const resumeHref = chapterId
    ? nextSequentialChapter
      ? `/course/${courseSlug}/chapter/${nextSequentialChapter.id}/`
      : `/course/${courseSlug}/`
    : `/course/${courseSlug}/chapter/${resumeChapter?.id ?? chapters[0]?.id}/`;
  const resumeLabel = chapterId
    ? nextSequentialChapter
      ? '下一章'
      : '返回课程首页'
    : firstIncompleteChapter
      ? '继续学习'
      : '重新复习';
  const resumeTitle = resumeChapter?.label ?? '课程总览';

  useEffect(() => {
    const syncCompleted = () => setCompleted(readCompleted(storageKey));

    const markCurrentChapter = () => {
      if (!chapterId) {
        return;
      }

      const updated = new Set(readCompleted(storageKey));
      if (!updated.has(chapterId)) {
        updated.add(chapterId);
        writeCompleted(storageKey, Array.from(updated));
      } else {
        syncCompleted();
      }
    };

    syncCompleted();

    const footer = document.querySelector('.nav-foot');
    let observer: IntersectionObserver | null = null;

    if (footer) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            markCurrentChapter();
          }
        },
        { threshold: 0.5 }
      );

      observer.observe(footer);
    } else {
      markCurrentChapter();
    }

    const onStorage = () => syncCompleted();
    const onProgressUpdate = () => syncCompleted();

    window.addEventListener('storage', onStorage);
    window.addEventListener('chip-progress:updated', onProgressUpdate);

    return () => {
      observer?.disconnect();
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('chip-progress:updated', onProgressUpdate);
    };
  }, [chapterId, storageKey]);

  const progress = totalChapters > 0 ? Math.round((completed.length / totalChapters) * 100) : 0;

  return (
    <div className="progress-widget" aria-label="学习进度">
      <div className="progress-widget-label">学习进度</div>
      <div className="progress-widget-row">
        <div className="progress-widget-track">
          <div className="progress-widget-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="progress-widget-percent">{progress}%</div>
      </div>
      <div className="progress-widget-meta">
        <span>
          {completed.length}/{totalChapters} 章节已完成
        </span>
        <span>{chapterTitle ? `当前：${chapterTitle}` : '教程总览'}</span>
      </div>
      <div className="progress-widget-action">
        <a className="progress-widget-cta" href={resumeHref}>
          <span>{resumeLabel}</span>
          <strong>{resumeTitle}</strong>
        </a>
        <div className="progress-widget-hint">
          {chapterId
            ? '阅读到页尾会自动更新完成状态。'
            : '从未完成的章节继续，进度会自动保存在本课程。'}
        </div>
      </div>
    </div>
  );
}
