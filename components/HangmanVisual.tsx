
import React from 'react';

interface HangmanVisualProps {
  wrongGuesses: number;
}

const HangmanVisual: React.FC<HangmanVisualProps> = ({ wrongGuesses }) => {
  const parts = [
    // Head
    <circle key="head" cx="175" cy="80" r="20" stroke="black" strokeWidth="4" fill="none" />,
    // Body
    <line key="body" x1="175" y1="100" x2="175" y2="150" stroke="black" strokeWidth="4" />,
    // Left Arm
    <line key="larm" x1="175" y1="120" x2="145" y2="100" stroke="black" strokeWidth="4" />,
    // Right Arm
    <line key="rarm" x1="175" y1="120" x2="205" y2="100" stroke="black" strokeWidth="4" />,
    // Left Leg
    <line key="lleg" x1="175" y1="150" x2="150" y2="190" stroke="black" strokeWidth="4" />,
    // Right Leg
    <line key="rleg" x1="175" y1="150" x2="200" y2="190" stroke="black" strokeWidth="4" />,
  ];

  return (
    <div className="w-full flex justify-center items-center bg-white rounded-xl shadow-inner p-4 border-2 border-slate-100">
      <svg viewBox="0 0 250 250" className="w-full max-w-[250px] h-auto">
        {/* Gallows */}
        <line x1="20" y1="230" x2="120" y2="230" stroke="black" strokeWidth="4" />
        <line x1="70" y1="230" x2="70" y2="30" stroke="black" strokeWidth="4" />
        <line x1="70" y1="30" x2="175" y2="30" stroke="black" strokeWidth="4" />
        <line x1="175" y1="30" x2="175" y2="60" stroke="black" strokeWidth="4" />
        
        {/* Person parts based on wrong guesses */}
        {parts.slice(0, wrongGuesses)}
      </svg>
    </div>
  );
};

export default HangmanVisual;
