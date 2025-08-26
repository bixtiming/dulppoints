import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  RotateCcw
} from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';
import { useRewards } from '../contexts/RewardsContext';

interface Game {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  baseReward: number;
  multiplier: number;
  color: string;
}

const Games: React.FC = () => {
  const { updateBalance } = useWallet();
  const { addExperience, updateGameStats } = useRewards();
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameResult, setGameResult] = useState<'win' | 'lose' | null>(null);

  const games: Game[] = [
    {
      id: 'crypto-clicker',
      name: 'Crypto Clicker',
      description: 'Click the crypto symbols as fast as you can!',
      icon: '₿',
      difficulty: 'Easy',
      baseReward: 10,
      multiplier: 1.5,
      color: 'from-crypto-neon to-green-400'
    },
    {
      id: 'memory-match',
      name: 'Memory Match',
      description: 'Find matching crypto pairs to earn points',
      icon: '🎯',
      difficulty: 'Medium',
      baseReward: 25,
      multiplier: 2.0,
      color: 'from-crypto-purple to-purple-400'
    },
    {
      id: 'speed-typer',
      name: 'Speed Typer',
      description: 'Type crypto terms quickly and accurately',
      icon: '⌨️',
      difficulty: 'Hard',
      baseReward: 50,
      multiplier: 3.0,
      color: 'from-crypto-gold to-yellow-400'
    }
  ];

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameActive && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && gameActive) {
      endGame();
    }
    return () => clearTimeout(timer);
  }, [gameActive, timeLeft]);

  const startGame = (game: Game) => {
    setSelectedGame(game);
    setGameActive(true);
    setScore(0);
    setTimeLeft(30);
    setGameResult(null);
  };

  const endGame = async () => {
    setGameActive(false);
    const finalScore = score;
    const reward = Math.floor(finalScore * selectedGame!.multiplier);
    
    if (finalScore > 0) {
      try {
        // Update balance using the new function
        await updateBalance(reward, `${selectedGame!.name} - Score: ${finalScore}`, 'earn');
        
        addExperience(Math.floor(finalScore / 10));
        updateGameStats(finalScore);
        setGameResult('win');
      } catch (error) {
        setGameResult('lose');
      }
    } else {
      setGameResult('lose');
    }
  };

  const resetGame = () => {
    setSelectedGame(null);
    setGameActive(false);
    setScore(0);
    setTimeLeft(30);
    setGameResult(null);
  };

  const handleCryptoClicker = () => {
    if (gameActive && selectedGame?.id === 'crypto-clicker') {
      setScore(score + 1);
    }
  };

  const renderGame = () => {
    if (!selectedGame) return null;

    switch (selectedGame.id) {
      case 'crypto-clicker':
        return (
          <div className="text-center">
            <div className="text-6xl mb-8">₿</div>
            <button
              onClick={handleCryptoClicker}
              className="w-32 h-32 bg-gradient-to-r from-crypto-neon to-green-400 rounded-full text-4xl font-bold text-white hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-crypto-neon/50"
            >
              Click!
            </button>
          </div>
        );
      default:
        return (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎮</div>
            <p className="text-gray-400">Game coming soon!</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Crypto <span className="text-crypto-neon">Games</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Play exciting crypto-themed games and earn DulpPoints. The better you perform, the more you earn!
          </p>
        </motion.div>

        {!selectedGame ? (
          /* Games Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card group hover:scale-105 transition-transform duration-300 cursor-pointer"
                onClick={() => startGame(game)}
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r ${game.color} rounded-xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl sm:text-3xl">{game.icon}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 text-center">{game.name}</h3>
                <p className="text-gray-400 text-center mb-4 px-2 sm:px-0">{game.description}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Difficulty:</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      game.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' :
                      game.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {game.difficulty}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Base Reward:</span>
                    <span className="text-crypto-neon font-semibold">{game.baseReward} pts</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Multiplier:</span>
                    <span className="text-crypto-gold font-semibold">x{game.multiplier}</span>
                  </div>
                </div>

                <button className="w-full mt-6 btn-primary flex items-center justify-center space-x-2 py-3 sm:py-3.5 text-sm sm:text-base">
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Play Now</span>
                </button>
              </motion.div>
            ))}
          </div>
        ) : (
          /* Game Interface */
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="card"
            >
              {/* Game Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${selectedGame.color} rounded-lg flex items-center justify-center`}>
                    <span className="text-2xl">{selectedGame.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedGame.name}</h2>
                    <p className="text-gray-400">{selectedGame.description}</p>
                  </div>
                </div>
                <button
                  onClick={resetGame}
                  className="btn-secondary flex items-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Exit Game</span>
                </button>
              </div>

              {/* Game Stats */}
              <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
                <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-crypto-neon">{score}</div>
                  <div className="text-gray-400 text-sm">Score</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-crypto-gold">{timeLeft}s</div>
                  <div className="text-gray-400 text-sm">Time Left</div>
                </div>
                <div className="text-center p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                  <div className="text-2xl font-bold text-crypto-purple">
                    {Math.floor(score * selectedGame.multiplier)}
                  </div>
                  <div className="text-gray-400 text-sm">Potential Reward</div>
                </div>
              </div>

              {/* Game Area */}
              <div className="min-h-96 flex items-center justify-center">
                {renderGame()}
              </div>

              {/* Game Result */}
              {gameResult && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-8 text-center"
                >
                  {gameResult === 'win' ? (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6">
                      <div className="text-6xl mb-4">🎉</div>
                      <h3 className="text-2xl font-bold text-green-400 mb-2">Congratulations!</h3>
                      <p className="text-green-300 mb-4">
                        You earned {Math.floor(score * selectedGame.multiplier)} DulpPoints!
                      </p>
                      <button
                        onClick={resetGame}
                        className="btn-primary"
                      >
                        Play Again
                      </button>
                    </div>
                  ) : (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6">
                      <div className="text-6xl mb-4">😔</div>
                      <h3 className="text-2xl font-bold text-red-400 mb-2">Game Over</h3>
                      <p className="text-red-300 mb-4">Better luck next time!</p>
                      <button
                        onClick={resetGame}
                        className="btn-primary"
                      >
                        Try Again
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Games;