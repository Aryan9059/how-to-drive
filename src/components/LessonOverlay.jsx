import { useState, useEffect } from "react";
import { LESSONS, PLANE_MISSIONS, HELICOPTER_MISSIONS } from "../gameConfig";
import simStore from "../simStore";
import { Trophy, XCircle, Lightbulb, Target, Clock, AlertTriangle, Octagon, Play, ArrowLeft, RotateCcw, Check, X, ShieldCheck, Cpu, Zap, MessageSquareWarning, TrafficCone } from 'lucide-react';

const allMissions = [...LESSONS, ...PLANE_MISSIONS, ...HELICOPTER_MISSIONS];

const getMissionsForVehicle = (vehicleType) => {
  switch (vehicleType) {
    case "plane": return PLANE_MISSIONS;
    case "helicopter": return HELICOPTER_MISSIONS;
    default: return LESSONS;
  }
};

const vehicleLabel = { car: "LESSON", plane: "FLIGHT MISSION", helicopter: "HELI MISSION" };
const vehicleReadyLabel = { car: "I'm Ready, Let's Drive!", plane: "Cleared for Takeoff!", helicopter: "Ready to Lift Off!" };

const renderMarkdownText = (text) => {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('*') && part.endsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
    return part;
  });
};

// Traffic violation penalty row — always shown when violations occurred
const ViolationRow = ({ count, allowedViolations }) => {
  const passed = count <= allowedViolations;
  return (
    <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span style={{ fontSize: '1rem' }}>🚦</span>
      Traffic Violations: <strong>{count}</strong> / {allowedViolations} allowed
      {' '}
      {passed
        ? <Check color="#a3e635" size={18} />
        : <X color="#f87171" size={18} />}
      {count > allowedViolations && (
        <span style={{ fontSize: '0.75rem', color: '#f87171', marginLeft: '4px' }}>
          (−{count - allowedViolations} star{count - allowedViolations !== 1 ? "s" : ""})
        </span>
      )}
    </p>
  );
};

const LessonOverlay = ({
  phase,
  lessonId,
  difficulty,
  vehicleType = "car",
  onStart,
  onBriefingComplete,
  onRetry,
  onNext,
  onMenu,
}) => {
  const missions = getMissionsForVehicle(vehicleType);
  const lesson = allMissions.find((l) => l.id === lessonId);
  const lessonIdx = missions.indexOf(lesson);
  const hint = difficulty === "easy" ? lesson?.easyHint : lesson?.controlsHint;
  const missionLabel = vehicleLabel[vehicleType] || "LESSON";

  const [instructorFeedback, setInstructorFeedback] = useState("");
  const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);

  useEffect(() => {
    if ((phase === "passed" || phase === "failed") && !instructorFeedback && !isFetchingFeedback) {
      const getFeedback = async () => {
        setIsFetchingFeedback(true);
        try {
          const timeTaken = ((simStore.metrics.endTime - simStore.metrics.startTime) / 1000).toFixed(1);
          const { mistakes, hardBrakes, trafficViolations } = simStore.metrics;
          const criteria = lesson?.stars || { time: 999, mistakes: 0, hardBrakes: 0 };
          const tlViolations = trafficViolations || 0;

          const prompt = `You are a professional and experienced driving/flight instructor. The student has completed the mission: "${lesson?.title}".
Result: ${phase.toUpperCase()}
Time taken: ${timeTaken}s (Target: ${criteria.time}s)
Mistakes/Crashes: ${mistakes} (Target: ${criteria.mistakes})
Hard Stops/Jerks: ${hardBrakes} (Target: ${criteria.hardBrakes})
Traffic Light Violations: ${tlViolations} (Target: 0 — any violation loses a star)

Provide a concise 2 to 3 sentence evaluation. Be polite, objective, and fact-based. If there were traffic light violations, specifically mention that running red lights is dangerous and illegal. Highlight what was done well, where the student fell short, and give one or two specific suggestions for improvement.`;

          const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
          if (!apiKey) {
            setInstructorFeedback("API Key missing (VITE_MISTRAL_API_KEY). I can't even yell at you properly without it.");
            setIsFetchingFeedback(false);
            return;
          }

          const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: "mistral-tiny",
              messages: [{ role: "user", content: prompt }]
            })
          });

          const data = await res.json();
          if (data.choices && data.choices[0]) {
            setInstructorFeedback(data.choices[0].message.content.trim());
          } else {
            setInstructorFeedback("I'm speechless. Your performance broke my feedback system.");
          }
        } catch (err) {
          setInstructorFeedback("I'm too angry to speak right now. (Failed to load API)");
        }
        setIsFetchingFeedback(false);
      };
      getFeedback();
    }
  }, [phase, lesson, instructorFeedback, isFetchingFeedback]);

  if (phase === "intro") {
    // Check if this lesson has traffic lights
    const hasTrafficLights = ["lesson1", "lesson2", "lesson7"].includes(lessonId);

    return (
      <div className="overlay-bg overlay-fadein">
        <div className="overlay-card">
          <div className="overlay-icon">{lesson && <lesson.icon size={48} />}</div>
          <p className="overlay-eyebrow">{missionLabel} {lessonIdx + 1} OF {missions.length}</p>
          <h2 className="overlay-title">{lesson?.title}</h2>
          <p className="overlay-desc">{lesson?.description}</p>

          {/* Traffic light notice */}
          {hasTrafficLights && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              padding: '12px 16px',
              background: 'rgba(220,38,38,0.12)',
              border: '1px solid rgba(220,38,38,0.35)',
              borderRadius: '14px',
            }}>
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>🚦</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#ff8888', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
                  Traffic Lights Active
                </div>
                <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                  This mission has active traffic lights. Running a <strong>red or yellow light</strong> incurs a penalty and deducts from your final star rating. Observe the signals!
                </div>
              </div>
            </div>
          )}

          <div className="overlay-hint">
            <span className="overlay-hint-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lightbulb size={16} /> How to do it</span>
            <p>{hint}</p>
          </div>
          <div className="overlay-objective">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={16} /> Objective</span>
            <p>{lesson?.objective}</p>
          </div>
          <div className="overlay-actions">
            <button className="overlay-btn overlay-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onStart}>
              <Play size={18} fill="currentColor" /> Start Mission
            </button>
            <button className="overlay-btn overlay-btn--ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onMenu}>
              <ArrowLeft size={18} /> Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "briefing") {
    return (
      <div className="overlay-bg overlay-fadein">
        <div className="overlay-card overlay-card--briefing">
          <div className="overlay-icon shadow-pulse">
            <ShieldCheck size={48} color="#60a5fa" />
          </div>
          <p className="overlay-eyebrow">TRAINING BRIEFING</p>
          <h2 className="overlay-title">{lesson?.title}</h2>

          <div className="briefing-grid">
            <div className="briefing-item">
              <div className="briefing-header"><ShieldCheck size={20} className="text-blue" /><span>Ethics &amp; Safety</span></div>
              <p>{lesson?.briefing?.ethics}</p>
            </div>
            <div className="briefing-item">
              <div className="briefing-header"><Cpu size={20} className="text-purple" /><span>Technical Knowledge</span></div>
              <p>{lesson?.briefing?.knowledge}</p>
            </div>
            <div className="briefing-item">
              <div className="briefing-header"><Zap size={20} className="text-yellow" /><span>Training Tips</span></div>
              <p>{lesson?.briefing?.training}</p>
            </div>
          </div>

          <div className="overlay-actions" style={{ marginTop: '30px' }}>
            <button className="overlay-btn overlay-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', width: '100%' }} onClick={onBriefingComplete}>
              <Play size={18} fill="currentColor" /> {vehicleReadyLabel[vehicleType] || "Let's Go!"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "passed") {
    const isLast = lessonIdx === missions.length - 1;

    const timeTaken = ((simStore.metrics.endTime - simStore.metrics.startTime) / 1000).toFixed(1);
    const { mistakes, hardBrakes, trafficViolations } = simStore.metrics;
    const tlViolations = trafficViolations || 0;
    const criteria = lesson.stars || { time: 999, mistakes: 0, hardBrakes: 0 };
    const allowedViolations = criteria.trafficViolations ?? 0;

    const starTime = timeTaken <= criteria.time;
    const starMistake = mistakes <= criteria.mistakes;
    const starSmooth = hardBrakes <= criteria.hardBrakes;
    const starTraffic = tlViolations <= allowedViolations;

    // Traffic violations directly remove a star from whatever total
    let totalStars = (starTime ? 1 : 0) + (starMistake ? 1 : 0) + (starSmooth ? 1 : 0);
    // Each violation beyond the allowed count reduces stars
    const violationPenalty = Math.max(0, tlViolations - allowedViolations);
    totalStars = Math.max(0, totalStars - violationPenalty);

    return (
      <div className="overlay-bg overlay-fadein">
        <div className="overlay-card overlay-card--pass">
          <div className="overlay-icon"><Trophy size={48} color="#a3e635" /></div>
          <p className="overlay-eyebrow">MISSION COMPLETE</p>
          <h2 className="overlay-title overlay-title--pass">
            {"★".repeat(totalStars)}{"☆".repeat(3 - totalStars)}
          </h2>

          {/* Traffic violation warning banner */}
          {tlViolations > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(220,38,38,0.18)',
              border: '1px solid rgba(220,38,38,0.5)',
              borderRadius: '12px',
              fontSize: '0.85rem',
              color: '#ff8888',
            }}>
              <span style={{ fontSize: '1.2rem' }}>🚦</span>
              <div>
                <strong>Traffic violations detected!</strong> You ran {tlViolations} red/yellow light{tlViolations !== 1 ? "s" : ""}.
                {violationPenalty > 0 && ` This cost you ${violationPenalty} star${violationPenalty !== 1 ? "s" : ""}.`}
              </div>
            </div>
          )}

          <div className="overlay-hint" style={{ marginTop: '10px' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> Time: <strong>{timeTaken}s</strong> / {criteria.time}s {starTime ? <Check color="#a3e635" size={18} /> : <X color="#f87171" size={18} />}
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} /> Mistakes: <strong>{mistakes}</strong> / {criteria.mistakes} allowed {starMistake ? <Check color="#a3e635" size={18} /> : <X color="#f87171" size={18} />}
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Octagon size={16} /> Hard Stops: <strong>{hardBrakes}</strong> / {criteria.hardBrakes} allowed {starSmooth ? <Check color="#a3e635" size={18} /> : <X color="#f87171" size={18} />}
            </p>
            {/* Always show traffic violations row */}
            <ViolationRow count={tlViolations} allowedViolations={allowedViolations} />
          </div>

          <div className="overlay-instructor-feedback" style={{ marginTop: '15px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#ff8a8a', fontWeight: 'bold' }}>
              <MessageSquareWarning size={18} /> Instructor's Remarks
            </p>
            <p style={{ margin: '8px 0 0 0', fontStyle: 'italic', color: '#fca5a5' }}>
              {isFetchingFeedback ? "Instructor is angrily writing notes..." : <>"{renderMarkdownText(instructorFeedback)}"</>}
            </p>
          </div>

          <div className="overlay-actions" style={{ marginTop: '20px' }}>
            {!isLast && (
              <button className="overlay-btn overlay-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onNext}>
                Next Mission <Play size={18} fill="currentColor" />
              </button>
            )}
            {isLast && (
              <button className="overlay-btn overlay-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onMenu}>
                <Trophy size={18} /> Back to Menu
              </button>
            )}
            <button className="overlay-btn overlay-btn--ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onRetry}>
              <RotateCcw size={18} /> Retry to Improve
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "failed") {
    const tlViolations = simStore.metrics.trafficViolations || 0;

    return (
      <div className="overlay-bg overlay-fadein">
        <div className="overlay-card overlay-card--fail">
          <div className="overlay-icon"><XCircle size={48} color="#f87171" /></div>
          <p className="overlay-eyebrow">NOT QUITE</p>
          <h2 className="overlay-title overlay-title--fail">Try Again</h2>
          <p className="overlay-desc">Don't worry — review the hint below and try once more.</p>

          {tlViolations > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(220,38,38,0.15)',
              border: '1px solid rgba(220,38,38,0.4)',
              borderRadius: '12px',
              fontSize: '0.85rem',
              color: '#ff8888',
            }}>
              <span style={{ fontSize: '1.2rem' }}>🚦</span>
              <span>You ran <strong>{tlViolations}</strong> red/yellow light{tlViolations !== 1 ? "s" : ""} — each costs a star!</span>
            </div>
          )}

          <div className="overlay-hint">
            <span className="overlay-hint-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lightbulb size={16} /> Tip</span>
            <p>{hint}</p>
          </div>

          <div className="overlay-instructor-feedback" style={{ marginTop: '15px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#ff8a8a', fontWeight: 'bold' }}>
              <MessageSquareWarning size={18} /> Instructor's Remarks
            </p>
            <p style={{ margin: '8px 0 0 0', fontStyle: 'italic', color: '#fca5a5' }}>
              {isFetchingFeedback ? "Instructor is screaming internally..." : <>"{renderMarkdownText(instructorFeedback)}"</>}
            </p>
          </div>

          <div className="overlay-actions" style={{ marginTop: '20px' }}>
            <button className="overlay-btn overlay-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onRetry}>
              <RotateCcw size={18} /> Retry Mission
            </button>
            <button className="overlay-btn overlay-btn--ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onMenu}>
              <ArrowLeft size={18} /> Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LessonOverlay;
