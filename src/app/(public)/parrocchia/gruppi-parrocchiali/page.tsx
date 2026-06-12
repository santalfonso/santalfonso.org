import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Gruppi parrocchiali" };

export default function GruppiPage() {
  return (
    <>
      <PageTitle
        kicker="La nostra parrocchia"
        title={
          <>
            Carismi e percorsi di sostegno{" "}
            <span style={{ color: "var(--azure-deep)" }}>spirituale</span>.
          </>
        }
        lead="I gruppi che animano la vita ecclesiale della comunità, ciascuno con il proprio carisma."
      />
      <article className="prose-parish container-narrow" style={{ paddingBottom: 64 }}>
        <p>
          La parrocchia organizza diversi gruppi che caratterizzano gli aspetti
          della vita ecclesiale. Come suggeriva Paolo VI, ogni comunità è come
          «un concerto vocale e strumentale» dove «tutte ed ognuna, per essere
          autenticamente Chiesa, devono essere molto attente di rimanere in
          comunione».
        </p>

        <h2>Vicinanza costante ai sacramenti</h2>
        <p>
          La Santa Messa si celebra quotidianamente alle 8:00 e alle 18:30. La
          domenica e nelle solennità si svolgono almeno quattro celebrazioni,
          con quella delle 10:30 dedicata alle famiglie e ai bambini del
          catechismo.
        </p>
        <p>
          La confessione è disponibile durante la messa domenicale o
          accordandosi con i sacerdoti. Il rosario si recita ogni giorno alle
          17:45 nella cappellina feriale. L&apos;adorazione eucaristica è attiva
          ogni martedì dalle 8:30 alle 18:30.
        </p>

        <h2>Comunità Neocatecumenali</h2>
        <p>
          Questo cammino aiuta gli adulti battezzati a riscoprire
          l&apos;iniziazione cristiana. Nella parrocchia sono presenti due
          comunità.
        </p>

        <h2>Gruppo di preghiera di Padre Pio</h2>
        <p>
          Riunito ogni quarto lunedì del mese alle 16:45 presso la cappellina
          feriale, il gruppo organizza incontri di preghiera, meditazione e
          ascolto della Parola di Dio.
        </p>

        <h2>Corso di preparazione al matrimonio</h2>
        <p>
          Aperto a coppie fidanzate, già sposate e single, il corso affronta il
          tema del matrimonio secondo l&apos;insegnamento della Chiesa.
        </p>

        <h2>Catechesi sulle virtù opposte ai vizi capitali</h2>
        <p>
          Percorso settimanale di incontri da ottobre a gennaio basato sul
          catechismo cattolico e sui Padri della Chiesa.
        </p>

        <h2>Gruppo del Rosario nelle case</h2>
        <p>
          Fedeli organizzano la recita del rosario animato nelle abitazioni per
          necessità della comunità parrocchiale.
        </p>

        <h2>Pellegrinaggi</h2>
        <p>
          Annualmente in estate la parrocchia organizza pellegrinaggi
          plurigiornalieri verso importanti santuari mariani in Italia e in
          Europa.
        </p>
      </article>
    </>
  );
}
