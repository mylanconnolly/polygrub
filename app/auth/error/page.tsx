export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Authentication Error</h1>
        <p className="mt-2 text-gray-600">
          Sorry, we couldn&apos;t verify your identity. Please try again.
        </p>
      </div>
    </div>
  );
}
