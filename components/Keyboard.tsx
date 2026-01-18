
import React from 'react';
import { ALPHABET } from '../types';

interface KeyboardProps {
  guessedLetters: string[];
  word: string;
  disabled: boolean;
  onGuess: (letter: string) => void;
}

const Keyboard: React.FC<KeyboardProps> = ({ guessedLetters, word, disabled, onGuess }) => {
  return (
    <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-13 gap-3">
      {ALPHABET.map((letter) => {
        const isGuessed = guessedLetters.includes(letter);
        const isCorrect = isGuessed && word.includes(letter);
        const isWrong = isGuessed && !word.includes(letter);

        return (
          <button
            key={letter}
            onClick={() => onGuess(letter)}
            disabled={disabled || isGuessed}
            className={`
              h-12 sm:h-14 flex items-center justify-center rounded-xl font-bold text-lg transition-all duration-200
              ${isCorrect ? 'bg-green-500 text-white shadow-lg scale-95 ring-2 ring-green-200' : ''}
              ${isWrong ? 'bg-red-500 text-white opacity-40 grayscale-[0.5]' : ''}
              ${!isGuessed ? 'bg-slate-50 text-slate-700 border border-slate-100 hover:bg-white hover:shadow-md hover:border-indigo-300 hover:text-indigo-600 active:scale-95' : ''}
              disabled:cursor-not-allowed
            `}
          >
            {letter}
          </button>
        );
      })}
    </div>
  );
};

export default Keyboard;
