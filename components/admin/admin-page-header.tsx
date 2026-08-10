export function AdminPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--admin-primary)]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-[34px]">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--admin-muted-foreground)] sm:text-base">{description}</p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
