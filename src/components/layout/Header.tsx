import Link from 'next/link';
import { Home, UserPlus, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="absolute top-0 z-10 w-full p-4 sm:p-6 bg-transparent">
      <nav className="container mx-auto flex items-center justify-end gap-2 sm:gap-4">
        <Button asChild variant="ghost">
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Inicio
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/login">
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar Sesión
          </Link>
        </Button>
        <Button asChild>
          <Link href="/registro">
            <UserPlus className="mr-2 h-4 w-4" />
            Registro
          </Link>
        </Button>
      </nav>
    </header>
  );
}
