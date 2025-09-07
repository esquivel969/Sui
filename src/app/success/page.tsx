import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function SuccessPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="items-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-3xl font-bold tracking-tight text-foreground">
            ¡Registro Exitoso!
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <CardDescription className="text-base">
            Tu cuenta ha sido creada correctamente. Ahora puedes volver al inicio.
          </CardDescription>
          <Button asChild className="mt-8 w-full" size="lg">
            <Link href="/">
              Volver al Inicio
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
