
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
    let probability = 1;
    for (let i = 0; i < gems; i++) {
        probability *= (safeTiles - i) / (TOTAL_TILES - i);
    }
    // The multiplier is the inverse of the probability, with a house edge
    return 0.95 / probability; 
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
    if (betAmount <= 0) {
        toast({ title: "Apuesta inválida", description: "El monto de la apuesta debe ser mayor a 0.", variant: "destructive" });
        return;
    }


    setGameState('playing');
    initializeGrid();
    
    try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
            credits: increment(-betAmount),
            partidasJugadas: increment(1)
        });
        setUserData({ ...userData, credits: userData.credits - betAmount, partidasJugadas: userData.partidasJugadas + 1 });
    } catch (error) {
        console.error("Error starting game:", error);
        toast({ title: "Error", description: "No se pudo iniciar el juego.", variant: "destructive" });
        setGameState('idle'); // Revert game state on error
    }
  };

  const handleTileClick = (row: number, col: number) => {
    if (gameState !== 'playing' || grid[row][col].isRevealed) return;

    const newGrid = grid.map(r => r.map(c => ({...c})));
    newGrid[row][col].isRevealed = true;
    setGrid(newGrid);

    if (newGrid[row][col].isMine) {
      setGameState('busted');
      revealAllMines(newGrid);
      toast({
        title: "¡Mala Suerte!",
        description: `Perdiste ${betAmount} créditos.`,
        variant: "destructive"
      });
    } else {
      const newGemsFound = gemsFound + 1;
      setGemsFound(newGemsFound);
      const newMultiplier = calculateMultiplier(newGemsFound);
      setCurrentMultiplier(newMultiplier);
      if (newGemsFound === TOTAL_TILES - mineCount) {
          handleCashOut(true); // Auto-cashout on full clear
      }
    }
  };

    const handleCashOut = async (isFullClear = false) => {
        if (gameState !== 'playing' || !user || !userData || gemsFound === 0) return;
        
        const winnings = betAmount * currentMultiplier;

        try {
            const userDocRef = doc(db, "users", user.uid);
            await updateDoc(userDocRef, {
                credits: increment(winnings),
                partidasGanadas: increment(1)
            });
            setUserData({ ...userData, credits: userData.credits - betAmount + winnings, partidasGanadas: userData.partidasGanadas + 1 });
            setGameState('idle');
            revealAllMines(grid);
            toast({
                title: isFullClear ? "¡Tablero Completado!" : "¡Retirada Exitosa!",
                description: `Has ganado ${winnings.toFixed(2)} créditos.`,
                className: "bg-primary text-primary-foreground border-primary/50"
            });
        } catch (error) {
            console.error("Error cashing out:", error);
            toast({ title: "Error", description: "No se pudo procesar la retirada.", variant: "destructive" });
        }
    };


  const revealAllMines = (currentGrid: Tile[][]) => {
    setTimeout(() => {
        const newGrid = currentGrid.map(row => row.map(tile => ({ ...tile, isRevealed: true })));
        setGrid(newGrid);
    }, 500);
  };

  const getTileClasses = (tile: Tile, row: number, col: number) => {
    const base = "relative flex items-center justify-center w-full h-full rounded-md transition-all duration-300 transform-gpu overflow-hidden";
    
    if (!tile.isRevealed) {
      if (gameState === 'playing') {
        return cn(base, "bg-muted/50 hover:bg-muted cursor-pointer scale-100 hover:scale-105");
      }
      return cn(base, "bg-muted/30 cursor-not-allowed");
    }

    // Revealed tiles
    const contentBase = "absolute inset-0 flex items-center justify-center"
    if (tile.isMine) {
        return cn(base, "bg-destructive/20 scale-105", contentBase);
    }
    return cn(base, "bg-accent/20 scale-105", contentBase);
  };

  const isGameFinished = gameState === 'idle' || gameState === 'busted';
  const nextMultiplier = calculateMultiplier(gemsFound + 1);
  const currentWinnings = betAmount * currentMultiplier;


  if (loading) {
    return <main className="flex min-h-screen flex-col items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></main>
  }

  return (
    <div className="flex min-h-screen flex-col lg:flex-row bg-background text-foreground">
        <div className="lg:w-[350px] p-4 border-b lg:border-r border-border flex flex-col gap-6">
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
                <CardContent className="space-y-4 pt-6">
                    <div className="space-y-2">
                        <Label htmlFor="bet-amount">Monto de Apuesta</Label>
                        <Input 
                            id="bet-amount" 
                            placeholder="Créditos" 
                            type="number" 
                            value={betAmount}
                            onChange={(e) => setBetAmount(Math.max(1, Number(e.target.value)))}
                            disabled={gameState === 'playing'}
                            min="1"
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
                         <Button size="lg" className="w-full font-bold text-lg" variant="secondary" onClick={() => handleCashOut()} disabled={gemsFound === 0}>
                            Retirar {currentWinnings.toFixed(2)}
                        </Button>
                    ) : (
                        <Button size="lg" className="w-full font-bold text-lg" onClick={handleStartGame} disabled={betAmount <= 0}>
                            {gameState === 'busted' ? 'Jugar de Nuevo' : 'Apostar'}
                        </Button>
                    )}
                </CardContent>
            </Card>

             <Card className="bg-card mt-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-primary" />
                        <span>Cómo Jugar</span>
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                    <p>1. Ingresa tu apuesta y elige la cantidad de minas.</p>
                    <p>2. Haz clic en "Apostar" para comenzar.</p>
                    <p>3. Revela las casillas. Cada gema aumenta tu ganancia.</p>
                    <p>4. ¡Cuidado! Si revelas una mina, pierdes la apuesta.</p>
                    <p>5. Retírate cuando quieras para asegurar tus ganancias.</p>
                </CardContent>
            </Card>
        </div>

        <div className="flex-1 p-4 flex flex-col items-center justify-center gap-6 relative">
             {gameState === 'playing' && (
                <div className="absolute top-4 lg:top-8 flex flex-col sm:flex-row gap-4">
                    <div className="text-center p-3 rounded-lg bg-muted border w-40">
                        <p className="text-sm text-muted-foreground">{gemsFound} / {TOTAL_TILES - mineCount} Gemas</p>
                         <p className="text-2xl font-bold text-accent">{currentMultiplier.toFixed(2)}x</p>
                    </div>
                     <div className="text-center p-3 rounded-lg bg-muted border w-40">
                        <p className="text-sm text-muted-foreground">Ganancia</p>
                        <p className="text-2xl font-bold text-primary">{currentWinnings.toFixed(2)}</p>
                    </div>
                </div>
             )}

            <div className="w-full max-w-lg aspect-square grid grid-cols-5 gap-2">
                {(grid.length > 0 ? grid : Array(GRID_SIZE).fill(Array(GRID_SIZE).fill({isMine:false, isRevealed: false}))).map((row, rowIndex) => 
                  row.map((tile, colIndex) => (
                    <div 
                      key={`${rowIndex}-${colIndex}`} 
                      className={getTileClasses(tile, rowIndex, colIndex)} 
                      onClick={() => handleTileClick(rowIndex, colIndex)}
                    >
                      {tile.isRevealed && (
                          tile.isMine 
                          ? <Bomb className="h-8 w-8 text-destructive-foreground animate-in fade-in zoom-in-50" /> 
                          : <Gem className="h-8 w-8 text-accent-foreground animate-in fade-in zoom-in-50" />
                      )}
                    </div>
                  ))
                )}
            </div>

            {gameState === 'busted' && !isGameFinished && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-center p-6 rounded-lg bg-destructive/90 border border-destructive-foreground/20 shadow-2xl">
                        <h2 className="text-3xl font-bold text-destructive-foreground">¡Mala Suerte!</h2>
                        <p className="text-destructive-foreground/80 mt-2">Has encontrado una mina.</p>
                        <Button onClick={handleStartGame} className="mt-4">Jugar de nuevo</Button>
                    </div>
                </div>
            )}
        </div>
    </div>
  );
}

    