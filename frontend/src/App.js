import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const isElectron = !!window.electronAPI;

function App() {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState('offline'); // 'offline' | 'live' | 'error'
  const [lastGesture, setLastGesture] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [gestureLog, setGestureLog] = useState([]);
  const gestureTimeout = useRef(null);

  useEffect(() => {
    if (!isElectron) return;
    const api = window.electronAPI;

    api.onPythonStatus((s) => {
      if (s === 'started') {
        setStatus('live');
        setErrorMsg('');
      } else if (s === 'stopped') {
        setStatus('offline');
        setActive(false);
      }
    });

    api.onGestureDetected((g) => {
      setLastGesture(g);
      setGestureLog(prev => [{ gesture: g, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 8));
      clearTimeout(gestureTimeout.current);
      gestureTimeout.current = setTimeout(() => setLastGesture(null), 1500);
    });

    api.onPythonError((err) => {
      setErrorMsg(err);
      setStatus('error');
      setActive(false);
    });

    return () => {
      api.removeAllListeners('python-status');
      api.removeAllListeners('gesture-detected');
      api.removeAllListeners('python-error');
    };
  }, []);

  const handleToggle = useCallback(() => {
    if (!active) {
      setActive(true);
      setStatus('live');
      setErrorMsg('');
      if (isElectron) window.electronAPI.startNavigation();
    } else {
      setActive(false);
      setStatus('offline');
      if (isElectron) window.electronAPI.stopNavigation();
    }
  }, [active]);

  const gestureMeta = {
    cursor_move: { icon: '☝️', label: 'Cursor Move' },
    scroll: { icon: '✌️', label: 'Scroll' },
    volume_up: { icon: '👍', label: 'Volume Up' },
    volume_down: { icon: '👎', label: 'Volume Down' },
    fist: { icon: '✊', label: 'Idle' },
  };

  const currentGesture = lastGesture ? gestureMeta[lastGesture] : null;

  return (
    <div className="app">
      {/* Grid background */}
      <div className="grid-bg" />
      <div className="scanline" />

      {/* Hero */}
      <section className="hero">
        <div className="hero-eyebrow">
          <span className="dot" style={{ background: status === 'live' ? '#00ff88' : status === 'error' ? '#ff4455' : '#555' }} />
          <span className="eyebrow-text">
            {status === 'live' ? 'Live' : status === 'error' ? 'Error' : 'Offline'}
          </span>
        </div>

        <h1 className="hero-title">
          Air<span className="accent">Ctrl</span>
        </h1>
        <p className="hero-subtitle">Control your system with your hands</p>

        <button
          className={`main-btn ${active ? 'stop' : 'start'}`}
          onClick={handleToggle}
        >
          <span className="btn-ring" />
          <span className="btn-inner">
            {active ? (
              <>
                <span className="btn-pulse" />
                Stop Navigation
              </>
            ) : (
              'Start Navigation'
            )}
          </span>
        </button>

        {errorMsg && (
          <div className="error-banner">
            ⚠ {errorMsg.includes('camera') || errorMsg.includes('Cannot open') 
              ? 'Camera not found. Please connect a webcam and try again.' 
              : `Error: ${errorMsg}`}
          </div>
        )}

        {/* Gesture feedback */}
        {active && (
          <div className={`gesture-feedback ${currentGesture ? 'visible' : ''}`}>
            {currentGesture && (
              <>
                <span className="gf-icon">{currentGesture.icon}</span>
                <span className="gf-label">{currentGesture.label}</span>
              </>
            )}
            {!currentGesture && <span className="gf-waiting">Waiting for gesture…</span>}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="section">
        <h2 className="section-title">How It Works</h2>
        <div className="steps">
          {[
            { n: '01', title: 'Allow Camera', desc: 'AirCtrl accesses your webcam to watch your hand in real-time.' },
            { n: '02', title: 'Detect Hand', desc: 'MediaPipe maps 21 skeletal landmarks on your hand every frame.' },
            { n: '03', title: 'Read Gesture', desc: 'A classifier interprets finger positions into system commands.' },
            { n: '04', title: 'Execute Action', desc: 'PyAutoGUI fires the corresponding system event instantly.' },
          ].map(s => (
            <div key={s.n} className="step-card">
              <div className="step-num">{s.n}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section alt">
        <h2 className="section-title">Features</h2>
        <div className="features">
          {[
            { icon: '⚡', title: 'Real-time Processing', desc: 'Sub-30ms gesture recognition at 30 fps.' },
            { icon: '🎯', title: 'Precision Cursor', desc: 'Smooth interpolated cursor movement with configurable deadzone.' },
            { icon: '🔒', title: 'Privacy First', desc: 'All processing is local. No data ever leaves your machine.' },
            { icon: '🖥', title: 'Cross-platform', desc: 'Works on macOS, Windows, and Linux.' },
            { icon: '🤝', title: 'One-handed', desc: 'Designed for single-hand operation — keep one hand free.' },
            { icon: '🔇', title: 'Volume Control', desc: 'Thumb up/down maps to OS-level volume adjust.' },
          ].map(f => (
            <div key={f.title} className="feat-card">
              <div className="feat-icon">{f.icon}</div>
              <h3 className="feat-title">{f.title}</h3>
              <p className="feat-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Gesture Guide */}
      <section className="section">
        <h2 className="section-title">Gesture Guide</h2>
        <div className="gesture-grid">
          {[
            { icon: '☝️', name: 'Index Finger', action: 'Move Cursor', color: '#00ff88' },
            { icon: '✌️', name: 'Two Fingers', action: 'Scroll Page', color: '#00ccff' },
            { icon: '👍', name: 'Thumb Up', action: 'Volume Up', color: '#ffcc00' },
            { icon: '👎', name: 'Thumb Down', action: 'Volume Down', color: '#ff8800' },
            { icon: '✊', name: 'Fist', action: 'Idle / Pause', color: '#888' },
          ].map(g => (
            <div key={g.name} className="gesture-card" style={{ '--gc': g.color }}>
              <div className="gc-emoji">{g.icon}</div>
              <div className="gc-name">{g.name}</div>
              <div className="gc-arrow">→</div>
              <div className="gc-action" style={{ color: g.color }}>{g.action}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recent gestures */}
      {gestureLog.length > 0 && (
        <section className="section alt">
          <h2 className="section-title">Recent Activity</h2>
          <div className="log">
            {gestureLog.map((entry, i) => (
              <div key={i} className="log-row">
                <span className="log-icon">{gestureMeta[entry.gesture]?.icon || '?'}</span>
                <span className="log-label">{gestureMeta[entry.gesture]?.label || entry.gesture}</span>
                <span className="log-time">{entry.time}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      <footer className="footer">
        <p>AirCtrl — Gesture-Based System Navigation · Built with MediaPipe + Electron</p>
      </footer>
    </div>
  );
}

export default App;
