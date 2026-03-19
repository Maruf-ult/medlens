import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center text-white text-lg">🔬</div>
            <span className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              Med<span className="text-primary-500">Lens</span>
            </span>
          </div>
          <p className="text-surface-500 dark:text-surface-400 text-sm">
            Create your free MedLens account
          </p>
        </div>
        <div className="flex justify-center">
          <SignUp />
        </div>
      </div>
    </div>
  );
}