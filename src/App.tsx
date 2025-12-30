import { useEffect, useRef, useState } from 'react';
import { Engine } from './engine/Engine';
import { HUD } from './ui/HUD';
import { Toolbar } from './ui/Toolbar';
import { DebugPanel } from './ui/DebugPanel';
import './index.css';

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const [selectedObject, setSelectedObject] = useState<{
    id: string;
    type: string;
    position: number[];
    rotation?: number[];
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new Engine(containerRef.current);
    engineRef.current = engine;

    engine.onObjectSelect = (data) => {
      setSelectedObject(data);
    };

    // Live update selectedObject position/rotation on transform
    engine.transform.onTransformChange = () => {
      const obj = engine.transform.controls.object;
      if (obj) {
        setSelectedObject((sel) =>
          sel && sel.id === obj.userData.id
            ? {
                ...sel,
                position: obj.position.toArray(),
                rotation: [obj.rotation.x, obj.rotation.y, obj.rotation.z],
              }
            : sel
        );
      }
      // Also update scene state and localStorage
      const state = engine.exportState();
      localStorage.setItem('scene', JSON.stringify(state));
    };

    const saved = localStorage.getItem('scene');
    if (saved) {
      try {
        engine.loadState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load state', e);
      }
    }

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const handleAdd = (type: 'Box' | 'Sphere' | 'Cylinder') => {
    engineRef.current?.addPrimitive(type);
  };

  const handleClear = () => {
    if (confirm('Clear Scene?')) {
      engineRef.current?.clear();
      localStorage.removeItem('scene');
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      <HUD selectedObject={selectedObject} />
      <Toolbar onAdd={handleAdd} onClear={handleClear} />
      <DebugPanel engineRef={engineRef} />
    </div>
  );
}

export default App;
