"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, LogOut, Wallet, Swords, Trophy, AtSign, Lock, CheckCircle, Gem } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AvatarData, avatars } from '@/lib/avatars';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface UserData {
  nombre: string;
  apellido: string;
  alias: string;
  email: string;
  sexo: string;
  avatarUrl: string;
  credits: number;
  partidasJugadas: number;
  partidasGanadas: number;
}

function DashboardContent() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
            if (searchParams.get('showAvatarDialog') === 'true') {
              setIsAvatarDialogOpen(true);
              // Clean up URL
              router.replace('/dashboard', { scroll: false });
            }
          } else {
            console.log("No user data found in Firestore.");
            router.push('/login');
          }
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router, searchParams]);

  const handleAvatarSelect = async (newAvatarUrl: string) => {
    if (!user || !userData) return;

    try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
            avatarUrl: newAvatarUrl
        });
        setUserData({ ...userData, avatarUrl: newAvatarUrl });
        setIsAvatarDialogOpen(false); // Close dialog on selection
    } catch (error) {
        console.error("Error updating avatar:", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const getInitials = (alias: string | null | undefined) => {
    if (!alias) return 'B';
    return alias.substring(0, 2).toUpperCase();
  };

  const displayName = userData?.alias ?? user?.email ?? 'Usuario';

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background gap-8">
      <Card className="w-full max-w-md text-center border-primary/20 shadow-lg shadow-primary/10">
        <CardHeader className="items-center pb-4">
          <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
            <DialogTrigger asChild>
                <Avatar className="h-24 w-24 mb-4 border-2 border-primary/50 cursor-pointer transition-transform hover:scale-105">
                  <AvatarImage src={userData?.avatarUrl ?? undefined} alt="User avatar" />
                  <AvatarFallback className="bg-muted text-foreground text-3xl">
                      {getInitials(userData?.alias)}
                  </AvatarFallback>
                </Avatar>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Elige tu Avatar</DialogTitle>
                    <DialogDescription>
                        Desbloquea nuevos avatares jugando más partidas. Haz clic en un avatar desbloqueado para seleccionarlo.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 py-4">
                    {avatars.map((avatar) => {
                        const isUnlocked = userData && userData.partidasJugadas >= avatar.requiredGames;
                        const isSelected = userData?.avatarUrl === avatar.url;

                        return (
                             <TooltipProvider key={avatar.name}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={cn(
                                                "relative rounded-full flex items-center justify-center cursor-pointer aspect-square",
                                                isUnlocked ? 'hover:scale-110 transition-transform' : 'cursor-not-allowed',
                                            )}
                                            onClick={() => isUnlocked && handleAvatarSelect(avatar.url)}
                                        >
                                            <Image
                                                src={avatar.url}
                                                alt={avatar.name}
                                                width={80}
                                                height={80}
                                                className={cn(
                                                    'rounded-full',
                                                    !isUnlocked && 'grayscale opacity-50'
                                                )}
                                            />
                                            {!isUnlocked && (
                                                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                                                    <Lock className="h-6 w-6 text-white" />
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                                                     <CheckCircle className="h-4 w-4 text-white" />
                                                </div>
                                            )}
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-bold">{avatar.name}</p>
                                        {!isUnlocked && <p>Juega {avatar.requiredGames} partidas para desbloquear</p>}
                                    </TooltipContent>
                                </Tooltip>
                             </TooltipProvider>
                        );
                    })}
                </div>
            </DialogContent>
          </Dialog>

          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            {displayName}
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground pt-1 flex items-center justify-center gap-2">
            <AtSign className="h-4 w-4" /> {userData?.email}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-2">
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left pt-4">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                <Wallet className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Créditos</p>
                  <p className="text-2xl font-bold text-foreground">{userData?.credits ?? 0}</p>
                </div>
              </div>
               <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
                <Trophy className="h-8 w-8 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Victorias</p>
                  <p className="text-2xl font-bold text-foreground">{userData?.partidasGanadas ?? 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border col-span-1 sm:col-span-2">
                <Swords className="h-8 w-8 text-destructive" />
                <div>
                  <p className="text-sm text-muted-foreground">Partidas Jugadas</p>
                  <p className="text-2xl font-bold text-foreground">{userData?.partidasJugadas ?? 0}</p>
                </div>
              </div>
            </div>

          <Button onClick={handleLogout} className="mt-4 w-full" size="lg" variant="destructive">
            <LogOut className="mr-2 h-5 w-5" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>

      <Link href="#" className="w-full max-w-md group">
        <Card className="text-center border-accent/20 shadow-lg shadow-accent/10 transition-all group-hover:border-accent/50 group-hover:scale-105">
            <CardHeader className="items-center pb-4">
                <Gem className="h-12 w-12 text-accent" />
            </CardHeader>
            <CardContent>
                <CardTitle className="text-2xl font-bold text-foreground">
                    Juega contra la banca
                </CardTitle>
            </CardContent>
        </Card>
      </Link>

    </main>
  );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<main className="flex min-h-screen flex-col items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></main>}>
            <DashboardContent />
        </Suspense>
    )
}

    