import { Badge } from "@/shared/ui/badge";
import { Surface } from "@/shared/ui/surface";
import type { Criterion, DecisionOption } from "@/shared/types/focus-board";

interface OptionsCompareTableProps {
  criteria: Criterion[];
  options: DecisionOption[];
}

export function OptionsCompareTable({ criteria, options }: OptionsCompareTableProps) {
  return (
    <Surface muted className="mt-4 overflow-hidden rounded-[28px] p-0">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-ink-950/[0.03]">
            <tr>
              <th className="px-4 py-3 font-semibold text-ink-950">Критерии</th>
              {options.map((option) => (
                <th key={option.id} className="px-4 py-3 font-semibold text-ink-950">
                  <div className="flex flex-col gap-1">
                    <span>{option.label}</span>
                    <Badge tone="neutral">{option.verdict}</Badge>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {criteria.map((criterion) => (
              <tr key={criterion.id} className="border-t border-ink-900/10">
                <td className="px-4 py-4 align-top">
                  <p className="font-semibold text-ink-950">{criterion.label}</p>
                  <p className="mt-1 text-xs leading-5 text-ink-950/58">{criterion.description}</p>
                </td>
                {options.map((option) => (
                  <td key={option.id} className="px-4 py-4 align-top">
                    <span className="text-base font-semibold text-ink-950">
                      {option.scores[criterion.id] ?? "—"} / 5
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Surface>
  );
}
