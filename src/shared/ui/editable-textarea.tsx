import { useEffect, useState } from "react";
import { cn } from "@/shared/lib/cn";

interface EditableTextareaProps {
  value: string;
  onCommit: (nextValue: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function EditableTextarea({
  value,
  onCommit,
  placeholder,
  rows = 5,
  className,
}: EditableTextareaProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <textarea
      rows={rows}
      value={draft}
      placeholder={placeholder}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={() => {
        if (draft !== value) {
          onCommit(draft);
        }
      }}
      className={cn(
        "w-full rounded-[18px] border border-ink-950/10 bg-white px-4 py-3 text-sm leading-6 text-ink-950 outline-none transition placeholder:text-ink-950/36 focus:border-ink-950/18 focus:ring-4 focus:ring-ink-950/5",
        className,
      )}
    />
  );
}
