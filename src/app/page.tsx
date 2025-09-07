import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserPlus, LogIn } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        <h1 className="font-headline text-5xl md:text-7xl font-bold text-foreground mb-4">
          Bienvenido a FirebaseFlow
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
          Una página web simple para registrar usuarios con Firebase. Comienza tu viaje con nosotros hoy.
        </p>
        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link href="/registro">
              <UserPlus className="mr-2 h-5 w-5" />
              Crear una cuenta
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/login">
              <LogIn className="mr-2 h-5 w-5" />
              Iniciar Sesión
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
