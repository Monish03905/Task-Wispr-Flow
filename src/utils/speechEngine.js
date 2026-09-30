// Speech Engine: Web Speech API + Audio Context analyzer + Realistic Simulation fallback

export const PRESET_SCENARIOS = [
  {
    id: 'ai_agent_arch',
    title: 'Autonomous AI Agent Architecture',
    description: 'High-speed technical architectural brainstorming session',
    phrases: [
      "Let's architect our next-generation autonomous AI coding agent with real-time feedback loops.",
      "Architecture decision: we will use an event-driven pub-sub architecture using Redis streams for message queuing.",
      "Action item: implement WebRTC data channels for low-latency peer-to-peer browser synchronization.",
      "High priority bug: memory leak in the token cache during long-running multi-turn agent conversations.",
      "Insight: streaming response latency dropped by 45% when using HTTP2 chunked transfer encoding.",
      "Action item: write automated integration tests covering the sandbox bash execution environment.",
      "Architecture: decouple LLM orchestration from UI rendering using a clean Web Worker thread.",
      "Critical decision: all client secrets must be encrypted at rest using AES-GCM-256 with user-derived keys."
    ]
  },
  {
    id: 'saas_launch',
    title: 'SaaS Product Launch & Growth Sprint',
    description: 'Executive product roadmap and launch execution strategy',
    phrases: [
      "We need to finalize the launch checklist for the Wispr-powered voice productivity suite by Friday.",
      "Action item: set up PostHog telemetry to track time saved per user and words dictated per session.",
      "Urgent bug: checkout webhook fails intermittently on Stripe tiered subscriptions when coupon applied.",
      "Insight: users who dictate at over 150 words per minute retain 3.2x better after day fourteen.",
      "Decision: migrate our landing page from static HTML to dynamic server-side rendering for optimal SEO and LCP.",
      "Action item: coordinate with developer relations to publish the voice-driven development case study.",
      "Architecture decision: integrate WebSocket fallback for real-time presence indicators on collaborative boards."
    ]
  },
  {
    id: 'incident_postmortem',
    title: 'Post-Mortem & Resilience Review',
    description: 'Root cause analysis and prevention action items',
    phrases: [
      "Starting incident review for the API gateway degradation observed during peak US morning traffic.",
      "Root cause insight: connection pool starvation occurred because database keepalive timeout was misconfigured.",
      "P0 Action item: increase database connection pool capacity from 100 to 500 connections across replicas.",
      "Architecture decision: implement an exponential backoff circuit breaker pattern in all upstream gateway proxies.",
      "Bug detected: health check probe was returning HTTP 200 even while worker queues were backing up.",
      "Action item: configure Datadog synthetic alerts to trigger when p99 response time exceeds 250 milliseconds."
    ]
  }
];

export class VoiceSpeechEngine {
  constructor({ onTranscript, onInterim, onStateChange, onAudioLevel }) {
    this.onTranscript = onTranscript || (() => {});
    this.onInterim = onInterim || (() => {});
    this.onStateChange = onStateChange || (() => {});
    this.onAudioLevel = onAudioLevel || (() => {});

    this.recognition = null;
    this.isListening = false;
    this.isSimulating = false;
    this.simInterval = null;
    this.audioContext = null;
    this.analyser = null;
    this.mediaStream = null;
    this.animFrameId = null;

    this.startTime = null;
    this.totalWords = 0;

    this.initBrowserSpeech();
  }

  isSupported() {
    return typeof window !== 'undefined' && 
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }

  initBrowserSpeech() {
    if (!this.isSupported()) return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRec();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isListening = true;
      this.startTime = Date.now();
      this.onStateChange({ isListening: true, isSimulating: false });
    };

    this.recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const text = item[0].transcript;
        if (item.isFinal) {
          const words = text.trim().split(/\s+/).length;
          this.totalWords += words;
          this.onTranscript(text.trim());
        } else {
          interim += text;
        }
      }
      this.onInterim(interim);
    };

    this.recognition.onerror = (event) => {
      console.warn('Speech recognition warning/error:', event.error);
      if (event.error === 'not-allowed') {
        this.stop();
      }
    };

    this.recognition.onend = () => {
      if (this.isListening && !this.isSimulating) {
        try {
          this.recognition.start();
        } catch {
          this.isListening = false;
          this.onStateChange({ isListening: false, isSimulating: false });
        }
      } else {
        this.isListening = false;
        this.onStateChange({ isListening: false, isSimulating: false });
      }
    };
  }

  async startMic() {
    this.stopSimulation();
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {
        console.warn('Recognition start caught:', e);
      }
    }

    // Initialize Web Audio API analyzer for reactive visuals
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.audioContext = new AudioCtx();
        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 64;
        source.connect(this.analyser);
        this.startAudioLoop();
      }
    } catch (err) {
      console.warn('Audio visualization mic stream error:', err);
    }

    this.isListening = true;
    this.startTime = Date.now();
    this.onStateChange({ isListening: true, isSimulating: false });
  }

  startAudioLoop() {
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    const checkLevel = () => {
      if (!this.isListening && !this.isSimulating) return;
      this.analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        sum += dataArray[i];
      }
      const avg = sum / dataArray.length / 255;
      this.onAudioLevel(avg);
      this.animFrameId = requestAnimationFrame(checkLevel);
    };
    checkLevel();
  }

  startSimulation(scenarioId = 'ai_agent_arch') {
    this.stop();
    const scenario = PRESET_SCENARIOS.find(s => s.id === scenarioId) || PRESET_SCENARIOS[0];
    this.isSimulating = true;
    this.isListening = true;
    this.startTime = Date.now();
    this.onStateChange({ isListening: true, isSimulating: true, scenarioTitle: scenario.title });

    let phraseIdx = 0;
    let charIdx = 0;
    let currentPhrase = scenario.phrases[0];

    // Simulate audio wave fluctuation
    const fakeAudioTimer = setInterval(() => {
      if (!this.isSimulating) {
        clearInterval(fakeAudioTimer);
        return;
      }
      const fakeLevel = 0.2 + Math.random() * 0.65;
      this.onAudioLevel(fakeLevel);
    }, 80);

    const typeNextChar = () => {
      if (!this.isSimulating) return;

      if (charIdx < currentPhrase.length) {
        // stream interim typing at fast speaking pace (~160 wpm)
        const chunk = Math.min(3, currentPhrase.length - charIdx);
        charIdx += chunk;
        this.onInterim(currentPhrase.substring(0, charIdx));
        this.simInterval = setTimeout(typeNextChar, 35);
      } else {
        // Phrase finished
        this.onInterim('');
        this.onTranscript(currentPhrase);
        this.totalWords += currentPhrase.split(/\s+/).length;

        phraseIdx++;
        if (phraseIdx < scenario.phrases.length) {
          currentPhrase = scenario.phrases[phraseIdx];
          charIdx = 0;
          this.simInterval = setTimeout(typeNextChar, 1100);
        } else {
          // Finished all phrases in scenario
          setTimeout(() => {
            this.stop();
          }, 800);
        }
      }
    };

    typeNextChar();
  }

  stopSimulation() {
    this.isSimulating = false;
    if (this.simInterval) {
      clearTimeout(this.simInterval);
      this.simInterval = null;
    }
  }

  stop() {
    this.isListening = false;
    this.stopSimulation();

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn('Recognition stop error', e);
      }
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch (e) {
        console.warn(e);
      }
      this.audioContext = null;
    }

    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    this.onAudioLevel(0);
    this.onInterim('');
    this.onStateChange({ isListening: false, isSimulating: false });
  }

  calculateWPM() {
    if (!this.startTime || this.totalWords === 0) return 0;
    const elapsedMinutes = (Date.now() - this.startTime) / 60000;
    if (elapsedMinutes <= 0) return 0;
    return Math.round(this.totalWords / elapsedMinutes);
  }
}
