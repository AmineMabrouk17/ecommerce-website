import { cn } from "@/lib/utils";

interface AuthMessageProps {
  error?: string | null;
  message?: string | null;
}

export function AuthMessage({ error, message }: AuthMessageProps) {
  if (!error && !message) return null;
  return (
    <div
      role="alert"
      className={cn(
        "rounded-md border px-3 py-2 text-sm",
        error
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : "border-emerald-600/40 bg-emerald-600/10 text-emerald-700",
      )}
    >
      {error ?? message}
    </div>
  );
}
