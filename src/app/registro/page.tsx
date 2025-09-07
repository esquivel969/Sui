import { Header } from '@/components/layout/Header';
import { RegistrationForm } from '@/components/auth/RegistrationForm';

export default function RegisterPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <RegistrationForm />
      </main>
    </div>
  );
}
