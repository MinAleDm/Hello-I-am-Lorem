import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/shared/lib/cn";

interface FieldShellProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

function FieldShell({ label, hint, children }: FieldShellProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-ink-950">{label}</span>
      {children}
      {hint ? <span className="text-xs text-ink-950/54">{hint}</span> : null}
    </label>
  );
}

const inputBase =
  "w-full rounded-2xl border border-ink-950/10 bg-white px-4 py-3 text-sm text-ink-950 outline-none transition placeholder:text-ink-950/36 focus:border-ink-950/18 focus:ring-4 focus:ring-ink-950/5";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
}

export function InputField({ label, hint, className, ...props }: InputFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <input className={cn(inputBase, className)} {...props} />
    </FieldShell>
  );
}

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
}

export function TextareaField({ label, hint, className, ...props }: TextareaFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <textarea className={cn(inputBase, "min-h-[120px] resize-y", className)} {...props} />
    </FieldShell>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
}

export function SelectField({ label, hint, className, children, ...props }: SelectFieldProps) {
  return (
    <FieldShell label={label} hint={hint}>
      <select className={cn(inputBase, "appearance-none", className)} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}
