'use client';

/**
 * MiniGames Component
 * 
 * Collection of fun mini-games users can play to earn points
 * Games include: Memory Match, Reaction Time, Number Guess, etc.
 */

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/client';

// Helper to generate random numbers (avoids React strict mode warnings)
const getRandomInt = (min: number, max: number) => {
  return min + Math.floor((max - min) * Math.random());
};

type GameType = 'memory' | 'reaction' | 'number-guess' | 'pattern' | null;

interface GameScore {
  score: number;
  pointsEarned: number;
}

export default function MiniGames({ onPointsEarned }: { onPointsEarned?: () => void }) {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [winData, setWinData] = useState({ score: 0, points: 0, game: '' });

  const games = [
    {
      id: 'memory' as GameType,
      name: 'Memory Match',
      icon: '🧠',
      description: 'Match pairs of cards',
      color: 'from-purple-500 to-purple-600',
    },
    {
      id: 'reaction' as GameType,
      name: 'Reaction Test',
      icon: '⚡',
      description: 'Test your reflexes',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      id: 'number-guess' as GameType,
      name: 'Number Guess',
      icon: '🎲',
      description: 'Guess the number',
      color: 'from-blue-500 to-blue-600',
    },
    {
      id: 'pattern' as GameType,
      name: 'Pattern Match',
      icon: '🎨',
      description: 'Remember the pattern',
      color: 'from-pink-500 to-pink-600',
    },
  ];

  const handleGameComplete = async (score: number, gameType: GameType) => {
    if (!gameType) return;
    
    try {
      const data = await apiFetch<GameScore>('/games/score', {
        method: 'POST',
        body: JSON.stringify({ gameType, score }),
      });
      
      const gameNames = {
        'memory': '🧠 Memory Match',
        'reaction': '⚡ Reaction Test',
        'number-guess': '🎲 Number Guess',
        'pattern': '🎨 Pattern Match'
      };
      
      setWinData({
        score,
        points: data.pointsEarned,
        game: gameNames[gameType] || 'Game'
      });
      setShowWinModal(true);
      
      if (onPointsEarned) onPointsEarned();
    } catch (error) {
      console.error('Failed to save game score:', error);
    }
  };

  const closeWinModal = () => {
    setShowWinModal(false);
    setActiveGame(null);
    setGameStarted(false);
  };

  if (activeGame && gameStarted) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <button
          onClick={() => {
            setActiveGame(null);
            setGameStarted(false);
          }}
          className="mb-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
        >
          ← Back to Games
        </button>
        
        {activeGame === 'memory' && <MemoryGame onComplete={(score) => handleGameComplete(score, activeGame)} />}
        {activeGame === 'reaction' && <ReactionGame onComplete={(score) => handleGameComplete(score, activeGame)} />}
        {activeGame === 'number-guess' && <NumberGuessGame onComplete={(score) => handleGameComplete(score, activeGame)} />}
        {activeGame === 'pattern' && <PatternGame onComplete={(score) => handleGameComplete(score, activeGame)} />}
      </div>
    );
  }

  return (
    <>
      {showWinModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform animate-scaleIn">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                Victory!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {winData.game}
              </p>
              
              <div className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900 dark:to-blue-900 rounded-xl p-6 mb-6">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Final Score</div>
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                  {winData.score}
                </div>
                
                <div className="border-t border-gray-300 dark:border-gray-600 pt-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Points Earned</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                    <span>💰</span>
                    <span>+{winData.points}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={closeWinModal}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          🎮 Mini Games
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Play fun games and earn points based on your performance!
        </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((game) => (
          <button
            key={game.id}
            onClick={() => {
              setActiveGame(game.id);
              setGameStarted(true);
            }}
            className={`relative overflow-hidden rounded-lg p-6 text-left transition-all hover:scale-105 hover:shadow-xl group`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${game.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
            <div className="relative z-10 text-white">
              <div className="text-4xl mb-2">{game.icon}</div>
              <h3 className="text-xl font-bold mb-1">{game.name}</h3>
              <p className="text-sm opacity-90">{game.description}</p>
              <div className="mt-4 flex items-center gap-2">
                <span className="text-xs bg-white/20 px-2 py-1 rounded">Play Now →</span>
              </div>
            </div>
          </button>
        ))}
      </div>
      </div>
    </>
  );
}

// Memory Match Game
function MemoryGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [cards, setCards] = useState<string[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [combo, setCombo] = useState(0);

  useEffect(() => {
    if (difficulty && timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && difficulty && !gameOver) {
      setTimeout(() => {
        setGameOver(true);
        const score = Math.floor((matched.length / cards.length) * 50);
        onComplete(score);
      }, 500);
    }
  }, [timeLeft, difficulty, gameOver, cards.length, matched.length, onComplete]);

  const startGame = (level: 'easy' | 'medium' | 'hard') => {
    const configs = {
      easy: { pairs: 6, time: 60, emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇'] },
      medium: { pairs: 8, time: 90, emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒'] },
      hard: { pairs: 10, time: 120, emojis: ['🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍒', '🥝', '🍑'] }
    };
    
    const config = configs[level];
    const shuffled = [...config.emojis, ...config.emojis].sort(() => 0.5 - (Math.random()));
    
    setDifficulty(level);
    setCards(shuffled);
    setTimeLeft(config.time);
    setMoves(0);
    setMatched([]);
    setFlipped([]);
    setCombo(0);
  };

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || flipped.includes(index) || matched.includes(index) || gameOver) return;

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      if (cards[newFlipped[0]] === cards[newFlipped[1]]) {
        const newMatched = [...matched, ...newFlipped];
        const newCombo = combo + 1;
        setMatched(newMatched);
        setCombo(newCombo);
        setFlipped([]);
        
        if (newMatched.length === cards.length) {
          const baseScore = difficulty === 'easy' ? 50 : difficulty === 'medium' ? 100 : 150;
          const timeBonus = Math.floor(timeLeft * 0.5);
          const comboBonus = newCombo * 5;
          const movesPenalty = moves;
          const score = Math.max(baseScore + timeBonus + comboBonus - movesPenalty, 20);
          
          setTimeout(() => {
            setGameOver(true);
            onComplete(score);
          }, 500);
        }
      } else {
        setCombo(0);
        setTimeout(() => setFlipped([]), 1000);
      }
    }
  };

  if (!difficulty) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">🧠 Memory Match</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Choose your difficulty level:</p>
        <div className="space-y-3">
          {[
            { level: 'easy' as const, pairs: 6, time: 60, color: 'from-green-500 to-green-600' },
            { level: 'medium' as const, pairs: 8, time: 90, color: 'from-yellow-500 to-yellow-600' },
            { level: 'hard' as const, pairs: 10, time: 120, color: 'from-red-500 to-red-600' }
          ].map(({ level, pairs, time, color }) => (
            <button
              key={level}
              onClick={() => startGame(level)}
              className={`w-full bg-gradient-to-r ${color} text-white py-4 rounded-lg font-bold hover:scale-105 transition-transform`}
            >
              {level.toUpperCase()} - {pairs} pairs ({time}s)
            </button>
          ))}
        </div>
      </div>
    );
  }

  const gridCols = difficulty === 'hard' ? 'grid-cols-5' : 'grid-cols-4';

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">🧠 Memory Match</h3>
          {combo > 1 && <span className="text-sm text-green-600 dark:text-green-400">🔥 Combo x{combo}</span>}
        </div>
        <div className="text-right">
          <div className="text-gray-600 dark:text-gray-400">⏱️ {timeLeft}s</div>
          <div className="text-sm text-gray-500">Moves: {moves}</div>
        </div>
      </div>
      <div className={`grid ${gridCols} gap-2`}>
        {cards.map((card, index) => (
          <button
            key={index}
            onClick={() => handleCardClick(index)}
            disabled={gameOver}
            className={`aspect-square rounded-lg text-3xl flex items-center justify-center transition-all transform hover:scale-105 ${
              flipped.includes(index) || matched.includes(index)
                ? matched.includes(index) 
                  ? 'bg-green-100 dark:bg-green-900' 
                  : 'bg-white dark:bg-gray-700'
                : 'bg-gradient-to-br from-blue-500 to-purple-600'
            }`}
          >
            {flipped.includes(index) || matched.includes(index) ? card : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}

// Reaction Time Game
function ReactionGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [status, setStatus] = useState<'waiting' | 'ready' | 'click' | 'too-soon'>('waiting');
  const [startTime, setStartTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const maxRounds = 5;

  useEffect(() => {
    if (status === 'waiting') {
      const timeout = setTimeout(() => {
        setStatus('click');
        setStartTime(Date.now());
      }, getRandomInt(2000, 5000));
      return () => clearTimeout(timeout);
    }
  }, [status]);

  const handleClick = () => {
    if (status === 'waiting') {
      setStatus('too-soon');
      setTimeout(() => setStatus('ready'), 2000);
    } else if (status === 'click') {
      const reactionTime = Date.now() - startTime;
      const newTimes = [...reactionTimes, reactionTime];
      setReactionTimes(newTimes);
      
      if (round + 1 >= maxRounds) {
        const avgTime = newTimes.reduce((a, b) => a + b, 0) / newTimes.length;
        const score = Math.max(150 - Math.floor(avgTime / 10), 30);
        onComplete(score);
      } else {
        setRound(round + 1);
        setStatus('ready');
        setTimeout(() => setStatus('waiting'), 1000);
      }
    }
  };

  return (
    <div className="text-center">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">⚡ Reaction Test</h3>
      <div className="text-gray-600 dark:text-gray-400 mb-4">
        Round {round + 1} of {maxRounds}
      </div>
      
      <button
        onClick={handleClick}
        className={`w-full h-64 rounded-lg text-2xl font-bold transition-all ${
          status === 'click'
            ? 'bg-green-500 text-white'
            : status === 'too-soon'
            ? 'bg-red-500 text-white'
            : status === 'ready'
            ? 'bg-yellow-500 text-white'
            : 'bg-gray-300 dark:bg-gray-700 text-gray-800 dark:text-white'
        }`}
      >
        {status === 'waiting' && 'Wait...'}
        {status === 'ready' && 'Get Ready...'}
        {status === 'click' && 'CLICK NOW!'}
        {status === 'too-soon' && 'Too Soon!'}
      </button>

      {reactionTimes.length > 0 && (
        <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
          Latest: {reactionTimes[reactionTimes.length - 1]}ms
        </div>
      )}
    </div>
  );
}

// Number Guess Game
function NumberGuessGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(0);
  const [range, setRange] = useState({ min: 1, max: 100 });
  const [hint, setHint] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [guessHistory, setGuessHistory] = useState<number[]>([]);

  const startGame = (level: 'easy' | 'medium' | 'hard') => {
    const configs = {
      easy: { min: 1, max: 50, attempts: 10 },
      medium: { min: 1, max: 100, attempts: 8 },
      hard: { min: 1, max: 200, attempts: 6 }
    };
    
    const config = configs[level];
    const target = getRandomInt(config.min, config.max + 1);
    
    setDifficulty(level);
    setTargetNumber(target);
    setRange({ min: config.min, max: config.max });
    setMaxAttempts(config.attempts);
    setHint(`Guess a number between ${config.min} and ${config.max}`);
    setAttempts(0);
    setGuessHistory([]);
    setGameOver(false);
  };

  const getDistance = (num: number) => {
    const diff = Math.abs(num - targetNumber);
    const percentage = (diff / (range.max - range.min)) * 100;
    
    if (percentage < 5) return '🔥 Very Hot!';
    if (percentage < 15) return '♨️ Hot!';
    if (percentage < 30) return '🌡️ Warm';
    if (percentage < 50) return '❄️ Cold';
    return '🧊 Very Cold!';
  };

  const handleGuess = () => {
    const num = parseInt(guess);
    if (isNaN(num) || num < range.min || num > range.max) {
      setHint(`Please enter a number between ${range.min} and ${range.max}`);
      return;
    }

    const newAttempts = attempts + 1;
    const newHistory = [...guessHistory, num];
    setAttempts(newAttempts);
    setGuessHistory(newHistory);

    if (num === targetNumber) {
      const baseScore = difficulty === 'easy' ? 40 : difficulty === 'medium' ? 80 : 120;
      const attemptsBonus = (maxAttempts - newAttempts) * 10;
      const score = Math.max(baseScore + attemptsBonus, 20);
      setHint(`🎉 Perfect! The number was ${targetNumber}!`);
      setGameOver(true);
      setTimeout(() => onComplete(score), 1500);
    } else if (newAttempts >= maxAttempts) {
      setHint(`❌ Game Over! The number was ${targetNumber}`);
      setGameOver(true);
      setTimeout(() => onComplete(10), 1500);
    } else {
      const direction = num < targetNumber ? '📈 Higher!' : '📉 Lower!';
      const distance = getDistance(num);
      setHint(`${direction} ${distance} (${maxAttempts - newAttempts} attempts left)`);
    }
    setGuess('');
  };

  if (!difficulty) {
    return (
      <div className="text-center max-w-md mx-auto">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">🎲 Number Guess</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Choose your difficulty level:</p>
        <div className="space-y-3">
          {[
            { level: 'easy' as const, range: '1-50', attempts: 10, color: 'from-green-500 to-green-600' },
            { level: 'medium' as const, range: '1-100', attempts: 8, color: 'from-yellow-500 to-yellow-600' },
            { level: 'hard' as const, range: '1-200', attempts: 6, color: 'from-red-500 to-red-600' }
          ].map(({ level, range, attempts, color }) => (
            <button
              key={level}
              onClick={() => startGame(level)}
              className={`w-full bg-gradient-to-r ${color} text-white py-4 rounded-lg font-bold hover:scale-105 transition-transform`}
            >
              {level.toUpperCase()} - Range: {range} ({attempts} attempts)
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center max-w-md mx-auto">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">🎲 Number Guess</h3>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
        <span>Range: {range.min}-{range.max}</span>
        <span>Attempts: {attempts}/{maxAttempts}</span>
      </div>
      
      <div className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4 h-16 flex items-center justify-center">
        {hint}
      </div>

      {guessHistory.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 justify-center">
          {guessHistory.map((g, i) => (
            <span
              key={i}
              className={`px-3 py-1 rounded-full text-sm ${
                g < targetNumber
                  ? 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
              }`}
            >
              {g}
            </span>
          ))}
        </div>
      )}

      <input
        type="number"
        value={guess}
        onChange={(e) => setGuess(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleGuess()}
        disabled={gameOver}
        placeholder={`Enter ${range.min}-${range.max}`}
        className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-center text-xl mb-4 focus:outline-none focus:border-blue-500"
      />

      <button
        onClick={handleGuess}
        disabled={gameOver || !guess}
        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50"
      >
        Guess!
      </button>
    </div>
  );
}

// Pattern Match Game
function PatternGame({ onComplete }: { onComplete: (score: number) => void }) {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);
  const [pattern, setPattern] = useState<number[]>([]);
  const [userPattern, setUserPattern] = useState<number[]>([]);
  const [isShowing, setIsShowing] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  const [round, setRound] = useState(1);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [speed, setSpeed] = useState(600);

  const startGame = (level: 'easy' | 'medium' | 'hard') => {
    setDifficulty(level);
    setRound(1);
    setLives(level === 'easy' ? 3 : level === 'medium' ? 2 : 1);
    setSpeed(level === 'easy' ? 800 : level === 'medium' ? 600 : 400);
    setPattern([]);
    setGameOver(false);
    
    setTimeout(() => {
      const initialPattern = [getRandomInt(0, 4)];
      setPattern(initialPattern);
      setUserPattern([]);
      showPattern(initialPattern, level === 'easy' ? 800 : level === 'medium' ? 600 : 400);
    }, 500);
  };

  const showPattern = async (patternToShow: number[], displaySpeed: number) => {
    setIsShowing(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    for (const index of patternToShow) {
      setActiveButton(index);
      await new Promise(resolve => setTimeout(resolve, displaySpeed * 0.6));
      setActiveButton(null);
      await new Promise(resolve => setTimeout(resolve, displaySpeed * 0.4));
    }
    setIsShowing(false);
  };

  const handleButtonClick = (index: number) => {
    if (isShowing || gameOver) return;

    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);
    setActiveButton(index);
    setTimeout(() => setActiveButton(null), 200);

    // Check if correct
    if (pattern[newUserPattern.length - 1] !== index) {
      const newLives = lives - 1;
      setLives(newLives);
      
      if (newLives <= 0) {
        setGameOver(true);
        const baseScore = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 30 : 40;
        const score = Math.min(baseScore * round, 150);
        setTimeout(() => onComplete(score), 1000);
      } else {
        setUserPattern([]);
        setTimeout(() => showPattern(pattern, speed), 1000);
      }
      return;
    }

    // Check if round complete
    if (newUserPattern.length === pattern.length) {
      const newRound = round + 1;
      setRound(newRound);
      
      // Increase difficulty every 3 rounds
      const newSpeed = newRound % 3 === 0 ? Math.max(speed - 50, 200) : speed;
      setSpeed(newSpeed);
      
      setTimeout(() => {
        const newPattern = [...pattern, getRandomInt(0, 4)];
        setPattern(newPattern);
        setUserPattern([]);
        showPattern(newPattern, newSpeed);
      }, 1000);
    }
  };

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
  const colorNames = ['🔴', '🔵', '🟢', '🟡'];

  if (!difficulty) {
    return (
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">🎨 Pattern Match</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Choose your difficulty level:</p>
        <div className="space-y-3">
          {[
            { level: 'easy' as const, lives: 3, speed: 'Slow', color: 'from-green-500 to-green-600' },
            { level: 'medium' as const, lives: 2, speed: 'Normal', color: 'from-yellow-500 to-yellow-600' },
            { level: 'hard' as const, lives: 1, speed: 'Fast', color: 'from-red-500 to-red-600' }
          ].map(({ level, lives, speed, color }) => (
            <button
              key={level}
              onClick={() => startGame(level)}
              className={`w-full bg-gradient-to-r ${color} text-white py-4 rounded-lg font-bold hover:scale-105 transition-transform`}
            >
              {level.toUpperCase()} - {lives} {lives === 1 ? 'Life' : 'Lives'} ({speed})
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">🎨 Pattern Match</h3>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
        <span>Round: {round}</span>
        <span>Lives: {'❤️'.repeat(lives)}</span>
      </div>

      {isShowing && (
        <div className="mb-4 text-blue-600 dark:text-blue-400 font-semibold animate-pulse">
          Watch the pattern...
        </div>
      )}

      {!isShowing && !gameOver && userPattern.length < pattern.length && (
        <div className="mb-4 text-green-600 dark:text-green-400 font-semibold">
          Your turn! ({userPattern.length}/{pattern.length})
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-4">
        {[0, 1, 2, 3].map((index) => (
          <button
            key={index}
            onClick={() => handleButtonClick(index)}
            disabled={isShowing || gameOver}
            className={`aspect-square rounded-lg ${colors[index]} ${
              activeButton === index ? 'opacity-100 scale-95 ring-4 ring-white' : 'opacity-70'
            } transition-all hover:opacity-100 hover:scale-105 disabled:cursor-not-allowed text-6xl flex items-center justify-center`}
          >
            {colorNames[index]}
          </button>
        ))}
      </div>

      {gameOver && (
        <div className="mt-4 text-red-600 dark:text-red-400 font-bold text-lg">
          🎮 Game Over! You reached round {round}!
        </div>
      )}
    </div>
  );
}
