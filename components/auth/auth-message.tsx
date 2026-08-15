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
          : "border-success/40 bg-success/10 text-success",
      )}
    >
      {error ?? message}
    </div>
  );
}
