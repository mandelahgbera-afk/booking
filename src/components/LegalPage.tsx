export const LegalPage = ({
  title,
  updated,
  sections,
}: {
  title: string;
  updated: string;
  sections: { heading: string; body: string[] }[];
}) => {
  return (
    <div className="bg-slate-50 px-6 pb-24 pt-32">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated {updated}</p>

        <div className="mt-10 flex flex-col gap-8">
          {sections.map((s) => (
            <div key={s.heading}>
              <h2 className="text-base font-semibold text-slate-900">{s.heading}</h2>
              <div className="mt-2 flex flex-col gap-3 text-sm leading-relaxed text-slate-500">
                {s.body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
