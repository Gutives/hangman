
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameStatus, GameWord, GameStats, SessionResult } from './types';
import { fetchNewWord } from './services/geminiService';
import HangmanVisual from './components/HangmanVisual';
import Keyboard from './components/Keyboard';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameWord | null>(null);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [status, setStatus] = useState<GameStatus>(GameStatus.PLAYING);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Stats & Timer State
  const [seconds, setSeconds] = useState(0);
  const [stats, setStats] = useState<GameStats>({ totalWins: 0, totalLosses: 0, bestTime: null });
  const [lastResult, setLastResult] = useState<SessionResult | null>(null);
  // Fix: Use any for timerRef to avoid NodeJS namespace issues in browser environments
  const timerRef = useRef<any>(null);

  // Load stats from localStorage
  useEffect(() => {
    const savedStats = localStorage.getItem('hangman-stats');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  const saveStats = (newStats: GameStats) => {
    setStats(newStats);
    localStorage.setItem('hangman-stats', JSON.stringify(newStats));
  };

  const startNewGame = useCallback(async () => {
    setIsLoading(true);
    setStatus(GameStatus.PLAYING);
    setGuessedLetters([]);
    setSeconds(0);
    setLastResult(null);
    const newWord = await fetchNewWord();
    setGameState(newWord);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  // Timer logic
  useEffect(() => {
    if (status === GameStatus.PLAYING && !isLoading) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, isLoading]);

  const wrongGuesses = guessedLetters.filter(
    (letter) => gameState && !gameState.word.includes(letter)
  ).length;

  const maxWrong = 6;

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGuess = useCallback((letter: string) => {
    if (status !== GameStatus.PLAYING || guessedLetters.includes(letter)) return;
    
    const newGuesses = [...guessedLetters, letter];
    setGuessedLetters(newGuesses);

    if (gameState) {
      const isWinner = gameState.word.split('').every((l) => newGuesses.includes(l));
      const currentWrong = newGuesses.filter((l) => !gameState.word.includes(l)).length;

      if (isWinner) {
        const result: SessionResult = {
          word: gameState.word,
          time: seconds,
          wrongGuesses: currentWrong,
          status: GameStatus.WON
        };
        setLastResult(result);
        setStatus(GameStatus.WON);
        
        const newBestTime = stats.bestTime === null || seconds < stats.bestTime ? seconds : stats.bestTime;
        saveStats({
          ...stats,
          totalWins: stats.totalWins + 1,
          bestTime: newBestTime
        });
      } else if (currentWrong >= maxWrong) {
        const result: SessionResult = {
          word: gameState.word,
          time: seconds,
          wrongGuesses: currentWrong,
          status: GameStatus.LOST
        };
        setLastResult(result);
        setStatus(GameStatus.LOST);
        saveStats({
          ...stats,
          totalLosses: stats.totalLosses + 1
        });
      }
    }
  }, [guessedLetters, status, gameState, seconds, stats]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const char = e.key.toUpperCase();
      if (/^[A-Z]$/.test(char)) handleGuess(char);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGuess]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-indigo-600 font-semibold text-lg animate-pulse">Gemini가 새 단어를 준비 중입니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8 flex items-center justify-center">
      <div className="max-w-6xl w-full flex flex-col gap-6">
        
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-3xl shadow-md border border-slate-200">
           <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2 mb-4 md:mb-0">
             <span className="bg-indigo-600 text-white p-2 rounded-lg text-sm">AI</span>
             Gemini Hangman
           </h1>
           <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                <div className="px-3 py-1 bg-green-50 rounded-full text-xs font-bold text-green-700 border border-green-100">WINS: {stats.totalWins}</div>
                <div className="px-3 py-1 bg-red-50 rounded-full text-xs font-bold text-red-700 border border-red-100">LOSS: {stats.totalLosses}</div>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Session</span>
                <span className="text-xl font-mono font-bold text-indigo-600 leading-none">{formatTime(seconds)}</span>
              </div>
           </div>
        </div>

        {/* Main Game Area */}
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Panel: Gallows & Word (Status under Gallows) */}
          <div className="lg:flex-1 bg-white p-8 rounded-3xl shadow-xl border border-slate-200 flex flex-col items-center">
            <div className="w-full max-w-sm mb-6">
              <HangmanVisual wrongGuesses={wrongGuesses} />
            </div>

            {/* Status Message Directly Under Gallows */}
            <div className="h-14 flex items-center justify-center mb-6">
              {status !== GameStatus.PLAYING ? (
                <div className={`text-4xl font-black tracking-tight animate-in zoom-in duration-300 ${status === GameStatus.WON ? 'text-green-600' : 'text-red-600'}`}>
                  {status === GameStatus.WON ? '🎉 YOU WON!' : '💀 GAME OVER'}
                </div>
              ) : (
                <div className="text-slate-400 font-medium italic text-sm">추측한 철자가 맞을까요?</div>
              )}
            </div>

            {/* Word Slots Under Status */}
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {gameState?.word.split('').map((letter, idx) => (
                <div
                  key={idx}
                  className={`w-10 h-12 sm:w-12 sm:h-14 border-b-4 flex items-center justify-center text-3xl sm:text-4xl font-mono font-bold transition-all duration-500
                    ${guessedLetters.includes(letter) || status === GameStatus.LOST ? 'border-indigo-500 text-slate-800 scale-100' : 'border-slate-200 text-transparent scale-90'}
                    ${status === GameStatus.LOST && !guessedLetters.includes(letter) ? 'text-red-400 border-red-200' : ''}
                  `}
                >
                  {guessedLetters.includes(letter) || status === GameStatus.LOST ? letter : ''}
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex gap-4">
               <div className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                 Mistakes: <span className="text-red-500 text-sm">{wrongGuesses} / {maxWrong}</span>
               </div>
            </div>
          </div>

          {/* Right Panel: Hint & Stats (Fixed size to prevent layout shift) */}
          <div className="lg:w-[400px] bg-white p-8 rounded-3xl shadow-xl border border-slate-200 flex flex-col h-[500px] lg:h-auto overflow-hidden">
            <h2 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">Word Context</h2>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-slate-700 leading-relaxed text-xl italic font-medium whitespace-pre-wrap">
                "{gameState?.hint}"
              </p>
            </div>

            {status !== GameStatus.PLAYING && (
              <div className="mt-6 p-5 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-4 animate-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-400 uppercase">Results</span>
                  <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-1 rounded shadow-sm">BEST: {stats.bestTime ? formatTime(stats.bestTime) : '--:--'}</span>
                </div>
                <div className="flex justify-between items-end">
                   <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Correct Word</div>
                      <div className="text-2xl font-black text-indigo-900 tracking-wider">{gameState?.word}</div>
                   </div>
                   <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-bold uppercase mb-0.5">Time</div>
                      <div className="text-lg font-bold text-indigo-900">{formatTime(lastResult?.time || 0)}</div>
                   </div>
                </div>
                <button
                  onClick={startNewGame}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                >
                  다음 게임 시작
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Panel: Alphabet Keyboard (Full Width) */}
        <div className={`bg-white p-8 rounded-3xl shadow-xl border border-slate-200 transition-all duration-500 ${status !== GameStatus.PLAYING ? 'opacity-30 grayscale' : 'opacity-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Select Letter</h2>
            <div className="text-[10px] text-slate-300 font-bold italic">KEYBOARD INPUT SUPPORTED</div>
          </div>
          <Keyboard
            guessedLetters={guessedLetters}
            word={gameState?.word || ''}
            disabled={status !== GameStatus.PLAYING}
            onGuess={handleGuess}
          />
        </div>

      </div>
    </div>
  );
};

export default App;
