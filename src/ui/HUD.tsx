import React from 'react';

interface HUDProps {
  selectedObject: {
    id: string;
    type: string;
    position: number[];
  } | null;
}

export const HUD: React.FC<HUDProps> = ({ selectedObject }) => {
  if (!selectedObject) {
    return (
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        padding: '15px',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        borderRadius: '8px',
        pointerEvents: 'none',
        fontFamily: 'monospace'
      }}>
        <div>No Selection</div>
      </div>
    );
  }

  const [x, y, z] = selectedObject.position.map(v => v.toFixed(2));

  return (
    <div style={{
      position: 'absolute',
      top: '20px',
      right: '20px',
      padding: '15px',
      background: 'rgba(0, 0, 0, 0.8)',
      color: 'white',
      borderRadius: '8px',
      pointerEvents: 'none',
      minWidth: '200px',
      fontFamily: 'monospace'
    }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', borderBottom: '1px solid #555', paddingBottom: '5px' }}>
        Selection
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px', fontSize: '14px' }}>
        <span style={{ color: '#aaa' }}>Type:</span>
        <span>{selectedObject.type}</span>

        <span style={{ color: '#aaa' }}>UUID:</span>
        <span style={{ fontSize: '10px', alignSelf: 'center' }}>{selectedObject.id}</span>

        <span style={{ color: '#aaa' }}>Pos:</span>
        <span>[{x}, {y}, {z}]</span>
      </div>
    </div>
  );
};


