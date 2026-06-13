import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Servizi parrocchiali" };

export default function ServiziPage() {
  return (
    <>
      <PageTitle
        kicker="La nostra parrocchia"
        title={
          <>
            Donarsi alla comunità, condividere i propri{" "}
            <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>doni</span>.
          </>
        }
        lead="I servizi attraverso cui ogni membro della comunità contribuisce al bene di tutti."
      />
      <article className="prose-parish container-narrow" style={{ paddingBottom: 64 }}>
        <p>
          Ogni membro della comunità è chiamato a donarsi alla comunità
          attraverso i servizi parrocchiali, condividendo i propri doni per il
          bene collettivo.
        </p>

        <h2>Consiglio Pastorale Parrocchiale (CPP)</h2>
        <p>
          Organismo consultivo che promuove la comunione ecclesiale e ascolta i
          segni dei tempi per guidare la vita della comunità.
        </p>

        <h2>Consiglio per gli Affari Economici (CPAE)</h2>
        <p>
          Gestisce bilanci preventivi e consuntivi, supervisiona contratti e
          assicura la conformità normativa della parrocchia.
        </p>

        <h2>Pastorale giovanile</h2>
        <p>
          Comprende catechismo, oratorio estivo e gestione dei campetti
          parrocchiali per bambini, adolescenti e giovani.
        </p>

        <h2>Servizi liturgici</h2>
        <p>
          Include sacrestia, ministri della comunione, ministranti, lettori e
          cantori che supportano le celebrazioni eucaristiche.
        </p>

        <h2>Cura degli ambienti</h2>
        <p>
          Pulizia della chiesa e del sagrato (lunedì e venerdì), manutenzione
          degli spazi verdi e controllo del parcheggio.
        </p>

        <h2>Servizi ai bisognosi</h2>
        <p>
          Centro d&apos;ascolto Caritas (martedì ore 10:00) e «Dame di
          Sant&apos;Alfonso» per vestiario e generi alimentari.
        </p>

        <h2>Ufficio parrocchiale</h2>
        <p>
          Aperto nei giorni feriali dalle 17:00 alle 18:30 per prenotazioni di
          sacramenti e certificati.
        </p>

        <h2>Servizi aggiuntivi</h2>
        <p>
          Organizzazione della festa della Madonna del Rosario, allestimento del
          presepe e celebrazioni alla Cappella Santa Elisabetta.
        </p>
      </article>
    </>
  );
}
