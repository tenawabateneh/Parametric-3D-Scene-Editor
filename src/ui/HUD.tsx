import React from 'react';

interface HUDProps {
  selectedObject: {
    id: string;
    type: string;
    position: number[];
    rotation?: number[];
  } | null;
}

export const HUD: React.FC<HUDProps> = ({ selectedObject }) => {
  if (!selectedObject) {
    return (
      <div
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '15px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          borderRadius: '8px',
          pointerEvents: 'none',
          fontFamily: 'monospace',
          minWidth: '200px',
        }}
      >
        <div
          style={{ color: '#ffcc00', marginBottom: '8px', fontWeight: 'bold' }}
        >
          Getting Started
        </div>
        <div style={{ fontSize: '12px', lineHeight: '1.4' }}>
          • Click <b>Add Object</b> to spawn
          <br />• Click <b>Object</b> to select
          <br />• Use <b>Gizmos</b> or <b>Arrows</b> to move
        </div>
      </div>
    );
  }

  const [x, y, z] = selectedObject.position.map((v) => v.toFixed(2));
  const [rx, ry, rz] = selectedObject.rotation
    ? selectedObject.rotation.map((v) => ((v * 180) / Math.PI).toFixed(0))
    : ['0', '0', '0'];

  return (
    <div
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '15px',
        background: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        borderRadius: '8px',
        pointerEvents: 'none',
        minWidth: '200px',
        fontFamily: 'monospace',
      }}
    >
      <h3
        style={{
          margin: '0 0 10px 0',
          fontSize: '16px',
          borderBottom: '1px solid #555',
          paddingBottom: '5px',
        }}
      >
        Selection
      </h3>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr',
          gap: '8px',
          fontSize: '14px',
        }}
      >
        <span style={{ color: '#aaa' }}>Type:</span>
        <span>{selectedObject.type}</span>

        <span style={{ color: '#aaa' }}>UUID:</span>
        <span style={{ fontSize: '10px', alignSelf: 'center' }}>
          {selectedObject.id}
        </span>

        <span style={{ color: '#aaa' }}>Pos:</span>
        <span>
          [{x}, {y}, {z}]
        </span>
        <span style={{ color: '#aaa' }}>Rot:</span>
        <span>
          [{rx}°, {ry}°, {rz}°]
        </span>
      </div>

      <div
        style={{
          marginTop: '15px',
          paddingTop: '10px',
          borderTop: '1px solid #555',
        }}
      >
        <h4 style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#ffcc00' }}>
          Controls
        </h4>
        <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
          <div>
            <kbd style={kbdStyle}>←</kbd> <kbd style={kbdStyle}>→</kbd> Move X
          </div>
          <div>
            <kbd style={kbdStyle}>↑</kbd> <kbd style={kbdStyle}>↓</kbd> Move Y
          </div>
          <div>
            <kbd style={kbdStyle}>r</kbd> + <kbd style={kbdStyle}>←</kbd>/
            <kbd style={kbdStyle}>→</kbd> Rotate Y ±45°
          </div>
          <div>
            <kbd style={kbdStyle}>r</kbd> + <kbd style={kbdStyle}>↑</kbd>/
            <kbd style={kbdStyle}>↓</kbd> Rotate X ±45°
          </div>
          <div>
            <kbd style={kbdStyle}>s</kbd> + <kbd style={kbdStyle}>↑</kbd> Scale
            Up
          </div>
          <div>
            <kbd style={kbdStyle}>s</kbd> + <kbd style={kbdStyle}>↓</kbd> Scale
            Down
          </div>
          <div>
            <kbd style={kbdStyle}>Del</kbd> To Hide Object
          </div>
        </div>
      </div>
    </div>
  );
};

const kbdStyle: React.CSSProperties = {
  background: '#444',
  border: '1px solid #666',
  borderRadius: '3px',
  padding: '1px 5px',
  color: '#fff',
  marginRight: '2px',
};
