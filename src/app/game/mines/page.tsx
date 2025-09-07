"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gem, Bomb, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

const GRID_SIZE = 5;

type Tile = {
  isMine: boolean;
  isRevealed: boolean;
};

export default function MinesPage() {
  const [betAmount, setBetAmount] = useState('10');
  const [mineCount, setMineCount] = useState(3);
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'busted'>('idle');
  const [gemsFound, setGemsFound] = useState(0);

  const initializeGrid = () => {
    const newGrid: Tile[][] = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({
      isMine: false,
      isRevealed: false,
    })));

    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      if (!newGrid[row][col].isMine) {
        newGrid[row][col].isMine = true;
        minesPlaced++;
      }
    }
    setGrid(newGrid);
    setGemsFound(0);
  };

  const handleStartGame = () => {
    setGameState('playing');
    initializeGrid();
  };

  const handleTileClick = (row: number, col: number) => {
    if (gameState !== 'playing' || grid[row][col].isRevealed) return;

    const newGrid = [...grid];
    newGrid[row][col].isRevealed = true;
    setGrid(newGrid);

    if (newGrid[row][col].isMine) {
      setGameState('busted');
      revealAllMines();
    } else {
      setGemsFound(gemsFound + 1);
    }
  };

  const revealAllMines = () => {
    setTimeout(() => {
        const newGrid = grid.map(row => row.map(tile => ({ ...tile, isRevealed: tile.isMine ? true : tile.isRevealed })));
        setGrid(newGrid);
    }, 500);
  };

  const isGameFinished = gemsFound === (GRID_SIZE * GRID_SIZE - mineCount);

  useEffect(() => {
    if (isGameFinished) {
        setGameState('idle');
    }
  }, [isGameFinished]);


  const getTileClasses = (tile: Tile) => {
    const base = "flex items-center justify-center w-full h-full rounded-md transition-all duration-300 transform-gpu";
    if (!tile.isRevealed) {
      return cn(base, "bg-muted/50 hover:bg-muted cursor-pointer");
    }
    if (tile.isMine) {
      return cn(base, "bg-destructive/20 scale-105");
    }
    return cn(base, "bg-accent/20 scale-105");
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background text-foreground">
        <div className="lg:w-1/4 p-4 border-b lg:border-r border-border flex flex-col gap-6">
            <div className="flex items-center gap-4">
                 <Button asChild variant="outline" size="icon">
                    <Link href="/dashboard">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold">Mines</h1>
            </div>

            <Card className="bg-card">
                <CardHeader>
                    <CardTitle>Controles del Juego</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="bet-amount">Monto de Apuesta</Label>
                        <Input 
                            id="bet-amount" 
                            placeholder="Créditos" 
                            type="number" 
                            value={betAmount}
                            onChange={(e) => setBetAmount(e.target.value)}
                            disabled={gameState === 'playing'}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="mine-count">Minas</Label>
                        <Select 
                            value={String(mineCount)} 
                            onValueChange={(value) => setMineCount(Number(value))}
                            disabled={gameState === 'playing'}
                        >
                            <SelectTrigger id="mine-count">
                                <SelectValue placeholder="Selecciona minas" />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(10)].map((_, i) => (
                                    <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {gameState === 'playing' ? (
                         <Button className="w-full" variant="secondary">Retirarse</Button>
                    ) : (
                        <Button className="w-full" onClick={handleStartGame}>
                            {gameState === 'busted' ? 'Jugar de Nuevo' : 'Apostar'}
                        </Button>
                    )}
                   
                </CardContent>
            </Card>

             <Card className="bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        <span>Cómo Jugar</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>1. Ingresa tu apuesta y elige la cantidad de minas.</p>
                    <p>2. Haz clic en "Apostar" para comenzar.</p>
                    <p>3. Revela las casillas una por una. Cada gema que encuentres aumenta tu ganancia.</p>
                    <p>4. ¡Cuidado! Si revelas una mina, pierdes tu apuesta.</p>
                    <p>5. Puedes retirarte en cualquier momento para asegurar tus ganancias.</p>
                </CardContent>
            </Card>

        </div>

        <div className="flex-1 p-4 flex flex-col items-center justify-center gap-6">
            <div className="w-full max-w-lg aspect-square grid grid-cols-5 gap-2">
                {grid.length > 0 ? grid.flat().map((tile, index) => (
                    <div key={index} className={getTileClasses(tile)} onClick={() => handleTileClick(Math.floor(index / GRID_SIZE), index % GRID_SIZE)}>
                        {tile.isRevealed && (
                            tile.isMine ? <Bomb className="h-8 w-8 text-destructive-foreground" /> : <Gem className="h-8 w-8 text-accent-foreground" />
                        )}
                    </div>
                )) : Array(GRID_SIZE*GRID_SIZE).fill(0).map((_, index) => (
                    <div key={index} className="bg-muted/30 rounded-md animate-pulse"></div>
                ))}
            </div>

            {gameState === 'busted' && (
                <div className="text-center p-4 rounded-lg bg-destructive/20 border border-destructive">
                    <h2 className="text-2xl font-bold text-destructive-foreground">¡Mala Suerte!</h2>
                    <p className="text-destructive-foreground/80">Has encontrado una mina. Inténtalo de nuevo.</p>
                </div>
            )}

            {isGameFinished && (
                <div className="text-center p-4 rounded-lg bg-accent/20 border border-accent">
                    <h2 className="text-2xl font-bold text-accent-foreground">¡Felicidades!</h2>
                    <p className="text-accent-foreground/80">Has encontrado todas las gemas.</p>
                </div>
            )}
        </div>
    </div>
  );
}
