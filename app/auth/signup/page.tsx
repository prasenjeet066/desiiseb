import SignupForm from "@/components/auth/signup-form"
import Link from "next/link"

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl font-bold logo-gradient-text mb-3">desiiseb</h1>
          <p className="text-gray-400 text-lg">Create your account</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <SignupForm />
        </div>

        <div className="text-center animate-slide-up">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-white hover:text-gray-300 font-medium transition-colors duration-200 underline underline-offset-4"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
