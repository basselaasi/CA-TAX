type Props = { step: number; total: number };

export function Progress({ step, total }: Props) {
  const pct = Math.round((step / total) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-slate-600">
        <span>Progress</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 rounded bg-slate-200">
        <div className="h-2 rounded bg-blue-600" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
