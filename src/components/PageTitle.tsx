export default function PageTitle({
  kicker,
  title,
  lead,
  accent,
}: {
  kicker: string;
  title: React.ReactNode;
  lead?: string;
  accent?: never;
}) {
  void accent;
  return (
    <section style={{ paddingTop: 64, paddingBottom: 48 }}>
      <div className="container-narrow">
        <span className="kicker">{kicker}</span>
        <h1 style={{ marginTop: 20 }}>{title}</h1>
        {lead && (
          <p className="lead" style={{ marginTop: 20 }}>
            {lead}
          </p>
        )}
      </div>
    </section>
  );
}
