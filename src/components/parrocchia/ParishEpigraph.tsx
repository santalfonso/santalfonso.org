import { Cormorant_Garamond } from "next/font/google";

// Carattere con grazie, solo per le citazioni bibliche in apertura delle pagine.
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: "500", style: "italic" });

/** Citazione biblica in apertura di Gruppi e Servizi parrocchiali. */
export default function ParishEpigraph({ reference, children }: { reference: string; children: React.ReactNode }) {
  return (
    <figure className="par-epigraph">
      <span className={`par-epigraph__mark ${cormorant.className}`} aria-hidden="true">
        &ldquo;
      </span>
      <blockquote className={cormorant.className}>
        <p>{children}</p>
      </blockquote>
      <figcaption>{reference}</figcaption>
    </figure>
  );
}
