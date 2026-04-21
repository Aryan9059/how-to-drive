import { useState, useEffect } from "react";
import { LESSONS, PLANE_MISSIONS, HELICOPTER_MISSIONS } from "../gameConfig";
import simStore from "../simStore";
import { Trophy, XCircle, Lightbulb, Target, Clock, AlertTriangle, Octagon, Play, ArrowLeft, RotateCcw, Check, X, ShieldCheck, Cpu, Zap, MessageSquareWarning } from 'lucide-react';

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
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    } else if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
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
          const { mistakes, hardBrakes } = simStore.metrics;
          const criteria = lesson?.stars || { time: 999, mistakes: 0, hardBrakes: 0 };

          const prompt = `You are a professional and experienced driving/flight instructor. The student has completed the mission: "${lesson?.title}".
          Result: ${phase.toUpperCase()}
          Time taken: ${timeTaken}s (Target: ${criteria.time}s)
          Mistakes/Crashes: ${mistakes} (Target: ${criteria.mistakes})
          Hard Stops/Jerks: ${hardBrakes} (Target: ${criteria.hardBrakes})

          Provide a concise 2 to 3 sentence evaluation. Be polite, objective, and fact-based. Clearly highlight what was done well, where the student fell short compared to targets, and give one or two specific suggestions for improvement. Avoid exaggeration or harsh language.`;
          const apiKey = import.meta.env.VITE_MISTRAL_API_KEY;
          if (!apiKey) {
            setInstructorFeedback("API Key missing (VITE_MISTRAL_API_KEY). I can't even yell at you properly without it. Fix your environment variables!");
            setIsFetchingFeedback(false);
            return;
          }

          const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${apiKey}`
            },
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
    return (
      <div className="overlay-bg overlay-fadein">
        <div className="overlay-card">
          <div className="overlay-icon">{lesson && <lesson.icon size={48} />}</div>
          <p className="overlay-eyebrow">{missionLabel} {lessonIdx + 1} OF {missions.length}</p>
          <h2 className="overlay-title">{lesson?.title}</h2>
          <p className="overlay-desc">{lesson?.description}</p>
          <div className="overlay-hint">
            <span className="overlay-hint-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Lightbulb size={16} /> How to do it</span>
            <p>{hint}</p>
          </div>
          <div className="overlay-objective">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Target size={16} /> Objective</span>
            <p>{lesson?.objective}</p>
          </div>
          <div className="overlay-actions">
            <button className="overlay-btn overlay-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onStart}><Play size={18} fill="currentColor" /> Start Mission</button>
            <button className="overlay-btn overlay-btn--ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onMenu}><ArrowLeft size={18} /> Menu</button>
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
              <div className="briefing-header">
                <ShieldCheck size={20} className="text-blue" />
                <span>Ethics &amp; Safety</span>
              </div>
              <p>{lesson?.briefing?.ethics}</p>
            </div>

            <div className="briefing-item">
              <div className="briefing-header">
                <Cpu size={20} className="text-purple" />
                <span>Technical Knowledge</span>
              </div>
              <p>{lesson?.briefing?.knowledge}</p>
            </div>

            <div className="briefing-item">
              <div className="briefing-header">
                <Zap size={20} className="text-yellow" />
                <span>Training Tips</span>
              </div>
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
    const { mistakes, hardBrakes } = simStore.metrics;
    const criteria = lesson.stars || { time: 999, mistakes: 0, hardBrakes: 0 };

    const starTime = timeTaken <= criteria.time;
    const starMistake = mistakes <= criteria.mistakes;
    const starSmooth = hardBrakes <= criteria.hardBrakes;
    const totalStars = (starTime ? 1 : 0) + (starMistake ? 1 : 0) + (starSmooth ? 1 : 0);

    return (
      <div className="overlay-bg overlay-fadein">
        <div className="overlay-card overlay-card--pass">
          <div className="overlay-icon"><Trophy size={48} color="#a3e635" /></div>
          <p className="overlay-eyebrow">MISSION COMPLETE</p>
          <h2 className="overlay-title overlay-title--pass">
            {"★".repeat(totalStars)}{"☆".repeat(3 - totalStars)}
          </h2>

          <div className="overlay-hint" style={{ marginTop: '10px' }}>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={16} /> Time: <strong>{timeTaken}s</strong> / {criteria.time}s {starTime ? <Check color="#a3e635" size={18} /> : <X color="#f87171" size={18} />}</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><AlertTriangle size={16} /> Mistakes: <strong>{mistakes}</strong> / {criteria.mistakes} allowed {starMistake ? <Check color="#a3e635" size={18} /> : <X color="#f87171" size={18} />}</p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Octagon size={16} /> Hard Stops: <strong>{hardBrakes}</strong> / {criteria.hardBrakes} allowed {starSmooth ? <Check color="#a3e635" size={18} /> : <X color="#f87171" size={18} />}</p>
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
            {!isLast && <button className="overlay-btn overlay-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onNext}>Next Mission <Play size={18} fill="currentColor" /></button>}
            {isLast && <button className="overlay-btn overlay-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onMenu}><Trophy size={18} /> Back to Menu</button>}
            <button className="overlay-btn overlay-btn--ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onRetry}><RotateCcw size={18} /> Retry to Improve</button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "failed") {
    return (
      <div className="overlay-bg overlay-fadein">
        <div className="overlay-card overlay-card--fail">
          <div className="overlay-icon"><XCircle size={48} color="#f87171" /></div>
          <p className="overlay-eyebrow">NOT QUITE</p>
          <h2 className="overlay-title overlay-title--fail">Try Again</h2>
          <p className="overlay-desc">Don't worry — review the hint below and try once more.</p>
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
            <button className="overlay-btn overlay-btn--primary" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onRetry}><RotateCcw size={18} /> Retry Mission</button>
            <button className="overlay-btn overlay-btn--ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }} onClick={onMenu}><ArrowLeft size={18} /> Menu</button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default LessonOverlay;