import React, { useRef, useEffect, useState, CSSProperties } from 'react';

interface DialogProps {
  onClose: () => void,
  top: number | undefined,
  left: number |  undefined
}

const Dialog: React.FC<DialogProps> = ({onClose,top,left}) => {

  const style: CSSProperties = {
    position: 'absolute',
    top: (top || 0),
    left: (left || 0)
  };

  return (
    <div style={style}>
      <span>I am dialog</span>
      {/* Dialog content */}
      <button onClick={onClose}>Close</button>
    </div>
  );
};

export default Dialog;