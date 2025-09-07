
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gem, Bomb, HelpCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { ArrowLeft, Wallet } from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

const GRID_SIZE = 5;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE;

type Tile = {
  isMine: boolean;
  isRevealed: boolean;
};

interface UserData {
  credits: number;
  partidasJugadas: number;
  partidasGanadas: number;
}

export default function MinesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const [betAmount, setBetAmount] = useState(10);
  const [mineCount, setMineCount] = useState(3);
  const [grid, setGrid] = useState<Tile[][]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'busted'>('idle');
  const [gemsFound, setGemsFound] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1);

  const router = useRouter();
  const { toast } = useToast();

   useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            toast({ title: "Error", description: "No se encontraron datos de usuario.", variant: "destructive" });
            router.push('/login');
          }
        } catch (error) {
            console.error("Error fetching user data:", error);
            toast({ title: "Error", description: "No se pudo cargar la información del usuario.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router, toast]);


  const calculateMultiplier = (gems: number) => {
    if (gems === 0) return 1;
    const safeTiles = TOTAL_TILES - mineCount;
    let multiplier = 1;
    for (let i = 0; i < gems; i++) {
      multiplier *= (safeTiles - i) / (TOTAL_TILES - i);
    }
    // The multiplier should be the inverse of the probability of picking gems
    return 0.95 / multiplier; // 0.95 is house edge
  };


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
    setCurrentMultiplier(1);
  };

  const handleStartGame = async () => {
    if (!user || !userData) return;
    if (userData.credits < betAmount) {
        toast({ title: "Créditos insuficientes", description: "No tienes suficientes créditos para esta apuesta.", variant: "destructive" });
        return;
    }

    try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
            credits: increment(-betAmount),
            partidasJugadas: increment(1)
        });
        setUserData({ ...userData, credits: userData.credits - betAmount, partidasJugadas: userData.partidasJugadas + 1 });
        setGameState('playing');
        initializeGrid();
    } catch (error) {
        console.error("Error starting game:", error);
        toast({ title: "Error", description: "No se pudo iniciar el juego.", variant: "destructive" });
    }
  };

  const handleTileClick = (row: number, col: number) => {
    if (gameState !== 'playing' || grid[row][col].isRevealed) return;

    const newGrid = grid.map(r => r.map(c => ({...c})));
    newGrid[row][col].isRevealed = true;

    if (newGrid[row][col].isMine) {
      setGameState('busted');
      revealAllMines(newGrid);
    } else {
      const newGemsFound = gemsFound + 1;
      setGemsFound(newGemsFound);
      const newMultiplier = calculateMultiplier(newGemsFound);
      setCurrentMultiplier(newMultiplier);
      if (newGemsFound === TOTAL_TILES - mineCount) {
          handleCashOut(true); // Auto-cashout on full clear
      }
    }
    setGrid(newGrid);
  };

    const handleCashOut = async (isFullClear = false) => {
        if (gameState !== 'playing' || !user || !userData) return;
        
        const winnings = betAmount * currentMultiplier;

        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                credits: increment(winnings),
                partidasGanadas: increment(1)
            });
            setUserData({ ...userData, credits: userData.credits + winnings, partidasGanadas: userData.partidasGanadas + 1 });
            setGameState('idle');
            revealAllMines(grid);
            toast({
                title: isFullClear ? "¡Tablero Completado!" : "¡Retirada Exitosa!",
                description: `Has ganado ${winnings.toFixed(2)} créditos.`,
                variant: "default"
            });
        } catch (error) {
            console.error("Error cashing out:", error);
            toast({ title: "Error", description: "No se pudo procesar la retirada.", variant: "destructive" });
        }
    };


  const revealAllMines = (currentGrid: Tile[][]) => {
    setTimeout(() => {
        const newGrid = currentGrid.map(row => row.map(tile => ({ ...tile, isRevealed: tile.isMine ? true : tile.isRevealed })));
        setGrid(newGrid);
    }, 500);
  };

  const getTileClasses = (tile: Tile) => {
    const base = "flex items-center justify-center w-full h-full rounded-md transition-all duration-300 transform-gpu";
    if (gameState === 'idle' || gameState === 'busted') {
        if (!tile.isRevealed) return cn(base, "bg-muted/30");
        if (tile.isMine) return cn(base, "bg-destructive/20 scale-105");
        return cn(base, "bg-accent/20 scale-105");
    }
     if (!tile.isRevealed) {
      return cn(base, "bg-muted/50 hover:bg-muted cursor-pointer");
    }
    if (tile.isMine) {
      return cn(base, "bg-destructive/20 scale-105");
    }
    return cn(base, "bg-accent/20 scale-105");
  };

  const isGameFinished = gemsFound === (TOTAL_TILES - mineCount);
  const nextMultiplier = calculateMultiplier(gemsFound + 1);
  const currentWinnings = betAmount * currentMultiplier;


  if (loading) {
    return <main className="flex min-h-screen flex-col items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></main>
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background text-foreground">
        <div className="lg:w-1/4 p-4 border-b lg:border-r border-border flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline" size="icon">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Mines</h1>
                </div>
                <div className="flex items-center gap-2 text-lg font-bold text-primary p-2 rounded-md bg-muted">
                    <Wallet className="h-5 w-5" />
                    <span>{userData?.credits.toFixed(2) ?? '0.00'}</span>
                </div>
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
                            onChange={(e) => setBetAmount(Math.max(0, Number(e.target.value)))}
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
                                {[...Array(24)].map((_, i) => (
                                    <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {gameState === 'playing' ? (
                         <Button className="w-full" variant="secondary" onClick={() => handleCashOut()} disabled={gemsFound === 0}>
                            Retirar {currentWinnings.toFixed(2)} Créditos
                        </Button>
                    ) : (
                        <Button className="w-full" onClick={handleStartGame} disabled={betAmount <= 0}>
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
                    <p>3. Revela las casillas una por una. Cada gema aumenta tu ganancia.</p>
                    <p>4. ¡Cuidado! Si revelas una mina, pierdes tu apuesta.</p>
                    <p>5. Puedes retirarte en cualquier momento para asegurar tus ganancias.</p>
                </CardContent>
            </Card>
        </div>

        <div className="flex-1 p-4 flex flex-col items-center justify-center gap-6 relative">
             {gameState === 'playing' && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-4">
                    <div className="text-center p-2 rounded-lg bg-muted border">
                        <p className="text-sm text-muted-foreground">Próximo Multiplicador</p>
                        <p className="text-xl font-bold text-accent">{nextMultiplier.toFixed(2)}x</p>
                    </div>
                     <div className="text-center p-2 rounded-lg bg-muted border">
                        <p className="text-sm text-muted-foreground">Ganancia Actual</p>
                        <p className="text-xl font-bold text-primary">{currentWinnings.toFixed(2)}</p>
                    </div>
                </div>
             )}

            <div className="w-full max-w-lg aspect-square grid grid-cols-5 gap-2">
                {grid.length > 0 ? grid.flat().map((tile, index) => (
                    <div key={index} className={getTileClasses(tile)} onClick={() => handleTileClick(Math.floor(index / GRID_SIZE), index % GRID_SIZE)}>
                        {tile.isRevealed && (
                            tile.isMine ? <Bomb className="h-8 w-8 text-destructive-foreground" /> : <Gem className="h-8 w-8 text-accent-foreground" />
                        )}
                    </div>
                )) : Array(GRID_SIZE*GRID_SIZE).fill(0).map((_, index) => (
                    <div key={index} className="bg-muted/30 rounded-md"></div>
                ))}
            </div>

            {gameState === 'busted' && (
                <div className="text-center p-4 rounded-lg bg-destructive/20 border border-destructive">
                    <h2 className="text-2xl font-bold text-destructive-foreground">¡Mala Suerte!</h2>
                    <p className="text-destructive-foreground/80">Has encontrado una mina. Inténtalo de nuevo.</p>
                </div>
            )}

            {isGameFinished && gameState === 'idle' && (
                <div className="text-center p-4 rounded-lg bg-accent/20 border border-accent">
                    <h2 className="text-2xl font-bold text-accent-foreground">¡Felicidades!</h2>
                    <p className="text-accent-foreground/80">Has encontrado todas las gemas.</p>
                </div>
            )}
        </div>
    </div>
  );
}

