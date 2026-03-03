import LoginForm from '@/components/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center mb-1">Lead to Quote</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Sign in to your account</p>
        <LoginForm />
        <p className="text-center text-sm text-gray-500 mt-6">
          No account?{' '}
          <a href="/signup" className="text-blue-600 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
