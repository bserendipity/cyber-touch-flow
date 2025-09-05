import { useState, useEffect, useCallback } from "react";
import { GameButton } from "./GameButton";
import { ProgressBar } from "./ProgressBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, Trophy } from "lucide-react";
import { toast } from "sonner";

interface GameState {
  stage: number;
  score: number;
  lives: number;
  activeButtons: Set<number>;
  gameStatus: "idle" | "playing" | "waiting" | "gameOver" | "completed";
  timeLeft: number;
  sequence: number[];
  playerSequence: number[];
}

const GRID_SIZE = 16; // 4x4 grid
const STAGES = 5;
const INITIAL_LIVES = 3;
const STAGE_TIME = 10; // seconds per stage

export const CyberGrid = () => {
  const [gameState, setGameState] = useState<GameState>({
    stage: 1,
    score: 0,
    lives: INITIAL_LIVES,
    activeButtons: new Set(),
    gameStatus: "idle",
    timeLeft: STAGE_TIME,
    sequence: [],
    playerSequence: []
  });

  const generateSequence = useCallback((stage: number) => {
    const length = Math.min(stage + 2, 8); // Increase difficulty
    const sequence = [];
    for (let i = 0; i < length; i++) {
      sequence.push(Math.floor(Math.random() * GRID_SIZE));
    }
    return sequence;
  }, []);

  const showSequence = useCallback((sequence: number[]) => {
    setGameState(prev => ({ ...prev, gameStatus: "waiting", activeButtons: new Set() }));
    
    sequence.forEach((buttonId, index) => {
      setTimeout(() => {
        setGameState(prev => ({ 
          ...prev, 
          activeButtons: new Set([buttonId])
        }));
        
        setTimeout(() => {
          setGameState(prev => ({ 
            ...prev, 
            activeButtons: new Set()
          }));
        }, 400);
      }, index * 600);
    });

    setTimeout(() => {
      setGameState(prev => ({ 
        ...prev, 
        gameStatus: "playing",
        timeLeft: STAGE_TIME
      }));
    }, sequence.length * 600 + 500);
  }, []);

  const startGame = () => {
    const sequence = generateSequence(1);
    setGameState({
      stage: 1,
      score: 0,
      lives: INITIAL_LIVES,
      activeButtons: new Set(),
      gameStatus: "waiting",
      timeLeft: STAGE_TIME,
      sequence,
      playerSequence: []
    });
    showSequence(sequence);
    toast("Game Started! Watch the sequence carefully!");
  };

  const resetGame = () => {
    setGameState({
      stage: 1,
      score: 0,
      lives: INITIAL_LIVES,
      activeButtons: new Set(),
      gameStatus: "idle",
      timeLeft: STAGE_TIME,
      sequence: [],
      playerSequence: []
    });
  };

  const handleButtonClick = (buttonId: number) => {
    if (gameState.gameStatus !== "playing") return;

    const newPlayerSequence = [...gameState.playerSequence, buttonId];
    const expectedButton = gameState.sequence[gameState.playerSequence.length];

    if (buttonId === expectedButton) {
      // Correct button
      setGameState(prev => ({ ...prev, playerSequence: newPlayerSequence }));
      
      if (newPlayerSequence.length === gameState.sequence.length) {
        // Stage completed
        const newScore = gameState.score + (gameState.stage * 100) + (gameState.timeLeft * 10);
        
        if (gameState.stage >= STAGES) {
          // Game completed
          setGameState(prev => ({
            ...prev,
            score: newScore,
            gameStatus: "completed"
          }));
          toast("🎉 Congratulations! You completed all stages!");
        } else {
          // Next stage
          const nextStage = gameState.stage + 1;
          const newSequence = generateSequence(nextStage);
          
          setGameState(prev => ({
            ...prev,
            stage: nextStage,
            score: newScore,
            playerSequence: [],
            sequence: newSequence,
            gameStatus: "waiting"
          }));
          
          toast(`Stage ${nextStage} Starting!`);
          setTimeout(() => showSequence(newSequence), 1000);
        }
      }
    } else {
      // Wrong button
      const newLives = gameState.lives - 1;
      
      if (newLives <= 0) {
        setGameState(prev => ({
          ...prev,
          lives: 0,
          gameStatus: "gameOver"
        }));
        toast("Game Over! No lives remaining.");
      } else {
        setGameState(prev => ({
          ...prev,
          lives: newLives,
          playerSequence: []
        }));
        toast(`Wrong sequence! ${newLives} lives remaining.`);
      }
    }
  };

  // Timer effect
  useEffect(() => {
    if (gameState.gameStatus === "playing" && gameState.timeLeft > 0) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeLeft: prev.timeLeft - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.gameStatus === "playing" && gameState.timeLeft <= 0) {
      // Time's up
      const newLives = gameState.lives - 1;
      if (newLives <= 0) {
        setGameState(prev => ({ ...prev, lives: 0, gameStatus: "gameOver" }));
        toast("Game Over! Time's up!");
      } else {
        setGameState(prev => ({
          ...prev,
          lives: newLives,
          playerSequence: [],
          timeLeft: STAGE_TIME
        }));
        toast(`Time's up! ${newLives} lives remaining.`);
      }
    }
  }, [gameState.gameStatus, gameState.timeLeft, gameState.lives]);

  const progress = ((gameState.stage - 1) / STAGES) * 100 + 
                  (gameState.playerSequence.length / gameState.sequence.length) * (100 / STAGES);

  const getButtonVariant = (index: number): "cyan" | "purple" | "pink" | "green" => {
    const variants: ("cyan" | "purple" | "pink" | "green")[] = ["cyan", "purple", "pink", "green"];
    return variants[index % 4];
  };

  return (
    <div className="min-h-screen bg-gradient-cyber-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card/50 backdrop-blur border-border shadow-cyber animate-slide-up">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold bg-gradient-cyber-primary bg-clip-text text-transparent">
            CYBER GRID
          </CardTitle>
          
          <div className="flex justify-center gap-4 flex-wrap">
            <Badge variant="outline" className="border-neon-cyan text-neon-cyan">
              Score: {gameState.score.toLocaleString()}
            </Badge>
            <Badge variant="outline" className="border-neon-purple text-neon-purple">
              Lives: {gameState.lives}
            </Badge>
            <Badge variant="outline" className="border-neon-pink text-neon-pink">
              Time: {gameState.timeLeft}s
            </Badge>
          </div>

          <ProgressBar 
            progress={progress}
            stage={gameState.stage}
            totalStages={STAGES}
          />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Game Grid */}
          <div className="grid grid-cols-4 gap-3 justify-items-center bg-muted/20 p-6 rounded-lg border border-border">
            {Array.from({ length: GRID_SIZE }).map((_, index) => (
              <GameButton
                key={index}
                active={gameState.activeButtons.has(index)}
                onClick={() => handleButtonClick(index)}
                disabled={gameState.gameStatus !== "playing"}
                variant={getButtonVariant(index)}
              />
            ))}
          </div>

          {/* Game Controls */}
          <div className="flex gap-3 justify-center">
            {gameState.gameStatus === "idle" && (
              <Button
                onClick={startGame}
                variant="cyber"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Game
              </Button>
            )}
            
            {gameState.gameStatus === "gameOver" && (
              <Button
                onClick={resetGame}
                variant="cyber"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
            
            {gameState.gameStatus === "completed" && (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-neon-green">
                  <Trophy className="w-6 h-6" />
                  <span className="text-xl font-bold">Victory!</span>
                </div>
                <Button
                  onClick={resetGame}
                  variant="cyber"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play Again
                </Button>
              </div>
            )}
          </div>

          {/* Game Instructions */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Watch the sequence, then repeat it by clicking the buttons!</p>
            <p>Each stage adds more buttons to remember.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};