import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import { foto } from "@/lib/parrocchia-foto";
import "@/app/giubileo.css";

export const metadata: Metadata = {
  title: "Indulgenza plenaria",
  description:
    "Indulgenza plenaria concessa dalla Penitenzieria Apostolica per il 50° anno dall'erezione canonica della parrocchia: condizioni e opere richieste.",
};

const APPLICAZIONI = [
  "Per sé stessi",
  "Per un caro defunto",
  "Per le anime del purgatorio",
  "Per le anime dimenticate",
  "Per le anime dei morti di morte violenta",
  "Per le vittime di disastri naturali",
];

const PREGHIERE = ["Padre Nostro", "Ave Maria", "Gloria al Padre", "Eterno Riposo"];

const CONDIZIONI: { title: string; text: string; prayers?: boolean }[] = [
  {
    title: "Disposizione interiore",
    text: "È necessario avere un sincero pentimento e un completo distacco da ogni peccato, sia mortale che veniale, con il cuore totalmente rivolto a Dio.",
  },
  {
    title: "Confessione sacramentale",
    text: "Ricevere il sacramento della penitenza per essere in stato di grazia. La confessione può essere fatta entro 8 giorni dall'azione indulgenziale.",
  },
  {
    title: "Comunione eucaristica",
    text: "Ricevere la Santa Comunione per essere spiritualmente uniti a Cristo.",
  },
  {
    title: "Preghiera secondo le intenzioni del Papa",
    text: "Recitare preghiere di devozione quali:",
    prayers: true,
  },
];

const OPERE: { title: string; items: { name: string; text: string }[] }[] = [
  {
    title: "Opere di preghiera",
    items: [
      { name: "Via Crucis", text: "Meditare devotamente la Via Crucis davanti alle stazioni legittimamente erette." },
      {
        name: "Santo Rosario",
        text: "Recitarlo con devozione in parrocchia tutti i giorni alle 18:00, in famiglia o in un'associazione di fedeli.",
      },
      {
        name: "Adorazione eucaristica",
        text: "Adorare il Santissimo Sacramento per almeno mezz'ora, in parrocchia tutti i martedì dalle 09:00 alle 18:30.",
      },
      {
        name: "Lettura sacra",
        text: "Leggere o ascoltare la Sacra Scrittura per almeno mezz'ora come lettura spirituale.",
      },
    ],
  },
  {
    title: "Pellegrinaggio e visita",
    items: [
      {
        name: "Visita alla parrocchia",
        text: "In occasione di questo anniversario, visitare devotamente la nostra chiesa parrocchiale.",
      },
      {
        name: "Visita a luoghi santi",
        text: "Recarsi presso Basiliche o santuari designati dal Vescovo per l'Anno Giubilare.",
      },
    ],
  },
  {
    title: "Opere di penitenza e carità",
    items: [
      {
        name: "Digiuno spirituale",
        text: "Astenersi per almeno un giorno da consumi superflui e futili distrazioni (reali o virtuali) in spirito di penitenza.",
      },
      {
        name: "Elemosina proporzionata",
        text: "Devolvere una somma di denaro adeguata alle proprie possibilità per i poveri, opere sociali e religiose, o a sostegno della vita, della famiglia e delle persone bisognose.",
      },
    ],
  },
];

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
        lead="In occasione del cinquantesimo anniversario dall'erezione canonica della nostra parrocchia, la Penitenzieria Apostolica Vaticana ha concesso una speciale indulgenza plenaria."
      />

      <section style={{ padding: 0 }}>
        <div className="container">
          <figure className="giu-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foto("giubileo/giubileo-indulgenza-plenaria")}
              alt="Iscrizione incisa nel marmo con le parole «Indulgenza plenaria»"
              width={1003}
              height={524}
              fetchPriority="high"
            />
          </figure>
        </div>
      </section>

      <div className="container-narrow giu">
        {/* Modalità di applicazione */}
        <section className="giu-block" aria-labelledby="applicazione">
          <span className="kicker">Per chi</span>
          <h2 id="applicazione">Modalità di applicazione</h2>
          <p className="giu-intro">
            L&apos;indulgenza plenaria può essere ottenuta <strong>una volta al giorno</strong> e può essere applicata:
          </p>
          <ul className="giu-chips">
            {APPLICAZIONI.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>

        {/* Condizioni fondamentali */}
        <section className="giu-block" aria-labelledby="condizioni">
          <span className="kicker">Cosa serve</span>
          <h2 id="condizioni">Condizioni fondamentali</h2>
          <p className="giu-intro">
            Per ottenere validamente l&apos;indulgenza plenaria sono richieste <strong>tutte</strong> le seguenti
            condizioni:
          </p>
          <ol className="giu-steps">
            {CONDIZIONI.map((c, i) => (
              <li key={c.title} className="giu-step">
                <span className="giu-step__num" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{c.title}</h3>
                  <p>{c.text}</p>
                  {c.prayers && (
                    <ul className="giu-prayers">
                      {PREGHIERE.map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Opera specifica */}
        <section className="giu-block" aria-labelledby="opera">
          <span className="kicker">Una a scelta</span>
          <h2 id="opera">Opera specifica richiesta</h2>
          <p className="giu-intro">
            Oltre alle condizioni fondamentali, è necessario compiere un&apos;opera specifica legata
            all&apos;indulgenza. Per il nostro anniversario parrocchiale si può scegliere tra le seguenti opere pie:
          </p>
          <div className="giu-works">
            {OPERE.map((g) => (
              <div key={g.title} className="giu-work">
                <h3>{g.title}</h3>
                <dl>
                  {g.items.map((it) => (
                    <div key={it.name}>
                      <dt>{it.name}</dt>
                      <dd>{it.text}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </div>
        </section>

        {/* Nota */}
        <aside className="giu-note" aria-labelledby="nota">
          <h2 id="nota">Nota importante</h2>
          <p>
            Tutte le condizioni sopra elencate devono essere adempiute per ottenere validamente l&apos;indulgenza
            plenaria. È sufficiente compiere <strong>una sola</strong> delle opere specifiche elencate, accompagnata
            dalle quattro condizioni fondamentali.
          </p>
          <p>
            Questa grazia particolare è stata concessa in onore del significativo traguardo raggiunto dalla nostra
            comunità parrocchiale.
          </p>
        </aside>
      </div>
    </>
  );
}
