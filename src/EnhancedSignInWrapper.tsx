"use client";
import { useAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { SignInForm } from "./SignInForm";
import { useState } from "react";

export function EnhancedSignInWrapper() {
  const { signIn } = useAuthActions();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("googleOAuth");
    } catch (error) {
      console.error("Google sign-in error:", error);
      toast.error("Failed to sign in with Google. Please try again or use email/password.", {
        duration: 4000,
        style: {
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          color: '#dc2626'
        }
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Google Sign In Button */}
      <div className="space-y-4">
        <button
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
          className="w-full px-6 py-4 bg-white/80 backdrop-blur-xl border-2 border-white/40 rounded-2xl hover:bg-white/90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] font-semibold text-gray-700 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          <div className="flex items-center justify-center gap-3">
            {isGoogleLoading ? (
              <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            ) : (
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{isGoogleLoading ? "Signing in..." : "Continue with Google"}</span>
          </div>
        </button>

        <div className="flex items-center justify-center">
          <hr className="flex-1 border-white/30" />
          <span className="mx-4 text-gray-600 font-medium">or</span>
          <hr className="flex-1 border-white/30" />
        </div>
      </div>

      {/* Original SignInForm with enhanced styling */}
      <div className="space-y-4">
        <SignInForm />
      </div>
    </div>
  );
}
