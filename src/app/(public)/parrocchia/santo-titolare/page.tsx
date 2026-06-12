import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";

export const metadata: Metadata = { title: "Santo titolare" };

export default function SantoTitolarePage() {
  return (
    <>
      <PageTitle
        title="Sant'Alfonso Maria de' Liguori"
        subtitle="Vescovo e Dottore della Chiesa (1696 – 1787)"
      />
      <article className="prose-parish mx-auto max-w-3xl px-4 py-10">
        <p>
          Sant&apos;Alfonso Maria de&apos; Liguori nacque nel 1696 in una
          famiglia aristocratica napoletana. Straordinariamente dotato
          intellettualmente, conseguì la laurea in diritto a soli 16 anni e
          divenne l&apos;avvocato più celebre di Napoli, vincendo per otto anni
          tutte le cause che difendeva.
        </p>
        <p>
          Tuttavia, spinto da una vocazione profonda verso Dio, nel 1723
          abbandonò la professione legale, ripudiando ricchezza e successo, per
          diventare sacerdote nonostante l&apos;opposizione paterna. Ordinato
          nel 1726, si dedicò all&apos;evangelizzazione dei ceti più umili della
          società napoletana.
        </p>

        <h2>Opere di evangelizzazione</h2>
        <p>
          Alfonso sviluppò un&apos;intensa attività pastorale tra i poveri,
          insegnando loro le verità fondamentali della fede e incoraggiandoli a
          una vita migliore. Le sue iniziative portarono alla creazione delle
          «cappelle serotine», riunioni serali dove i fedeli pregavano insieme.
          Questi gruppi divennero strumenti efficaci di educazione morale, di
          risanamento sociale e di aiuto reciproco tra i poveri.
        </p>
        <p>
          A 35 anni, sensibilizzato dalla povertà spirituale e materiale dei
          contadini del Regno di Napoli, fondò nel 1732 la Congregazione del
          Santissimo Redentore, i cui membri, i Redentoristi, continuano oggi
          l&apos;opera missionaria in tutto il mondo.
        </p>

        <h2>Insegnamenti sulla preghiera</h2>
        <p>
          Alfonso riteneva la preghiera essenziale per la salvezza cristiana,
          affermando con forza: «Chi prega si salva, chi non prega si danna!».
          Considerava la preghiera come «il mezzo necessario e sicuro per
          ottenere la salvezza e tutte le grazie di cui abbiamo bisogno».
        </p>
        <blockquote>
          Dio non nega ad alcuno la grazia della preghiera, con la quale si
          ottiene l&apos;aiuto a vincere ogni concupiscenza e ogni tentazione.
        </blockquote>

        <h2>Eredità teologica</h2>
        <p>
          Proclamato Dottore della Chiesa nel 1871, Alfonso è patrono dei
          confessori e dei moralisti. La sua principale opera teologica presenta
          una sintesi equilibrata tra le esigenze della legge morale divina e i
          dinamismi della coscienza umana.
        </p>
        <p>
          In un&apos;epoca caratterizzata dal rigorismo giansenista, Alfonso
          raccomandava ai confessori di manifestare «l&apos;abbraccio gioioso di
          Dio Padre» nella sua misericordia infinita, insistendo sul ruolo del
          sacramento della Penitenza come esperienza di perdono e
          incoraggiamento spirituale.
        </p>

        <h2>La santità accessibile a tutti</h2>
        <p>
          Un merito particolare di Alfonso fu la sua convinzione che la santità
          è accessibile ad ogni cristiano, indipendentemente dalla condizione
          sociale o dalla vocazione: ognuno, nel proprio stato di vita, può
          raggiungere la perfezione spirituale.
        </p>

        <h2>Opere principali</h2>
        <p>
          Tra i suoi numerosi scritti figurano <em>La pratica d&apos;amare Gesù
          Cristo</em>, <em>Le glorie di Maria</em>, <em>Le Massime eterne</em>,{" "}
          <em>Visite al Santissimo Sacramento</em> e <em>Del gran mezzo della
          Preghiera</em>, tutti caratterizzati da uno stile semplice e
          accessibile, pensati per la formazione spirituale popolare.
        </p>
        <p>
          Canonizzato nel 1839, Alfonso rimane una figura centrale della
          spiritualità cattolica moderna.
        </p>
      </article>
    </>
  );
}
