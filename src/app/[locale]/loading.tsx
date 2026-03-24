import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="animate-pulse text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading Vaultwise...
        </p>
      </div>
    </div>
  )
}
