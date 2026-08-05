import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type Insight = {
  title: string;
  description: string;
  severity: "info" | "success" | "warning";
};

type Props = {
  insights: Insight[];
};

export function InsightBanner({ insights }: Props) {
  if (!insights.length) return null;

  const primary = insights[0];

  const Icon =
    primary.severity === "warning"
      ? AlertCircle
      : primary.severity === "success"
        ? CheckCircle2
        : Info;

  const baseClasses =
    primary.severity === "warning"
      ? "bg-amber-50 border-amber-200 text-amber-900"
      : primary.severity === "success"
        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
        : "bg-sky-50 border-sky-200 text-sky-900";

  return (
    <div className={`mb-4 border rounded-xl px-4 py-3 flex items-start gap-3 ${baseClasses}`}>
      <div className="mt-0.5">
        <Icon className="w-4 h-4" />
      </div>
      <div className="space-y-1">
        <div className="text-xs font-semibold uppercase tracking-wide opacity-70">
          AI‑Driven Insight Engine
        </div>
        <div className="text-sm font-semibold">{primary.title}</div>
        <p className="text-xs opacity-90 leading-relaxed">{primary.description}</p>
      </div>
    </div>
  );
}

