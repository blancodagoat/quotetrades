import Link from 'next/link';
import SignupForm from '@/components/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-block text-sm font-semibold text-neutral-700 hover:text-blue-600 mb-6"
          >
            quotetrades
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Start quoting in 5 minutes.
          </h1>
          <p className="text-neutral-600 text-sm">
            No credit card. Build your first quote free.
          </p>
        </div>
        <SignupForm />
        <p className="text-center text-sm text-neutral-600 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-neutral-700 underline underline-offset-2 hover:text-blue-600"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
