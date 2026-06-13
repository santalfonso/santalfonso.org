import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Indulgenza plenaria" };

export default function IndulgenzaPlenariaPage() {
  return (
    <>
      <PageTitle
        kicker="Anno Giubilare Parrocchiale"
        title={
          <>
            <span style={{
              background: "linear-gradient(90deg, var(--gold-deep), var(--gold))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>Indulgenza</span>{" "}plenaria
          </>
        }
        lead="Contenuto in arrivo."
      />
    </>
  );
}
