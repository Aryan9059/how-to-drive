import { LESSONS } from "../gameConfig";
import simStore from "../simStore";

const LessonOverlay = ({
  phase,
  lessonId,
  difficulty,
  onStart,
  onRetry,
  onNext,
  onMenu,
}) => {
  const lesson = LESSONS.find((l) => l.id === lessonId);
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
            <button className="overlay-btn overlay-btn--primary" onClick={onStart}>▶ Start Lesson</button>
            <button className="overlay-btn overlay-btn--ghost" onClick={onMenu}>← Menu</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "passed") {
    const isLast = lessonIdx === LESSONS.length - 1;

    // Read the metrics securely upon render
    const timeTaken = ((simStore.metrics.endTime - simStore.metrics.startTime) / 1000).toFixed(1);
    const { mistakes, hardBrakes } = simStore.metrics;
    const criteria = lesson.stars || { time: 999, mistakes: 0, hardBrakes: 0 };

    const starTime = timeTaken <= criteria.time;
    const starMistake = mistakes <= criteria.mistakes;
    const starSmooth = hardBrakes <= criteria.hardBrakes;
    const totalStars = (starTime ? 1 : 0) + (starMistake ? 1 : 0) + (starSmooth ? 1 : 0);

    return (
      <div className="overlay-bg overlay-fadein">
        <div className="overlay-card overlay-card--pass">
          <div className="overlay-icon">🏆</div>
          <p className="overlay-eyebrow">LESSON COMPLETE</p>
          <h2 className="overlay-title overlay-title--pass">
            {"★".repeat(totalStars)}{"☆".repeat(3 - totalStars)}
          </h2>

          <div className="overlay-hint" style={{ marginTop: '10px' }}>
            <p>⏱️ Time: <strong>{timeTaken}s</strong> / {criteria.time}s {starTime ? "✅" : "❌"}</p>
            <p>💥 Mistakes: <strong>{mistakes}</strong> / {criteria.mistakes} allowed {starMistake ? "✅" : "❌"}</p>
            <p>🛑 Hard Brakes: <strong>{hardBrakes}</strong> / {criteria.hardBrakes} allowed {starSmooth ? "✅" : "❌"}</p>
          </div>

          <div className="overlay-actions">
            {!isLast && <button className="overlay-btn overlay-btn--primary" onClick={onNext}>Next Lesson →</button>}
            {isLast && <button className="overlay-btn overlay-btn--primary" onClick={onMenu}>🎉 Back to Menu</button>}
            <button className="overlay-btn overlay-btn--ghost" onClick={onRetry}>↺ Retry to Improve</button>
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
            <button className="overlay-btn overlay-btn--primary" onClick={onRetry}>↺ Retry Lesson</button>
            <button className="overlay-btn overlay-btn--ghost" onClick={onMenu}>← Menu</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LessonOverlay;