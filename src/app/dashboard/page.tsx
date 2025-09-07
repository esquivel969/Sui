"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, Wallet, Gamepad2, Trophy, User as UserIcon, Mail } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface UserData {
  email: string;
  alias: string;
  nombre: string;
  credits: number;
  partidasJugadas: number;
  partidasGanadas: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribeAuth();
  }, [router]);
  
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const unsubscribeFirestore = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUserData(doc.data() as UserData);
        } else {
          console.log("No such document! This may happen if the user was created before Firestore integration.");
          // Don't sign out, just show a limited dashboard
        }
        setLoading(false);
      });
      return () => unsubscribeFirestore();
    } else if (!user && !loading) {
        router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </main>
    );
  }

  if (!user) {
    return null; // Should be redirected
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return user?.email?.substring(0, 1).toUpperCase() || 'B';
    return name.substring(0, 2).toUpperCase();
  };
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md text-center border-primary/20 shadow-lg shadow-primary/10">
        <CardHeader className="items-center">
          <Avatar className="h-24 w-24 mb-4 border-2 border-primary/50">
            <AvatarImage src={user.photoURL ?? undefined} alt="User avatar" />
            <AvatarFallback className="bg-muted text-foreground text-3xl">
                {getInitials(userData?.nombre)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            ¡Bienvenido, {userData?.alias ?? user.email}!
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground pt-2">
            Este es tu panel de control de Berries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {userData && (
                <div className="text-left bg-muted/50 p-4 rounded-md border border-border">
                    <p className="text-sm font-medium text-muted-foreground flex items-center"><UserIcon className="h-4 w-4 mr-2"/>Nombre Completo</p>
                    <p className="text-lg text-foreground truncate font-semibold">{userData.nombre}</p>
                    <Separator className="my-3" />
                    <p className="text-sm font-medium text-muted-foreground flex items-center"><Mail className="h-4 w-4 mr-2"/>Correo electrónico</p>
                    <p className="text-lg text-foreground truncate font-semibold">{userData.email}</p>
                </div>
            )}
          
            <div className="text-left bg-muted/50 p-4 rounded-md flex items-center justify-between border border-border">
                <div className="flex items-center">
                    <Wallet className="h-8 w-8 mr-4 text-primary"/>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Créditos</p>
                        <p className="text-3xl font-bold text-primary">{userData?.credits ?? 'N/A'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
                <div className="bg-muted/50 p-4 rounded-md flex items-center border border-border">
                    <Gamepad2 className="h-7 w-7 mr-4 text-primary"/>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Partidas</p>
                        <p className="text-2xl font-bold text-foreground">{userData?.partidasJugadas ?? 'N/A'}</p>
                    </div>
                </div>
                <div className="bg-muted/50 p-4 rounded-md flex items-center border border-border">
                    <Trophy className="h-7 w-7 mr-4 text-primary"/>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Victorias</p>
                        <p className="text-2xl font-bold text-foreground">{userData?.partidasGanadas ?? 'N/A'}</p>
                    </div>
                </div>
            </div>
          
          <Button onClick={handleLogout} className="mt-8 w-full" size="lg" variant="destructive">
            <LogOut className="mr-2 h-5 w-5" />
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
