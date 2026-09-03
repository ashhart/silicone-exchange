interface FieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted">
        {label}
      </label>
      {children}
    </div>
  );
}

export const selectClassName =
  "h-9 w-full rounded-md border border-line bg-surface px-2.5 text-sm text-ink transition-colors hover:border-line2 focus:border-accent";
