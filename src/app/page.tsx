import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserPlus, LogIn, Gamepad2 } from 'lucide-react';

// Grape Icon SVG
const GrapeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M22 5V2l-5.5 5.5" />
      <path d="M16.5 12c.3-1 .5-2.2.5-3.5C17 6 15 3 12 3s-5 3-5 5.5c0 1.3.2 2.5.5 3.5" />
      <path d="M12 13c-1.9-1.9-1.9-5.1 0-7" />
      <path d="M16.5 12c-1.2 1.2-3 2-4.5 2s-3.3-.8-4.5-2" />
      <path d="M12 15c-1.9 1.9-1.9 5.1 0 7" />
      <path d="M7.5 12c1.2 1.2 3 2 4.5 2s3.3-.8 4.5-2" />
    </svg>
  );

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center text-center p-4">
        
        <div className="relative mb-6">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-accent rounded-full blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-background rounded-full p-4">
                <GrapeIcon className="h-24 w-24 text-primary" />
            </div>
        </div>

        <h1 className="font-headline text-5xl md:text-7xl font-bold mb-4 relative">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient-x">
            Berries
          </span>
          <span className="absolute -inset-0.5 -inset-y-2.5 text-primary/30 blur-md -z-10">
            Berries
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl">
          Tu plataforma definitiva para competir y ganar. Comienza tu viaje con nosotros hoy.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="group">
            <Link href="/registro">
              <UserPlus className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Crear una cuenta
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="group">
            <Link href="/login">
              <LogIn className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Iniciar Sesión
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}

// Add this to your tailwind.config.ts if it's not there:
// extend: {
//   animation: {
//     'gradient-x': 'gradient-x 5s ease infinite',
//   },
//   keyframes: {
//     'gradient-x': {
//       '0%, 100%': {
//         'background-size': '200% 200%',
//         'background-position': 'left center',
//       },
//       '50%': {
//         'background-size': '200% 200%',
//         'background-position': 'right center',
//       },
//     },
//   },
// },
