"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const errorMessages: Record<string, string> = {
  OAuthSignin: "Error starting sign in with OAuth provider.",
  OAuthCallback: "Error handling OAuth callback.",
  OAuthCreateAccount: "Could not create OAuth account.",
  EmailCreateAccount: "Could not create account with this email.",
  Callback: "Error during authentication callback.",
  OAuthAccountNotLinked:
    "This email is already linked to another sign-in method. Please use the original method.",
  CredentialsSignin: "Invalid email or password.",
  Default: "An unexpected authentication error occurred.",
};

export default function AuthErrorPage() {
  const params = useSearchParams();
  const error = params.get("error") ?? "Default";
  const message = errorMessages[error] ?? errorMessages.Default;

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-4 text-center">
        <div className="flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-950/60 border border-red-800">
            <span className="text-2xl">⚠️</span>
          </div>
        </div>
        <h1 className="text-xl font-bold text-white">Authentication Error</h1>
        <p className="text-sm text-neutral-400">{message}</p>
        <div className="flex flex-col gap-2">
          <Link
            href="/auth/login"
            className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Back to login
          </Link>
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">
            Return home
          </Link>
        </div>
      </div>
    </div>
  );
}
