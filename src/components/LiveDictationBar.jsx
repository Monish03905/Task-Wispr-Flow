import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Send, Zap, MessageSquare, CornerDownLeft, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

export default function LiveDictationBar({
  isListening,
  isSimulating,
  interimTranscript,
  onToggleMic,
  onStartSimulation,
  onSubmitManualText,
  activeScenario,
  userWisprEmail
}) {
  const [manualInput, setManualInput] = useState('');
  const [autoCapture, setAutoCapture] = useState(true);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  // Auto-focus input on mount so Wispr Flow hotkey immediately writes into it
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // When Wispr Flow types into this input, automatically process it after a brief pause
  const handleInputChange = (e) => {
    const val = e.target.value;
    setManualInput(val);

    if (autoCapture && val.trim().length > 10) {
      // Clear previous debounce timer
      if (timerRef.current) clearTimeout(timerRef.current);

      // If user ends with punctuation (. ! ?) or pauses for 750ms, auto-dispatch!
      const endsWithPunctuation = /[.!?]$/.test(val.trim());
      const delay = endsWithPunctuation ? 350 : 800;

      timerRef.current = setTimeout(() => {
        if (val.trim()) {
          onSubmitManualText(val.trim());
          setManualInput('');
        }
      }, delay);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (timerRef.current) clearTimeout(timerRef.current);
    if (manualInput.trim()) {
      onSubmitManualText(manualInput.trim());
      setManualInput('');
    }
  };

  const sampleVoicePrompts = [
    "Action: Implement WebRTC sync for multi-user canvas",
    "Architecture: Decouple agent state using Redis streams",
    "P0 Bug: Memory leak during high-concurrency streaming",
    "Insight: Voice dictation delivers 3.8x faster spec writing",
    "Clear canvas"
  ];

  return (
    <div className="dictation-bar-wrapper">
      <div className={`dictation-cockpit ${isListening ? 'active-listening' : ''}`}>
        
        {/* Big Mic Button */}
        <div className="mic-button-col">
          <button 
            className={`main-mic-btn ${isListening ? 'listening-pulse' : ''}`}
            onClick={onToggleMic}
            title={isListening ? 'Click to pause browser mic' : 'Click to activate browser microphone'}
            id="micToggleBtn"
          >
            {isListening ? (
              <MicOff size={28} className="mic-icon-svg live-pulse" />
            ) : (
              <Mic size={28} className="mic-icon-svg" />
            )}
            <span className="mic-glow-ring" />
          </button>
          <span className="mic-hotkey-label">
            {isListening ? 'Browser Mic On' : 'Browser Mic Off'}
          </span>
        </div>

        {/* Real-time Transcription Stream Area */}
        <div className="transcription-stream-col">
          <div className="stream-header-row">
            <div className="stream-indicators-group">
              <span className="stream-indicator">
                <span className={`live-dot ${isListening || manualInput ? 'blink' : ''}`} />
                {isSimulating 
                  ? `Simulating Wispr Stream (${activeScenario || 'Active'})`
                  : isListening 
                  ? 'Browser Speech Recognition Live' 
                  : 'Wispr Flow Voice Dictation Ready'}
              </span>

              <span className="wispr-direct-active-pill" title="Press your Wispr Flow hotkey and speak anywhere!">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Wispr Flow Direct Input Active</span>
              </span>
            </div>

            <div className="stream-controls-right">
              <label className="auto-capture-toggle" title="Automatically process speech into cards without pressing enter">
                <input 
                  type="checkbox" 
                  checked={autoCapture} 
                  onChange={(e) => setAutoCapture(e.target.checked)}
                />
                <span>Auto-Synthesize</span>
              </label>

              {!isListening && (
                <button 
                  className="simulate-quick-btn"
                  onClick={() => onStartSimulation('ai_agent_arch')}
                  title="Simulate continuous voice stream at 160 WPM"
                >
                  <Play size={12} />
                  <span>Simulate 160 WPM Stream</span>
                </button>
              )}
            </div>
          </div>

          <div className="live-transcript-box">
            {interimTranscript ? (
              <p className="interim-text">
                {interimTranscript}
                <span className="typing-cursor">|</span>
              </p>
            ) : isListening ? (
              <p className="listening-placeholder">
                <Sparkles size={14} className="sparkle-hint" />
                Listening via browser mic... Speak naturally (e.g. "Action: Build auth API", "Bug: Cache miss")
                <span className="typing-cursor">|</span>
              </p>
            ) : (
              <form onSubmit={handleManualSubmit} className="manual-fallback-form">
                <input 
                  ref={inputRef}
                  type="text"
                  placeholder="Press your Wispr Flow key and speak freely (e.g. 'Architecture: use Redis streams')..."
                  value={manualInput}
                  onChange={handleInputChange}
                  className="manual-input"
                  id="wisprVoiceInputField"
                />
                {manualInput.trim() && (
                  <button type="submit" className="manual-send-btn" title="Synthesize thought">
                    <CornerDownLeft size={14} />
                  </button>
                )}
              </form>
            )}
          </div>

          {/* Quick Voice Command Hints */}
          <div className="voice-commands-strip">
            <span className="cmd-label">Quick Phrases:</span>
            {sampleVoicePrompts.map((prompt, idx) => (
              <button
                key={idx}
                className="cmd-chip"
                onClick={() => {
                  onSubmitManualText(prompt);
                  if (inputRef.current) inputRef.current.focus();
                }}
                title="Click to insert this sample voice utterance"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
