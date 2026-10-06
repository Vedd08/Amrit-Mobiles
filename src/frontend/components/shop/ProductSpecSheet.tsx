export function ProductSpecSheet({ specs }: { specs: Record<string, string> }) {
  const entries = Object.entries(specs);
  if (entries.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-white">
      <div className="flex items-center justify-between border-b border-dashed border-line bg-paper px-6 py-4">
        <span className="text-micro font-bold uppercase text-ink-3">
          Counter Spec Sheet
        </span>
        <span className="text-micro font-bold uppercase text-lime-ink">Verified</span>
      </div>
      <dl>
        {entries.map(([key, value], i) => (
          <div
            key={key}
            className={`flex items-center justify-between gap-4 px-6 py-3.5 ${i % 2 === 1 ? "bg-white" : ""}`}
          >
            <dt className="text-sm font-semibold text-ink-3">{key}</dt>
            <dd className="text-right text-sm font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
