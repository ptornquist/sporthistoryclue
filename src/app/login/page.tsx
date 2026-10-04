'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import { AuthForm } from '@/components/auth/AuthForm';
import { useRouter, useSearchParams } from 'next/navigation';
import { safeReturnPath } from '@/lib/clubs';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const next = safeReturnPath(searchParams.get('next')) ?? '/';

  return (
    <div className="max-w-md w-full bg-white border border-zinc-200 rounded-3xl p-8 shadow-sm">
      <div className="text-center mb-6">
        <Link href="/" className="text-lg font-black uppercase tracking-tighter">
          Sports<span className="text-blue-600">History</span>Clue
        </Link>
        <h1 className="text-2xl font-black uppercase tracking-tight text-zinc-900 mt-3">
          {initialMode === 'login' ? 'Scoutinloggning' : 'Gå med i ligan'}
        </h1>
      </div>
      <AuthForm initialMode={initialMode} onAuthenticated={() => router.push(next)} />
      <div className="mt-6 pt-4 border-t border-zinc-100 text-center">
        <Link href="/" className="text-xs text-zinc-400 hover:text-black font-medium">
          ← Tillbaka till Dagens Kluring
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 selection:bg-blue-600 selection:text-white">
        <Suspense fallback={<div className="text-xs font-mono text-zinc-400">Laddar...</div>}>
          <AuthContent />
        </Suspense>
      </main>
    </>
  );
}
