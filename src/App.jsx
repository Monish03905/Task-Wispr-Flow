import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import WaveformVisualizer from './components/WaveformVisualizer';
import LiveDictationBar from './components/LiveDictationBar';
import ConceptGraphCanvas from './components/ConceptGraphCanvas';
import StructuredCardsGrid from './components/StructuredCardsGrid';
import WisprComparisonWidget from './components/WisprComparisonWidget';
import ExportModal from './components/ExportModal';
import VoiceScriptGuideModal from './components/VoiceScriptGuideModal';
import WisprAccountModal from './components/WisprAccountModal';

import { VoiceSpeechEngine } from './utils/speechEngine';
import { parseSpokenInput } from './utils/nlpParser';
import { sound } from './utils/audioSynthesizer';
import './index.css';

const INITIAL_DEMO_ITEMS = [
  {
    id: 'init_1',
    raw: 'Architecture decision: we will use an event-driven pub-sub architecture using Redis streams for low-latency state synchronization.',
    title: 'Event-driven Redis Streams State Architecture',
    detail: 'Decouple core LLM cognitive graph from UI rendering threads using low-latency Redis streams.',
    category: 'architecture',
    priority: 'P1',
    status: 'active',
    tags: ['database', 'backend', 'api'],
    createdAt: '12:00:15 PM',
    timestamp: Date.now() - 300000
  },
  {
    id: 'init_2',
    raw: 'Action item: implement WebRTC data channels for multi-agent peer synchronization.',
    title: 'Implement WebRTC Data Channels',
    detail: 'Support sub-50ms peer synchronization between distributed cognitive canvas clients.',
    category: 'action',
    priority: 'P2',
    status: 'todo',
    tags: ['api', 'frontend', 'webrtc'],
    createdAt: '12:01:40 PM',
    timestamp: Date.now() - 240000
  },
  {
    id: 'init_3',
    raw: 'P0 Bug: token memory leak observed during long-running multi-turn voice sessions.',
    title: 'Token Memory Leak in Streaming Buffer',
    detail: 'Buffer retaining un-dereferenced audio blobs in Chrome V8 heap during extended sessions.',
    category: 'bug',
    priority: 'P0',
    status: 'active',
    tags: ['devops', 'frontend', 'security'],
    createdAt: '12:03:10 PM',
    timestamp: Date.now() - 180000
  },
  {
    id: 'init_4',
    raw: 'Insight: voice-driven spec authoring at 165 WPM reduces PRD turnaround time by 75 percent.',
    title: 'Voice-Driven 165 WPM Spec Acceleration',
    detail: 'Founders and tech leads articulate intricate systems 4x faster verbally than manual typing.',
    category: 'insight',
    priority: 'P3',
    status: 'active',
    tags: ['growth', 'analytics'],
    createdAt: '12:04:22 PM',
    timestamp: Date.now() - 120000
  }
];

export default function App() {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('voxflow_items');
      return saved ? JSON.parse(saved) : INITIAL_DEMO_ITEMS;
    } catch {
      return INITIAL_DEMO_ITEMS;
    }
  });

  const [userWisprEmail, setUserWisprEmail] = useState(() => {
    return localStorage.getItem('wispr_account_email') || 'monish@wisprflow.user';
  });

  const [isListening, setIsListening] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [wpm, setWpm] = useState(165);
  const [activeScenario, setActiveScenario] = useState('');
  const [selectedId, setSelectedId] = useState(null);

  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  const engineRef = useRef(null);

  // Save items to local storage
  useEffect(() => {
    try {
      localStorage.setItem('voxflow_items', JSON.stringify(items));
    } catch {}
  }, [items]);

  const handleSaveEmail = (email) => {
    setUserWisprEmail(email);
    try {
      localStorage.setItem('wispr_account_email', email);
    } catch {}
  };

  // Initialize Speech Engine
  useEffect(() => {
    const engine = new VoiceSpeechEngine({
      onTranscript: (finalText) => {
        handleSpokenUtterance(finalText);
      },
      onInterim: (text) => {
        setInterimTranscript(text);
      },
      onStateChange: ({ isListening: listening, isSimulating: simulating, scenarioTitle }) => {
        setIsListening(listening);
        setIsSimulating(simulating);
        if (scenarioTitle) setActiveScenario(scenarioTitle);
        if (listening) {
          sound.playMicStart();
        } else {
          sound.playMicStop();
        }
      },
      onAudioLevel: (level) => {
        setAudioLevel(level);
      }
    });

    engineRef.current = engine;

    // Periodic WPM calculation interval
    const wpmTimer = setInterval(() => {
      if (engineRef.current && isListening) {
        const currentWpm = engineRef.current.calculateWPM();
        if (currentWpm > 0) {
          setWpm(currentWpm);
        }
      }
    }, 2000);

    return () => {
      clearInterval(wpmTimer);
      if (engineRef.current) {
        engineRef.current.stop();
      }
    };
  }, []);

  // Handle parsed voice utterance or command
  const handleSpokenUtterance = (text) => {
    const parsed = parseSpokenInput(text);
    if (!parsed) return;

    if (parsed.isCommand) {
      sound.playCommandTriggered();
      if (parsed.command === 'CLEAR_CANVAS') {
        setItems([]);
      } else if (parsed.command === 'EXPORT_PRD' || parsed.command === 'EXPORT_TICKETS') {
        setIsExportOpen(true);
      }
      return;
    }

    // Add structured item
    setItems((prev) => [parsed, ...prev]);
    setSelectedId(parsed.id);
    sound.playCardAdded();
  };

  const handleToggleMic = () => {
    if (!engineRef.current) return;
    if (isListening) {
      engineRef.current.stop();
    } else {
      engineRef.current.startMic();
    }
  };

  const handleStartScenario = (scenarioId) => {
    if (!engineRef.current) return;
    engineRef.current.startSimulation(scenarioId);
  };

  const handleToggleStatus = (id) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextStatus = item.status === 'done' ? 'todo' : 'done';
          sound.playCommandTriggered();
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  const handleDeleteItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Clear all captured items from the cognitive canvas?')) {
      setItems([]);
      setSelectedId(null);
      sound.playCommandTriggered();
    }
  };

  return (
    <div className="app-root-layout">
      {/* Top Navigation */}
      <Navbar
        isListening={isListening}
        isSimulating={isSimulating}
        onToggleMic={handleToggleMic}
        onStartScenario={handleStartScenario}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        userWisprEmail={userWisprEmail}
        onClear={handleClearAll}
        wpm={wpm}
        itemCount={items.length}
      />

      {/* Main Studio Body */}
      <main className="studio-main-container">
        
        {/* Dynamic Waveform Visualizer */}
        <WaveformVisualizer 
          isListening={isListening}
          audioLevel={audioLevel}
        />

        {/* Live Dictation Cockpit & Voice Commands */}
        <LiveDictationBar
          isListening={isListening}
          isSimulating={isSimulating}
          interimTranscript={interimTranscript}
          onToggleMic={handleToggleMic}
          onStartSimulation={handleStartScenario}
          onSubmitManualText={handleSpokenUtterance}
          activeScenario={activeScenario}
          userWisprEmail={userWisprEmail}
        />

        {/* 2-Column Studio Layout */}
        <div className="studio-dual-split">
          
          {/* Left Column: Visual Graph + ROI Widget */}
          <section className="studio-left-pane">
            <ConceptGraphCanvas 
              items={items}
              selectedId={selectedId}
              onSelectNode={(id) => setSelectedId(id)}
            />
            <WisprComparisonWidget currentWpm={wpm} />
          </section>

          {/* Right Column: Structured Categorized Cards */}
          <section className="studio-right-pane">
            <StructuredCardsGrid
              items={items}
              selectedId={selectedId}
              onSelectNode={(id) => setSelectedId(id)}
              onToggleStatus={handleToggleStatus}
              onDeleteItem={handleDeleteItem}
            />
          </section>

        </div>
      </main>

      {/* Modals */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        items={items}
        wpm={wpm}
        userEmail={userWisprEmail}
      />

      <VoiceScriptGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <WisprAccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        userEmail={userWisprEmail}
        onSaveEmail={handleSaveEmail}
      />
    </div>
  );
}
