import React, { useState } from 'react';
import { Mic, MicOff, Play, Send, Zap, MessageSquare, CornerDownLeft, Sparkles } from 'lucide-react';

export default function LiveDictationBar({
  isListening,
  isSimulating,
  interimTranscript,
  onToggleMic,
  onStartSimulation,
  onSubmitManualText,
  activeScenario
}) {
  const [manualInput, setManualInput] = useState('');

  const handleManualSubmit = (e) => {
    e.preventDefault();
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
            title={isListening ? 'Click to stop listening' : 'Click to start voice dictation'}
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
            {isListening ? 'Click to Pause' : 'Click to Speak'}
          </span>
        </div>

        {/* Real-time Transcription Stream Area */}
        <div className="transcription-stream-col">
          <div className="stream-header-row">
            <span className="stream-indicator">
              <span className={`live-dot ${isListening ? 'blink' : ''}`} />
              {isSimulating 
                ? `Simulating Wispr Stream (${activeScenario || 'Active'})`
                : isListening 
                ? 'Wispr Flow Continuous Voice Stream' 
                : 'Ready for Voice Dictation'}
            </span>
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

          <div className="live-transcript-box">
            {interimTranscript ? (
              <p className="interim-text">
                {interimTranscript}
                <span className="typing-cursor">|</span>
              </p>
            ) : isListening ? (
              <p className="listening-placeholder">
                <Sparkles size={14} className="sparkle-hint" />
                Listening... Speak naturally (e.g. "Action item: Deploy Redis cache", "Bug: Webhook timeout")
                <span className="typing-cursor">|</span>
              </p>
            ) : (
              <form onSubmit={handleManualSubmit} className="manual-fallback-form">
                <input 
                  type="text"
                  placeholder="Click microphone above to dictate, or type a spoken thought and press Enter..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="manual-input"
                />
                {manualInput.trim() && (
                  <button type="submit" className="manual-send-btn" title="Submit thought">
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
                onClick={() => onSubmitManualText(prompt)}
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
