interface AuthDividerProps {
  label?: string;
}

export function AuthDivider({
  label = "or continue with email",
}: AuthDividerProps) {
  return (
    <div className="relative" aria-hidden>
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t" />
      </div>
      <div className="relative flex justify-center text-xs uppercase tracking-wide">
        <span className="bg-card px-2 text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
