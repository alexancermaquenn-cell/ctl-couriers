'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
        return;
      }
      setError(res.status === 401 ? 'Invalid username or password.' : 'Login failed. Try again.');
    } catch {
      setError('Network error. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    // Full-screen overlay so it stands alone even though wrapped by the admin layout.
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: 'radial-gradient(1000px 500px at 50% -10%, rgba(220,38,38,0.12), transparent 60%), rgb(8 8 10)' }}
    >
      <div className="glass glow-red w-full max-w-sm rounded-[var(--radius)] p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/img/logo.png" alt="CTL" width={52} height={52} className="rounded" />
          <h1 className="mt-4 text-xl font-semibold text-fg">CTL Admin</h1>
          <p className="mt-1 text-sm text-fg-subtle">Sign in to the control panel</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Username</span>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs font-medium text-fg-muted">Password</span>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>

          {error && (
            <div className="rounded-[10px] border border-red-900 bg-red-950/40 px-3 py-2 text-sm text-red-300">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={busy}>
            <Lock size={15} /> {busy ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
      </div>
    </div>
  );
}
