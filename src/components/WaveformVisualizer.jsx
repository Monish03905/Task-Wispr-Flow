import React, { useEffect, useRef } from 'react';

export default function WaveformVisualizer({ isListening, audioLevel = 0, theme = 'light' }) {
  const canvasRef = useRef(null);
  const isLight = theme === 'light';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let phase = 0;

    // Responsive canvas resolution
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const width = canvas.offsetWidth;
      const height = canvas.offsetHeight;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Base activity level
      const activeFactor = isListening ? Math.max(0.2, audioLevel * 1.8) : 0.05;
      phase += 0.05 + activeFactor * 0.1;

      // Draw subtle grid lines
      ctx.strokeStyle = isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let y = 10; y < height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw Multi-layer glowing sine waves
      const waves = [
        { color: isLight ? 'rgba(5, 150, 105, 0.85)' : 'rgba(16, 185, 129, 0.75)', amp: 22 * activeFactor, freq: 0.02, speed: 1.0 },
        { color: isLight ? 'rgba(2, 132, 199, 0.9)' : 'rgba(6, 182, 212, 0.85)', amp: 30 * activeFactor, freq: 0.015, speed: -0.8 },
        { color: isLight ? 'rgba(124, 58, 237, 0.75)' : 'rgba(139, 92, 246, 0.65)', amp: 16 * activeFactor, freq: 0.025, speed: 1.4 }
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.strokeStyle = w.color;
        ctx.lineWidth = isListening ? 2.5 : 1.2;
        ctx.shadowBlur = isListening ? 12 : 3;
        ctx.shadowColor = w.color;

        for (let x = 0; x < width; x += 4) {
          // Windowing envelope so ends taper off
          const envelope = Math.sin((x / width) * Math.PI);
          const y = centerY + Math.sin(x * w.freq + phase * w.speed) * w.amp * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      });

      // Draw Dynamic Frequency Bars in Center
      const barCount = 48;
      const barWidth = 3;
      const gap = (width * 0.7) / barCount;
      const startX = width * 0.15;

      for (let i = 0; i < barCount; i++) {
        const x = startX + i * gap;
        const distFromCenter = 1 - Math.abs(i - barCount / 2) / (barCount / 2);
        const barHeight = Math.max(
          4,
          Math.sin(phase * 1.5 + i * 0.3) * 28 * activeFactor * distFromCenter + (audioLevel * 45 * distFromCenter)
        );

        const grad = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight);
        grad.addColorStop(0, 'rgba(6, 182, 212, 0.9)');
        grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.95)');
        grad.addColorStop(1, 'rgba(6, 182, 212, 0.9)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, centerY - barHeight / 2, barWidth, barHeight, 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, audioLevel, isLight]);

  return (
    <div className="visualizer-container">
      <canvas ref={canvasRef} className="visualizer-canvas" />
      <div className="visualizer-overlay-info">
        <span className="visualizer-tag">
          {isListening ? '🎙️ Web Audio Spectrum Active' : '● Audio Standby'}
        </span>
      </div>
    </div>
  );
}
