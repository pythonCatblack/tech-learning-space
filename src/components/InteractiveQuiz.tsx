import { useState, useEffect, useCallback } from 'react';

// ===== Types =====
interface QuizOption {
  label: string;
  text: string;
}

interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
  explanation: string;
}

interface ParsedQuiz {
  title: string;
  questions: QuizQuestion[];
  allAnswers: Record<number, string>; // questionId -> correct option label
  allExplanations: Record<number, string>; // questionId -> explanation
}

interface QuizState {
  currentQuestionIndex: number;
  selectedAnswers: Record<number, string>;
  showExplanation: boolean;
  isComplete: boolean;
}

// ===== HTML Parser =====
function parseQuizHTML(html: string): ParsedQuiz | null {
  // Try to find the quiz card
  const yellowCardMatch = html.match(
    /<div class="card yellow">([\s\S]*?)(?:<details class="quiz-answer">|$)/
  );
  if (!yellowCardMatch) {
    return null;
  }

  const cardContent = yellowCardMatch[1];

  // Extract title
  const titleMatch = cardContent.match(/<h3>([^<]*)<\/h3>/);
  const title = titleMatch ? titleMatch[1].trim() : '课后测验';

  // Find all questions with their options
  // Pattern: <strong>N. question text</strong><br />A. option1<br />B. option2<br />C. option3<br />D. option4
  const questionBlocks: string[] = [];
  const questionRegex =
    /<strong>(\d+)\.\s*([^<]+)<\/strong>\s*<br\s*\/?>([\s\S]*?)(?=<strong>\d+\.\s*|$)/g;

  let qMatch;
  while ((qMatch = questionRegex.exec(cardContent)) !== null) {
    questionBlocks.push(qMatch[0]);
  }

  const questions: QuizQuestion[] = [];
  const allAnswers: Record<number, string> = {};
  const allExplanations: Record<number, string> = {};

  for (const block of questionBlocks) {
    // Extract question number and text
    const numMatch = block.match(/<strong>(\d+)\.\s*([^<]+)/);
    if (!numMatch) continue;

    const qId = parseInt(numMatch[1], 10);
    const qText = numMatch[2].replace(/<br\s*\/?>/g, ' ').trim();

    // Extract options - look for A. B. C. D. patterns after the strong tag
    const afterStrong = block.replace(/<strong>\d+\.\s*[^<]+<\/strong>\s*<br\s*\/?>/, '');
    const optionLines: QuizOption[] = [];
    const optPattern = /([A-D])\.\s*([^<]+?)(?=[A-D]\.|$)/g;
    let optMatch;
    while ((optMatch = optPattern.exec(afterStrong)) !== null) {
      optionLines.push({
        label: optMatch[1],
        text: optMatch[2].replace(/<[^>]+>/g, '').trim(),
      });
    }

    if (optionLines.length === 4) {
      questions.push({
        id: qId,
        text: qText,
        options: optionLines,
        explanation: '',
      });
    }
  }

  // Parse answers and explanations from the quiz-answer section
  const answerSectionMatch = html.match(/<details class="quiz-answer">([\s\S]*?)<\/details>/);
  if (answerSectionMatch) {
    const answerContent = answerSectionMatch[1];

    // Parse answer string
    const answerStrMatch = answerContent.match(/答案：([^<]+)/);
    if (answerStrMatch) {
      const answerStr = answerStrMatch[1];
      const answerPairs = answerStr.match(/(\d+)\.([A-D])/g);
      if (answerPairs) {
        for (const pair of answerPairs) {
          const parts = pair.match(/(\d+)\.([A-D])/);
          if (parts) {
            allAnswers[parseInt(parts[1], 10)] = parts[2];
          }
        }
      }
    }

    // Parse explanation list
    const liMatches = answerContent.match(/<li>([\s\S]*?)<\/li>/g);
    if (liMatches) {
      let idx = 0;
      for (const liMatch of liMatches) {
        const contentMatch = liMatch.match(/<li>([\s\S]*?)<\/li>/);
        if (contentMatch && questions[idx]) {
          allExplanations[questions[idx].id] = contentMatch[1].replace(/<[^>]+>/g, '').trim();
          idx++;
        }
      }
    }
  }

  if (questions.length === 0) {
    return null;
  }

  return { title, questions, allAnswers, allExplanations };
}

// ===== Styles =====
const styles = `
.interactive-quiz {
  margin: 24px 0;
  font-family: var(--font, inherit);
}

.quiz-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: linear-gradient(135deg, rgba(15, 111, 255, 0.08), rgba(131, 71, 255, 0.06));
  border-radius: 12px;
  border: 1px solid rgba(15, 111, 255, 0.12);
}

.quiz-progress-text {
  font-size: 13px;
  font-weight: 600;
  color: var(--accent, #0f6fff);
  white-space: nowrap;
}

.quiz-progress-bar {
  flex: 1;
  height: 8px;
  background: rgba(27, 29, 34, 0.08);
  border-radius: 999px;
  overflow: hidden;
}

.quiz-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent, #0f6fff), var(--accent-2, #8347ff));
  border-radius: inherit;
  transition: width 0.3s ease;
}

.quiz-question-card {
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, rgba(27, 29, 34, 0.12));
  border-radius: var(--radius, 18px);
  padding: 24px;
  box-shadow: 0 8px 30px rgba(27, 29, 34, 0.04);
  animation: quizFadeIn 0.3s ease;
}

@keyframes quizFadeIn {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quiz-question-number {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--accent, #0f6fff);
  margin-bottom: 12px;
}

.quiz-question-text {
  font-size: 1.05rem;
  line-height: 1.6;
  color: var(--text, #1b1d22);
  margin-bottom: 20px;
  font-weight: 500;
}

.quiz-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quiz-option-btn {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: var(--surface-2, #f6f2ea);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text, #1b1d22);
}

.quiz-option-btn:hover:not(:disabled) {
  background: rgba(15, 111, 255, 0.06);
  border-color: rgba(15, 111, 255, 0.2);
  transform: translateX(2px);
}

.quiz-option-btn:disabled {
  cursor: default;
}

.quiz-option-btn.selected {
  border-color: var(--accent, #0f6fff);
  background: rgba(15, 111, 255, 0.08);
}

.quiz-option-btn.correct {
  border-color: var(--green, #1f9d55);
  background: rgba(31, 157, 85, 0.12);
}

.quiz-option-btn.incorrect {
  border-color: var(--red, #d63a3a);
  background: rgba(214, 58, 58, 0.08);
}

.quiz-option-btn.show-correct {
  border-color: var(--green, #1f9d55);
  background: rgba(31, 157, 85, 0.08);
}

.quiz-option-label {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  font-weight: 700;
  font-size: 13px;
  background: rgba(15, 111, 255, 0.1);
  color: var(--accent, #0f6fff);
  transition: all 0.2s ease;
}

.quiz-option-btn.correct .quiz-option-label {
  background: var(--green, #1f9d55);
  color: white;
}

.quiz-option-btn.incorrect .quiz-option-label {
  background: var(--red, #d63a3a);
  color: white;
}

.quiz-option-btn.show-correct .quiz-option-label {
  background: var(--green, #1f9d55);
  color: white;
}

.quiz-option-text {
  flex: 1;
  padding-top: 2px;
}

.quiz-feedback {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.6;
  animation: feedbackSlideIn 0.3s ease;
}

@keyframes feedbackSlideIn {
  from {
    opacity: 0;
    transform: scale(0.98);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.quiz-feedback.correct {
  background: rgba(31, 157, 85, 0.1);
  border: 1px solid rgba(31, 157, 85, 0.2);
  color: var(--green, #1f9d55);
}

.quiz-feedback.incorrect {
  background: rgba(214, 58, 58, 0.08);
  border: 1px solid rgba(214, 58, 58, 0.15);
  color: var(--red, #d63a3a);
}

.quiz-feedback-icon {
  font-size: 16px;
  margin-right: 8px;
}

.quiz-explanation-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  padding: 10px 14px;
  background: rgba(217, 119, 6, 0.08);
  border: 1px solid rgba(217, 119, 6, 0.15);
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: var(--orange, #d97706);
  transition: all 0.2s ease;
}

.quiz-explanation-toggle:hover {
  background: rgba(217, 119, 6, 0.12);
}

.quiz-explanation-toggle-icon {
  transition: transform 0.2s ease;
}

.quiz-explanation-toggle.open .quiz-explanation-toggle-icon {
  transform: rotate(180deg);
}

.quiz-explanation-content {
  margin-top: 12px;
  padding: 16px;
  background: #fef3c7;
  border-radius: 10px;
  font-size: 14px;
  line-height: 1.7;
  color: #92400e;
  animation: explanationExpand 0.3s ease;
}

@keyframes explanationExpand {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.quiz-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--border, rgba(27, 29, 34, 0.12));
}

.quiz-nav-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.quiz-nav-btn.prev {
  background: rgba(27, 29, 34, 0.04);
  color: var(--text-2, #5f6673);
}

.quiz-nav-btn.prev:hover:not(:disabled) {
  background: rgba(27, 29, 34, 0.08);
}

.quiz-nav-btn.next {
  background: linear-gradient(135deg, var(--accent, #0f6fff), var(--accent-2, #8347ff));
  color: white;
  box-shadow: 0 8px 20px rgba(15, 111, 255, 0.22);
}

.quiz-nav-btn.next:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(15, 111, 255, 0.28);
}

.quiz-nav-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Results Screen */
.quiz-results {
  background: var(--surface, #ffffff);
  border: 1px solid var(--border, rgba(27, 29, 34, 0.12));
  border-radius: var(--radius, 18px);
  padding: 32px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(27, 29, 34, 0.04);
  animation: quizFadeIn 0.4s ease;
}

.quiz-results-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.quiz-results-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text, #1b1d22);
  margin-bottom: 8px;
}

.quiz-results-score {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--accent, #0f6fff), var(--accent-2, #8347ff));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 16px 0;
}

.quiz-results-label {
  font-size: 14px;
  color: var(--text-3, #7a818f);
  margin-bottom: 24px;
}

.quiz-results-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.quiz-stat {
  padding: 16px 12px;
  background: var(--surface-2, #f6f2ea);
  border-radius: 12px;
  text-align: center;
}

.quiz-stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text, #1b1d22);
}

.quiz-stat-value.correct {
  color: var(--green, #1f9d55);
}

.quiz-stat-value.incorrect {
  color: var(--red, #d63a3a);
}

.quiz-stat-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-3, #7a818f);
  margin-top: 4px;
}

.quiz-results-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.quiz-restart-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  background: linear-gradient(135deg, var(--accent, #0f6fff), var(--accent-2, #8347ff));
  color: white;
  border: none;
  box-shadow: 0 8px 20px rgba(15, 111, 255, 0.22);
}

.quiz-restart-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(15, 111, 255, 0.28);
}

/* Mobile Responsive */
@media (max-width: 600px) {
  .quiz-question-card {
    padding: 18px;
  }

  .quiz-question-text {
    font-size: 0.95rem;
  }

  .quiz-option-btn {
    padding: 12px 14px;
    font-size: 13px;
  }

  .quiz-results-stats {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .quiz-results-actions {
    flex-direction: column;
  }
}
`;

// ===== Sub-Components =====
function QuizProgress({
  current,
  total,
  answeredCount,
}: {
  current: number;
  total: number;
  answeredCount: number;
}) {
  const progress = total > 0 ? (answeredCount / total) * 100 : 0;

  return (
    <div className="quiz-progress">
      <span className="quiz-progress-text">
        {current}/{total}
      </span>
      <div className="quiz-progress-bar">
        <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}

function QuizOptionButton({
  option,
  isSelected,
  isCorrect,
  showResult,
  disabled,
  onClick,
}: {
  option: QuizOption;
  isSelected: boolean;
  isCorrect: boolean;
  showResult: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  let className = 'quiz-option-btn';
  if (showResult) {
    if (isCorrect) {
      className += ' correct';
    } else if (isSelected && !isCorrect) {
      className += ' incorrect';
    } else if (!isSelected && isCorrect) {
      className += ' show-correct';
    }
  } else if (isSelected) {
    className += ' selected';
  }

  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      <span className="quiz-option-label">{option.label}</span>
      <span className="quiz-option-text">{option.text}</span>
    </button>
  );
}

function QuizResults({
  quiz,
  state,
  onRestart,
}: {
  quiz: ParsedQuiz;
  state: QuizState;
  onRestart: () => void;
}) {
  const correctCount = Object.entries(state.selectedAnswers).filter(
    ([qId, answer]) => quiz.allAnswers[parseInt(qId, 10)] === answer
  ).length;
  const total = quiz.questions.length;
  const percentage = Math.round((correctCount / total) * 100);

  let icon = '🎉';
  let title = '优秀！';
  if (percentage < 60) {
    icon = '📚';
    title = '继续加油';
  } else if (percentage < 80) {
    icon = '👍';
    title = '做得不错';
  }

  return (
    <div className="quiz-results">
      <div className="quiz-results-icon">{icon}</div>
      <h3 className="quiz-results-title">{title}</h3>
      <div className="quiz-results-score">{percentage}%</div>
      <p className="quiz-results-label">
        您答对了 {correctCount}/{total} 题
      </p>

      <div className="quiz-results-stats">
        <div className="quiz-stat">
          <div className="quiz-stat-value correct">{correctCount}</div>
          <div className="quiz-stat-label">正确</div>
        </div>
        <div className="quiz-stat">
          <div className="quiz-stat-value incorrect">{total - correctCount}</div>
          <div className="quiz-stat-label">错误</div>
        </div>
        <div className="quiz-stat">
          <div className="quiz-stat-value">{total}</div>
          <div className="quiz-stat-label">总题数</div>
        </div>
      </div>

      <div className="quiz-results-actions">
        <button className="quiz-restart-btn" onClick={onRestart}>
          🔄 重新测验
        </button>
      </div>
    </div>
  );
}

// ===== Main Component =====
export default function InteractiveQuiz({ htmlContent }: { htmlContent: string }) {
  const [quiz, setQuiz] = useState<ParsedQuiz | null>(null);
  const [state, setState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: {},
    showExplanation: false,
    isComplete: false,
  });
  const [hasAnswered, setHasAnswered] = useState(false);

  // Parse quiz on mount
  useEffect(() => {
    const parsed = parseQuizHTML(htmlContent);
    if (parsed) {
      setQuiz(parsed);
    }
  }, [htmlContent]);

  const currentQuestion = quiz?.questions[state.currentQuestionIndex];
  const currentAnswer = currentQuestion ? quiz!.allAnswers[currentQuestion.id] : null;
  const selectedAnswer = currentQuestion ? state.selectedAnswers[currentQuestion.id] : null;
  const isCorrect = selectedAnswer === currentAnswer;
  const showResult = hasAnswered && !!selectedAnswer;
  const explanation = currentQuestion ? quiz!.allExplanations[currentQuestion.id] || '' : '';

  const handleSelectAnswer = useCallback(
    (optionLabel: string) => {
      if (!currentQuestion || hasAnswered) return;

      setState((prev) => ({
        ...prev,
        selectedAnswers: {
          ...prev.selectedAnswers,
          [currentQuestion.id]: optionLabel,
        },
      }));
      setHasAnswered(true);
    },
    [currentQuestion, hasAnswered]
  );

  const handleNext = useCallback(() => {
    if (!quiz) return;

    const nextIndex = state.currentQuestionIndex + 1;
    if (nextIndex >= quiz.questions.length) {
      setState((prev) => ({ ...prev, isComplete: true }));
    } else {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: nextIndex,
      }));
      setHasAnswered(false);
      setState((prev) => ({ ...prev, showExplanation: false }));
    }
  }, [quiz, state.currentQuestionIndex]);

  const handlePrev = useCallback(() => {
    if (state.currentQuestionIndex > 0) {
      setState((prev) => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1,
      }));
      setHasAnswered(false);
      setState((prev) => ({ ...prev, showExplanation: false }));
    }
  }, [state.currentQuestionIndex]);

  const handleRestart = useCallback(() => {
    setState({
      currentQuestionIndex: 0,
      selectedAnswers: {},
      showExplanation: false,
      isComplete: false,
    });
    setHasAnswered(false);
  }, []);

  const toggleExplanation = useCallback(() => {
    setState((prev) => ({ ...prev, showExplanation: !prev.showExplanation }));
  }, []);

  // Inject styles
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'interactive-quiz-styles';
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement('style');
        styleEl.id = styleId;
        styleEl.textContent = styles;
        document.head.appendChild(styleEl);
      }
    }
  }, []);

  if (!quiz) {
    return (
      <div className="interactive-quiz">
        <div className="quiz-question-card" style={{ textAlign: 'center', color: 'var(--text-3)' }}>
          加载测验中...
        </div>
      </div>
    );
  }

  if (state.isComplete) {
    return (
      <div className="interactive-quiz">
        <QuizResults quiz={quiz} state={state} onRestart={handleRestart} />
      </div>
    );
  }

  return (
    <div className="interactive-quiz">
      <QuizProgress
        current={state.currentQuestionIndex + 1}
        total={quiz.questions.length}
        answeredCount={Object.keys(state.selectedAnswers).length}
      />

      <div className="quiz-question-card" key={currentQuestion?.id}>
        <div className="quiz-question-number">题目 {state.currentQuestionIndex + 1}</div>
        <div className="quiz-question-text">{currentQuestion?.text}</div>

        <div className="quiz-options">
          {currentQuestion?.options.map((option) => (
            <QuizOptionButton
              key={option.label}
              option={option}
              isSelected={selectedAnswer === option.label}
              isCorrect={option.label === currentAnswer}
              showResult={showResult}
              disabled={hasAnswered}
              onClick={() => handleSelectAnswer(option.label)}
            />
          ))}
        </div>

        {showResult && (
          <>
            <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
              <span className="quiz-feedback-icon">{isCorrect ? '✓' : '✗'}</span>
              {isCorrect ? '回答正确！' : `回答错误。正确答案是 ${currentAnswer}。`}
            </div>

            {explanation && (
              <>
                <button
                  className={`quiz-explanation-toggle ${state.showExplanation ? 'open' : ''}`}
                  onClick={toggleExplanation}
                >
                  <span className="quiz-explanation-toggle-icon">▼</span>
                  查看解析
                </button>

                {state.showExplanation && (
                  <div className="quiz-explanation-content">{explanation}</div>
                )}
              </>
            )}
          </>
        )}

        <div className="quiz-navigation">
          <button
            className="quiz-nav-btn prev"
            onClick={handlePrev}
            disabled={state.currentQuestionIndex === 0}
          >
            ← 上一题
          </button>

          <button className="quiz-nav-btn next" onClick={handleNext} disabled={!hasAnswered}>
            {state.currentQuestionIndex === quiz.questions.length - 1 ? '查看结果 →' : '下一题 →'}
          </button>
        </div>
      </div>
    </div>
  );
}
