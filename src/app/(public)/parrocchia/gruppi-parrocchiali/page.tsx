import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import ParishSections, { type ParishSection } from "@/components/parrocchia/ParishSections";
import ParishEpigraph from "@/components/parrocchia/ParishEpigraph";
import { foto } from "@/lib/parrocchia-foto";
import "@/app/parrocchia.css";

export const metadata: Metadata = { title: "Gruppi parrocchiali" };

const PELLEGRINAGGI = [
  { anno: "2013", luoghi: ["Santuario della Madonna della Neve di Pietralba (Dolomiti)"] },
  { anno: "2014", luoghi: ["Santuario di Nostra Signora di Lourdes"] },
  { anno: "2015", luoghi: ["Santuario della Madonna delle Lacrime (Siracusa)"] },
  { anno: "2016", luoghi: ["Santuario della Madonna di Oropa (Biella)"] },
  { anno: "2017", luoghi: ["Santuario di Czestochowa (Polonia)"] },
  {
    anno: "2018",
    luoghi: ["Santuario di Santiago de Compostela (Spagna)", "Santuario di Nostra Signora di Fatima (Portogallo)"],
  },
];

const SEZIONI: ParishSection[] = [
  {
    id: "sacramenti",
    title: "Vicinanza costante ai sacramenti",
    image: { src: foto("gruppi/gruppi-sacramenti", 1100), alt: "Santa Messa nella chiesa parrocchiale", width: 1503, height: 1200 },
    body: (
      <>
        <p>
          Ogni giorno Cristo si fa vicino a noi nella nostra vita; i sacramenti e le celebrazioni liturgiche sono il
          principale nutrimento spirituale:
        </p>
        <p>
          La <strong>S. Messa</strong> viene celebrata quotidianamente alle 8:00 e alle 18:30. Nelle domeniche e nelle
          Solennità della Chiesa ci sono almeno quattro celebrazioni: in particolare la S. Messa domenicale delle 10:30
          è dedicata alle famiglie e ai bambini e ragazzi del catechismo.
        </p>
        <p>
          La <strong>Confessione</strong> è un sacramento, istituito da Gesù Cristo per rinnovare l&apos;anima e aprirti
          alla grazia di Dio attraverso il dialogo con il sacerdote e l&apos;assoluzione finale. È possibile confessarsi
          durante la S. Messa domenicale, immediatamente prima o dopo la S. Messa feriale oppure accordandosi con i
          sacerdoti per fissare un appuntamento in altri orari.
        </p>
        <p>
          Il <strong>Rosario</strong> fu pensato per guidare la meditazione e la recita delle preghiere. Ogni giorno,
          alle ore 17:45 nella cappellina feriale, si possono meditare i &quot;misteri&quot;, cioè eventi, momenti o
          episodi significativi della vita di Cristo e di Maria.
        </p>
        <p>
          L&apos;<strong>Adorazione Eucaristica</strong> è attiva ogni martedì dalle 8:30 alle 18:30 nella cappellina
          feriale; il Santissimo, cioè la presenza reale e divina di Gesù Cristo, viene esposto nell&apos;Eucaristia. Un
          gruppo di fedeli garantisce l&apos;adorazione continua a cui è possibile aggiungersi per un momento di dialogo
          personale con Dio.
        </p>
      </>
    ),
  },
  {
    id: "cammino",
    title: "Comunità neocatecumenali",
    image: { src: foto("gruppi/gruppi-neocatecumenali", 1100), alt: "Le comunità neocatecumenali della parrocchia", width: 2000, height: 1333 },
    body: (
      <>
        <p>
          Il Cammino Neocatecumenale è uno strumento al servizio della Chiesa per la riscoperta dell&apos;iniziazione
          cristiana da parte degli adulti battezzati. Molti di essi, infatti, si sono allontanati dalla Chiesa o, pur
          rimanendo in essa, non hanno potuto coltivare il seme del battesimo ricevuto da piccoli. Questo si è andato
          mano mano inaridendo, non essendo sostenuto da un&apos;adesione personale, che solo può nascere dall&apos;avere
          sperimentato l&apos;amore di Dio nella propria vita.
        </p>
        <p>
          Attraverso l&apos;aiuto del Cammino il neocatecumeno arriva a conoscere chi egli è veramente e, parallelamente,
          sperimenta l&apos;amore e la misericordia di Dio sulla sua vita e sui suoi limiti.
        </p>
        <p>Nella nostra parrocchia sono presenti due comunità.</p>
      </>
    ),
  },
  {
    id: "padrepio",
    title: "Gruppo di preghiera di Padre Pio",
    image: { src: foto("gruppi/gruppi-padre-pio", 1100), alt: "Il gruppo di preghiera di Padre Pio nella cappellina feriale", width: 1600, height: 1200 },
    body: (
      <>
        <p>
          Il Gruppo di Preghiera di Padre Pio è frutto del Ministero sacerdotale del santo stesso. Padre Pio raccomandava
          sempre a tutti di pregare. Così accadeva che, a poco a poco, le anime da lui formate sentissero il bisogno di
          riunirsi per pregare in comune.
        </p>
        <p>
          Si partecipa alla Santa Messa, si prega, si medita, si ascolta la Parola di Dio. Le attività e i temi che si
          svolgono durante gli incontri sono coordinati dal parroco che presiede gli appuntamenti.
        </p>
        <p>
          Nella nostra parrocchia è dunque attivo un Gruppo di Preghiera che si riunisce ogni 4° lunedì del mese alle ore
          16:45 presso la cappellina feriale.
        </p>
      </>
    ),
  },
  {
    id: "fidanzati",
    title: "Corso di preparazione al matrimonio",
    image: { src: foto("gruppi/gruppi-corso-matrimonio", 1100), alt: "Celebrazione di un matrimonio nella chiesa parrocchiale", width: 1024, height: 714 },
    body: (
      <>
        <p>
          La scelta di sposarsi è senza dubbio una scelta delicata dal momento che implica un cambiamento radicale della
          propria vita e l&apos;assunzione di un impegno serio e inderogabile nei confronti di colei o colui al quale si
          decide di legarsi per l&apos;eternità. Se la scelta, poi, è quella di sposarsi in Chiesa accettando che il
          proprio amore diventi sacramento dell&apos;amore di Cristo per la sua Chiesa, la responsabilità è ancora
          maggiore. Motivo questo per cui la scelta non può essere frutto dell&apos;improvvisazione.
        </p>
        <p>
          Il corso di preparazione al matrimonio è aperto a chiunque voglia sapere cosa dice la Chiesa sul matrimonio. È
          aperto a coppie che hanno scelto di sposarsi, a coppie che ancora non hanno deciso, a coppie già sposate e a
          single.
        </p>
      </>
    ),
  },
  {
    id: "vizicapitali",
    title: "Catechesi sulle Virtù opposte ai vizi capitali",
    image: { src: foto("gruppi/gruppi-catechesi-virtu", 1100), alt: "Particolare di un mosaico con figure di santi", width: 1726, height: 1200 },
    body: (
      <>
        <p>
          Negli ultimi anni è stato approfondito a cura del parroco il tema delle Virtù della Chiesa opposte ai Vizi
          Capitali: un percorso di incontri settimanali, tendenzialmente da ottobre a gennaio, che si basa sul catechismo
          della Chiesa cattolica e sulle parole dei Padri della Chiesa, in particolare il monaco Evagrio Pontico.
        </p>
        <p>
          Tanti hanno trovato giovamento da queste catechesi sia nel cammino di fede personale sia nella conoscenza di
          alcune verità della tradizione della Chiesa cattolica.
        </p>
      </>
    ),
  },
  {
    id: "rosario",
    title: "Gruppo del Rosario nelle case",
    image: { src: foto("gruppi/gruppi-rosario", 1100), alt: "Una corona del Rosario", width: 1800, height: 1200 },
    body: (
      <>
        <p>
          Il Rosario è una &ldquo;preghiera contemplativa e cristocentrica, inseparabile dalla meditazione della Sacra
          Scrittura, è la preghiera del cristiano che avanza nel pellegrinaggio della fede, alla sequela di Gesù,
          preceduto da Maria&rdquo; (Papa Benedetto XVI, &quot;Angelus&quot; del 01/10/2006).
        </p>
        <p>
          Un gruppo di fedeli apre le porte della propria casa e organizza nelle case delle persone che lo richiedono la
          recita del Santo Rosario animato con canti e dedicato a particolari necessità della comunità parrocchiale oltre
          che alle intenzioni del Papa e della Chiesa. Tutti indistintamente ne possono far parte; anche chi già fa parte
          di altri gruppi o già svolge servizi e mansioni in parrocchia si può sentire coinvolto.
        </p>
      </>
    ),
  },
  {
    id: "pellegrinaggi",
    title: "Pellegrinaggi",
    image: { src: foto("gruppi/gruppi-pellegrinaggi", 1100), alt: "Foto di gruppo dei parrocchiani durante un pellegrinaggio", width: 1800, height: 1200 },
    body: (
      <>
        <p>
          La parrocchia ogni anno in estate organizza un pellegrinaggio di più giorni ricco di preghiera e anche di
          spunti culturali. Famiglie, anziani, neonati, giovani, bambini camminano fianco a fianco facendosi prossimi gli
          uni degli altri: tanta comunione, risate, preghiera profonda e condivisa sono un ristoro per l&apos;anima. Sia
          in Italia che in Europa sono state affidate in santuari importanti le necessità di tanti parrocchiani:
        </p>
        <ul className="par-years">
          {PELLEGRINAGGI.map((p) => (
            <li key={p.anno}>
              <strong>{p.anno}</strong>
              {p.luoghi.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </li>
          ))}
        </ul>
      </>
    ),
  },
];

export default function GruppiPage() {
  return (
    <>
      <PageTitle
        kicker="La nostra parrocchia"
        title={
          <>
            Carismi e percorsi di sostegno{" "}
            <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>spirituale</span>.
          </>
        }
        lead="I gruppi parrocchiali: ciascuno con il proprio carisma, tutti in comunione nella vita della comunità."
      />

      <section style={{ padding: 0 }}>
        <div className="container">
          <figure className="par-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto("gruppi/gruppi-intestazione", 2000)} alt="Santa Messa all'aperto con i parrocchiani" width={2000} height={1254} />
          </figure>
        </div>
      </section>

      <section style={{ paddingBottom: 48 }}>
        <div className="container-narrow">
          <ParishEpigraph reference="Amos 7,14-15">
              Non ero profeta né figlio di profeta; ero un mandriano e coltivavo piante di sicomòro. Il Signore mi
              prese, mi chiamò mentre seguivo il gregge. Il Signore mi disse: Va&apos;, profetizza al mio popolo
              Israele.
          </ParishEpigraph>
          <p style={{ fontSize: 17, lineHeight: 1.7 }}>
            Tenendo presente che nella parrocchia i vari gruppi diversificano gli aspetti di vita ecclesiale, San Paolo VI
            suggeriva questa bella immagine: &ldquo;Questa evoluzione della parrocchia che si esprime in piccole comunità
            e gruppi ci fa pensare ad una comparazione: quella del concerto vocale e strumentale. Ognuna delle piccole
            comunità (o gruppi) è un po&apos; differente dalle altre, come le voci e gli strumenti. Però tutte ed ognuna,
            per essere autenticamente Chiesa, devono essere molto attente di rimanere in comunione&rdquo;.
          </p>
        </div>
      </section>

      <section style={{ paddingTop: 16 }}>
        <div className="container">
          <ParishSections sections={SEZIONI} />
        </div>
      </section>
    </>
  );
}
