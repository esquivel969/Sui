"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut, Wallet } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserData {
  alias: string;
  credits: number;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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
            console.log("No user data found in Firestore.");
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
  }, [router]);

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
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center border-primary/20 shadow-lg shadow-primary/10">
        <CardHeader className="items-center">
          <Avatar className="h-24 w-24 mb-4 border-2 border-primary/50">
            <AvatarImage src={user?.photoURL ?? undefined} alt="User avatar" />
            <AvatarFallback className="bg-muted text-foreground text-3xl">
                {getInitials(userData?.alias)}
            </AvatarFallback>
          </Avatar>
          <CardTitle className="text-3xl font-bold tracking-tight text-foreground">
            ¡Hola, {displayName}!
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground pt-2">
            Estos son tus créditos actuales.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="text-left bg-muted/50 p-6 rounded-md flex items-center justify-center border border-border">
                <div className="flex items-center">
                    <Wallet className="h-10 w-10 mr-4 text-primary"/>
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Créditos</p>
                        <p className="text-4xl font-bold text-primary">{userData?.credits ?? 0}</p>
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
