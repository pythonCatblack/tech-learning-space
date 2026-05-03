import { useEffect, useState } from 'react';
import type { ProgressData } from '../lib/progress';
import {
  getProgress,
  getCourseProgressPercentage,
  getCompletedChapters,
  getAllQuizScores,
  getLastAccessed,
  formatLastAccessed,
} from '../lib/progress';

interface ChapterInfo {
  id: string;
  label: string;
}

interface Props {
  courseSlug: string;
  totalChapters: number;
  chapters: ChapterInfo[];
  currentChapterId?: string;
  showDetails?: boolean;
}

export default function EnhancedProgressWidget({
  courseSlug,
  totalChapters,
  chapters,
  currentChapterId,
  showDetails = true,
}: Props) {
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [quizScores, setQuizScores] = useState<Record<string, number>>({});

  useEffect(() => {
    const syncProgress = () => {
      setProgressData(getProgress(courseSlug));
      setQuizScores(getAllQuizScores(courseSlug));
    };

    syncProgress();

    const onProgressUpdate = () => syncProgress();
    const onStorage = () => syncProgress();

    window.addEventListener('chip-progress:updated', onProgressUpdate);
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('chip-progress:updated', onProgressUpdate);
      window.removeEventListener('storage', onStorage);
    };
  }, [courseSlug]);

  const completedChapters = progressData?.completedChapters ?? [];
  const completedSet = new Set(completedChapters);
  const overallProgress = getCourseProgressPercentage(courseSlug, totalChapters);
  const lastAccessed = progressData?.lastAccessed
    ? formatLastAccessed(progressData.lastAccessed)
    : '从未访问';

  // Calculate time spent based on completed chapters (estimated)
  const estimatedMinutesPerChapter = 40;
  const totalEstimatedMinutes = completedChapters.length * estimatedMinutesPerChapter;
  const timeSpentDisplay =
    totalEstimatedMinutes >= 60
      ? `${Math.floor(totalEstimatedMinutes / 60)} 小时 ${totalEstimatedMinutes % 60} 分钟`
      : `${totalEstimatedMinutes} 分钟`;

  // Find next incomplete chapter
  const nextChapter = chapters.find((ch) => !completedSet.has(ch.id));

  // Calculate quiz statistics
  const quizScoreValues = Object.values(quizScores);
  const averageQuizScore =
    quizScoreValues.length > 0
      ? Math.round(quizScoreValues.reduce((a, b) => a + b, 0) / quizScoreValues.length)
      : null;

  // Group chapters by completion status
  const completedChapterList = chapters.filter((ch) => completedSet.has(ch.id));
  const incompleteChapterList = chapters.filter((ch) => !completedSet.has(ch.id));

  return (
    <div className="enhanced-progress-widget" aria-label="详细学习进度">
      {/* Overall Progress Section */}
      <div className="epw-section epw-overall">
        <div className="epw-header">
          <h3 className="epw-title">学习进度</h3>
          <span className="epw-last-accessed">上次: {lastAccessed}</span>
        </div>
        <div className="epw-progress-ring">
          <svg viewBox="0 0 100 100" className="epw-ring-svg">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--epw-track-color, #e5e7eb)"
              strokeWidth="8"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--epw-fill-color, #3b82f6)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${overallProgress * 2.83} 283`}
              transform="rotate(-90 50 50)"
            />
          </svg>
          <div className="epw-ring-content">
            <span className="epw-ring-percent">{overallProgress}%</span>
            <span className="epw-ring-label">完成</span>
          </div>
        </div>
        <div className="epw-stats-row">
          <div className="epw-stat">
            <span className="epw-stat-value">{completedChapters.length}</span>
            <span className="epw-stat-label">已完成章节</span>
          </div>
          <div className="epw-stat">
            <span className="epw-stat-value">{totalChapters - completedChapters.length}</span>
            <span className="epw-stat-label">剩余章节</span>
          </div>
          <div className="epw-stat">
            <span className="epw-stat-value">{timeSpentDisplay}</span>
            <span className="epw-stat-label">预计学习</span>
          </div>
        </div>
      </div>

      {/* Quiz Performance Section */}
      {quizScoreValues.length > 0 && (
        <div className="epw-section epw-quiz">
          <h4 className="epw-section-title">测验表现</h4>
          <div className="epw-quiz-stats">
            <div className="epw-quiz-avg">
              <span className="epw-quiz-avg-value">{averageQuizScore}%</span>
              <span className="epw-quiz-avg-label">平均分</span>
            </div>
            <div className="epw-quiz-history">
              {chapters.map((chapter) => {
                const score = quizScores[chapter.id];
                if (score === undefined) return null;
                return (
                  <div key={chapter.id} className="epw-quiz-item">
                    <span className="epw-quiz-item-label" title={chapter.label}>
                      {chapter.label.length > 8 ? `${chapter.label.slice(0, 8)}...` : chapter.label}
                    </span>
                    <span
                      className={`epw-quiz-item-score ${score >= 80 ? 'good' : score >= 60 ? 'ok' : 'low'}`}
                    >
                      {score}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Chapter Details Section */}
      {showDetails && (
        <div className="epw-section epw-chapters">
          <h4 className="epw-section-title">章节进度</h4>
          <div className="epw-chapter-list">
            {chapters.map((chapter, index) => {
              const isComplete = completedSet.has(chapter.id);
              const isCurrent = chapter.id === currentChapterId;
              const score = quizScores[chapter.id];
              return (
                <div
                  key={chapter.id}
                  className={`epw-chapter-item ${isComplete ? 'complete' : ''} ${isCurrent ? 'current' : ''}`}
                >
                  <div className="epw-chapter-status">
                    <span className={`epw-chapter-icon ${isComplete ? 'check' : ''}`}>
                      {isComplete ? '✓' : index + 1}
                    </span>
                  </div>
                  <div className="epw-chapter-info">
                    <span className="epw-chapter-name">{chapter.label}</span>
                    {score !== undefined && (
                      <span className="epw-chapter-score">测验: {score}%</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Section */}
      {nextChapter && (
        <div className="epw-section epw-action">
          <a className="epw-cta" href={`/course/${courseSlug}/chapter/${nextChapter.id}/`}>
            <span className="epw-cta-label">继续学习</span>
            <span className="epw-cta-chapter">{nextChapter.label}</span>
          </a>
        </div>
      )}

      {/* Progress Summary by Group */}
      <div className="epw-section epw-summary">
        <div className="epw-summary-item">
          <span className="epw-summary-label">已完成</span>
          <div className="epw-summary-chapters">
            {completedChapterList.length > 0
              ? completedChapterList.map((ch) => ch.label).join(', ')
              : '暂无'}
          </div>
        </div>
        {incompleteChapterList.length > 0 && (
          <div className="epw-summary-item">
            <span className="epw-summary-label">待完成</span>
            <div className="epw-summary-chapters">
              {incompleteChapterList.map((ch) => ch.label).join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
