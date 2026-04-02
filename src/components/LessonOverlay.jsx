import { LESSONS } from "../gameConfig";

const LessonOverlay = ({
  phase,          // "intro" | "passed" | "failed"
  lessonId,
  difficulty,
  onStart,        // "intro" → dismiss and start
  onRetry,        // "failed" → retry
  onNext,         // "passed" → next lesson
  onMenu,         // any → back to menu
}) => {
  const lesson    = LESSONS.find((l) => l.id === lessonId);
  const lessonIdx = LESSONS.indexOf(lesson);
  const hint = difficulty === "easy" ? lesson?.easyHint : lesson?.controlsHint;

  if (phase === "intro") {
    return (
      <div className="overlay-bg overlay-fadein">
        <div className="overlay-card">
          <div className="overlay-icon">{lesson?.icon}</div>
          <p className="overlay-eyebrow">LESSON {lessonIdx + 1} OF {LESSONS.length}</p>
          <h2 className="overlay-title">{lesson?.title}</h2>
          <p className="overlay-desc">{lesson?.description}</p>
          <div className="overlay-hint">
            <span className="overlay-hint-label">💡 How to do it</span>
            <p>{hint}</p>
          </div>
          <div className="overlay-objective">
            <span>🎯 Objective</span>
            <p>{lesson?.objective}</p>
          </div>
          <div className="overlay-actions">
            <button className="overlay-btn overlay-btn--primary" onClick={onStart}>
              ▶ Start Lesson
            </button>
            <button className="overlay-btn overlay-btn--ghost" onClick={onMenu}>
              ← Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "passed") {
    const isLast = lessonIdx === LESSONS.length - 1;
    return (
      <div className="overlay-bg overlay-fadein">
        <div className="overlay-card overlay-card--pass">
          <div className="overlay-icon">🏆</div>
          <p className="overlay-eyebrow">LESSON COMPLETE</p>
          <h2 className="overlay-title overlay-title--pass">Well done!</h2>
          <p className="overlay-desc">You completed <strong>{lesson?.title}</strong>.</p>
          <div className="overlay-actions">
            {!isLast && (
              <button className="overlay-btn overlay-btn--primary" onClick={onNext}>
                Next Lesson →
              </button>
            )}
            {isLast && (
              <button className="overlay-btn overlay-btn--primary" onClick={onMenu}>
                🎉 Back to Menu
              </button>
            )}
            <button className="overlay-btn overlay-btn--ghost" onClick={onRetry}>
              ↺ Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "failed") {
    return (
      <div className="overlay-bg overlay-fadein">
        <div className="overlay-card overlay-card--fail">
          <div className="overlay-icon">❌</div>
          <p className="overlay-eyebrow">NOT QUITE</p>
          <h2 className="overlay-title overlay-title--fail">Try Again</h2>
          <p className="overlay-desc">Don't worry — review the hint below and try once more.</p>
          <div className="overlay-hint">
            <span className="overlay-hint-label">💡 Tip</span>
            <p>{hint}</p>
          </div>
          <div className="overlay-actions">
            <button className="overlay-btn overlay-btn--primary" onClick={onRetry}>
              ↺ Retry Lesson
            </button>
            <button className="overlay-btn overlay-btn--ghost" onClick={onMenu}>
              ← Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LessonOverlay;
