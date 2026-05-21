export interface LegendItem {
  label: string;
  color: string;
}

export function Legend({ items, title }: { items: LegendItem[]; title?: string }) {
  return (
    <div className="rounded-lg border border-border bg-ink/70 p-2.5 backdrop-blur">
      {title && <div className="mb-1.5 text-[11px] font-semibold text-muted-foreground">{title}</div>}
      <div className="flex flex-wrap gap-x-3 gap-y-1.5">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: it.color }} />
            {it.label}
          </div>
        ))}
      </div>
    </div>
  );
}
