import { signIn } from '@/auth';

export function GoogleLoginButton() {
  return (
    <form
      action={async () => {
        'use server';
        await signIn('google', { redirectTo: '/dashboard' });
      }}
    >
      <button className="rounded-full bg-blue-900 px-6 py-3 text-white">
        Continue with Gmail / Google
      </button>
    </form>
  );
}
