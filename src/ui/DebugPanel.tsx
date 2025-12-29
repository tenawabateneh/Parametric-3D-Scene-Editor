import React, { useEffect, useState } from 'react';
import type { Engine } from '../engine/Engine';

interface DebugPanelProps {
  engineRef: React.RefObject<Engine | null>;
}

type RendererInfo = {
  memory: { geometries: number; textures: number; programs?: number };
  render: { calls: number };
};

type Snapshot = {
  i: number;
  memory: { geometries: number; textures: number; programs?: number };
  render: { calls: number };
};

export const DebugPanel: React.FC<DebugPanelProps> = ({ engineRef }) => {
  const [info, setInfo] = useState<RendererInfo | null>(null);
  const [running, setRunning] = useState(false);
  const [snapshots, setSnapshots] = useState<Snapshot[] | null>(null);

  const refresh = () => {
    const e = engineRef.current;
    if (!e) return;
    setInfo(e.getRendererInfo());
  };

  useEffect(() => {
    const t = setInterval(refresh, 1000);
    return () => clearInterval(t);

  }, []);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('leakTest') === '1') {
        const it = parseInt(params.get('leakIterations') ?? '', 10) || 200;
        const delay = parseInt(params.get('leakDelay') ?? '', 10) || 10;

        const start = Date.now();
        const poll = async () => {
          if (engineRef.current) {
            await runLeakWithParams(it, delay);
            return;
          }
          if (Date.now() - start > 10000) return;
          setTimeout(poll, 250);
        };
        poll();
      }
    } catch {

    }

  }, []);

  const downloadJSON = (
    obj: unknown,
    filename = `leak-test-${Date.now()}.json`
  ) => {
    try {
      const blob = new Blob([JSON.stringify(obj, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download JSON', err);
    }
  };

  const tryPostResults = async (results: {
    snapshots: Snapshot[];
    final: RendererInfo;
  }) => {
    try {
      await fetch('http://localhost:54321/leak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(results),
      });
      return true;
    } catch (err) {

      return false;
    }
  };

  const runLeakWithParams = async (iterations = 200, delayMs = 10) => {
    const e = engineRef.current;
    if (!e) return;
    setRunning(true);
    setSnapshots(null);
    const res = await e.runLeakTest(iterations, delayMs);
    setSnapshots(res.snapshots.slice(-5));
    setInfo(res.final);

    const ok = await tryPostResults(res);

    const report = {
      meta: {
        runAt: new Date().toISOString(),
        iterations,
        delayMs,
        postedToReceiver: ok,
      },
      snapshots: res.snapshots,
      final: res.final,
    };

    try {
      (window as any).__leakTestReport = report;
    } catch {

    }

    downloadJSON(report, `leak-test-${Date.now()}.json`);

    setRunning(false);
  };

  const runLeak = () => runLeakWithParams(200, 10);

  const downloadLastReport = () => {
    if (!snapshots || !info) {
      alert('No report available; run a leak test first.');
      return;
    }
    const report = {
      meta: { downloadedAt: new Date().toISOString() },
      snapshots,
      final: info,
    };
    downloadJSON(report, `leak-test-last-${Date.now()}.json`);
  };

  const runClearTest = async () => {
    const e = engineRef.current;
    if (!e) {
      alert('Engine not initialized');
      return;
    }

    setRunning(true);
    try {
      const res = await e.testClear(12, 20);

      const report = {
        meta: { runAt: new Date().toISOString(), added: res.added },
        before: res.before,
        after: res.after,
      };
      downloadJSON(report, `clear-test-${Date.now()}.json`);

      setSnapshots([
        { i: -1, memory: res.before.memory, render: res.before.render },
        { i: -2, memory: res.after.memory, render: res.after.render },
      ]);
      setInfo(res.after);
      alert(
        `Clear Test finished. Geometries before: ${res.before.memory.geometries}, after: ${res.after.memory.geometries}`
      );
    } catch (err) {
      console.error('Clear test failed', err);
      alert('Clear test failed; check console.');
    } finally {
      setRunning(false);
    }
  };

  const handleExport = () => {
    const e = engineRef.current;
    if (!e) return;
    const state = e.exportState();
    downloadJSON(state, `scene-export-${Date.now()}.json`);
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: '20px',
        top: '20px',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '6px',
        fontFamily: 'monospace',
        fontSize: '12px',
        zIndex: 1000,
        minWidth: '220px',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <strong>Debug</strong>
        <div style={{ display: 'flex', gap: '6px' }}>
          <button onClick={refresh} style={{ padding: '4px 6px' }}>
            Refresh
          </button>
          <button
            onClick={runLeak}
            disabled={running}
            style={{ padding: '4px 6px' }}
          >
            {running ? 'Running…' : 'Leak Test'}
          </button>
          <button onClick={downloadLastReport} style={{ padding: '4px 6px' }}>
            Download Results
          </button>
          <button onClick={handleExport} style={{ padding: '4px 6px' }}>
            Export JSON
          </button>
          <button onClick={runClearTest} style={{ padding: '4px 6px' }}>
            Run Clear Test
          </button>
        </div>
      </div>

      <div style={{ marginTop: '8px' }}>
        {info ? (
          <div>
            <div>Geometries: {info.memory.geometries}</div>
            <div>Textures: {info.memory.textures}</div>
            <div>Programs: {info.memory.programs}</div>
            <div style={{ marginTop: '6px', color: '#aaa' }}>
              Draws: {info.render.calls}
            </div>
          </div>
        ) : (
          <div style={{ color: '#888' }}>No renderer info</div>
        )}

        {snapshots && (
          <div style={{ marginTop: '8px' }}>
            <div style={{ color: '#aaa' }}>Last snapshots (tail):</div>
            <div style={{ maxHeight: '120px', overflow: 'auto' }}>
              {snapshots.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    borderTop: '1px solid #222',
                    paddingTop: '6px',
                    marginTop: '6px',
                  }}
                >
                  <div>
                    #{s.i} — Geoms: {s.memory.geometries}, Tex:{' '}
                    {s.memory.textures}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


