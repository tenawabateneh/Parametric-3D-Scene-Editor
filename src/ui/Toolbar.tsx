import React from 'react';

interface ToolbarProps {
  onAdd: (type: 'Box' | 'Sphere' | 'Cylinder') => void;
  onClear: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onAdd, onClear }) => {
  const buttonStyle: React.CSSProperties = {
    padding: '10px 15px',
    background: '#333',
    color: 'white',
    border: '1px solid #555',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '30px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '10px',
      background: 'rgba(0,0,0,0.5)',
      padding: '10px',
      borderRadius: '8px',
    }}>
      <button style={buttonStyle} onClick={() => onAdd('Box')}>+ Box</button>
      <button style={buttonStyle} onClick={() => onAdd('Sphere')}>+ Sphere</button>
      <button style={buttonStyle} onClick={() => onAdd('Cylinder')}>+ Cylinder</button>
      <div style={{ width: '1px', background: '#555', margin: '0 5px' }}></div>
      <button style={{ ...buttonStyle, background: '#522' }} onClick={onClear}>Clear</button>
    </div>
  );
};


