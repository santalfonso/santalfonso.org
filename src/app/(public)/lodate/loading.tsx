/** Stato di caricamento immediato: titolo e menù laterale restano, il contenuto arriva subito dopo. */
export default function LodateLoading() {
  return (
    <div className="lodate-loading" role="status" aria-live="polite">
      <span className="lodate-sr">Caricamento…</span>
      <div className="lodate-skel lodate-skel--title" />
      <div className="lodate-skel" />
      <div className="lodate-skel" />
      <div className="lodate-skel lodate-skel--short" />
    </div>
  );
}
