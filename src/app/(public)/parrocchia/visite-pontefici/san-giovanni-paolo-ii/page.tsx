import type { Metadata } from "next";
import PopeVisit from "@/components/parrocchia/PopeVisit";
import { foto } from "@/lib/parrocchia-foto";
import "@/app/parrocchia.css";

export const metadata: Metadata = { title: "Visita di San Giovanni Paolo II" };

export default function VisitaGiovanniPaoloIIPage() {
  return (
    <PopeVisit
      name={
        <>
          Visita di{" "}
          <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>San Giovanni Paolo II</span>
        </>
      }
      date="4 Febbraio 2001"
      hero={{ src: foto("pontefici/gpii-intestazione", 2000), alt: "San Giovanni Paolo II benedice i bambini della parrocchia", width: 2000, height: 1276 }}
      intro={
        <p>
          La visita del Papa in una comunità parrocchiale costituisce un evento di per sé unico, ma lo è ancor di più se
          viene preceduta, come in questo caso, da episodi profondamente significativi che si sono avvicendati nel corso
          dell&apos;anno giubilare 2000: la scomparsa del parroco fondatore, don Eulogio, la costruzione della nuova
          chiesa, la sua cerimonia di dedicazione, l&apos;arrivo del nuovo parroco ed infine il Natale. Proprio in
          occasione della Natività di Nostro Signore don Stefano Alberici, l&apos;allora parroco di Sant&apos;Alfonso
          Maria de&apos; Liguori, informò la comunità dell&apos;imminente arrivo del Santo Padre.
        </p>
      }
      blocks={[
        {
          photo: { src: foto("pontefici/gpii-seduto", 1000), alt: "San Giovanni Paolo II seduto durante la celebrazione", width: 1280, height: 1351 },
          text: (
            <>
              <p>
                Inutile sottolineare la comprensibile emozione, la gioia, l&apos;entusiasmo che da subito hanno fatto da
                cornice alla preparazione di tale avvenimento. Era evidente, infatti, che il 4 febbraio del 2001 sarebbe
                arrivato il Papa che ha affascinato noi tutti con la sua apertura, il suo dinamismo, la sua giovinezza e,
                che con il suo innegabile e travolgente carisma ha conquistato l&apos;Europa e l&apos;America, l&apos;Asia
                e l&apos;Africa.
              </p>
              <p>
                La visita pastorale del Santo Padre ha pertanto assunto un significato particolarissimo; don Stefano nel
                suo discorso introduttivo di benvenuto l&apos;ha definita un &quot;grande dono di Dio&quot;. La comunità
                parrocchiale di Sant&apos;Alfonso Maria de&apos; Liguori infatti, viveva in quel momento una nuova
                esperienza: finalmente, dopo 25 anni, aveva a disposizione un moderno complesso parrocchiale tanto
                desiderato, che apriva sì concrete ed interessanti prospettive all&apos;azione pastorale ma che, nel
                contempo, richiedeva di intensificare l&apos;impegno nella testimonianza del Vangelo. Dunque, un
                &quot;nuovo inizio&quot; seguendo il cammino di fede, già tracciato da don Eulogio.
              </p>
            </>
          ),
          band: { src: foto("pontefici/gpii-eucaristia", 2000), alt: "San Giovanni Paolo II celebra l'Eucaristia all'altare con i sacerdoti", width: 2000, height: 957 },
        },
        {
          photo: { src: foto("pontefici/gpii-cantori", 1100), alt: "San Giovanni Paolo II con i cantori e i giovani della parrocchia", width: 1920, height: 1241 },
          text: (
            <>
              <p>
                In questa circostanza, i giovani della parrocchia hanno chiesto al Santo Padre un messaggio di
                incoraggiamento, ispirandosi all&apos;invito ad essere &quot;speranza della Chiesa&quot; che Egli aveva
                indirizzato al mondo giovanile nei primi giorni del suo pontificato e che aveva ribadito in occasione della
                Giornata Mondiale della Gioventù affermando &quot;Se sarete quello che dovete essere, metterete fuoco in
                tutto il mondo&quot;.
              </p>
              <p>
                Il Santo Padre ha risposto, durante l&apos;omelia, riferendosi al motivo dominante della liturgia del
                giorno, esortando paternamente l&apos;intera comunità a &quot;prendere il largo&quot;, «duc in altum!»,
                sull&apos;esempio dell&apos;apostolo Pietro, ricordando il suo fiducioso abbandono all&apos;invito di Cristo
                nonostante la delusione per la pesca infruttuosa dell&apos;intera notte. Il Papa ha sottolineato il
                profondo significato che tale chiamata assume per ognuno di noi all&apos;inizio del nuovo millennio,
                incoraggiando tutti a farsi missionari dell&apos;amore del Signore, seguendo come modello Sant&apos;Alfonso
                che sentì costante l&apos;ansia dell&apos;evangelizzazione.
              </p>
              <p>
                La visita pastorale si è conclusa con l&apos;incontro del Pontefice con i giovani ed i fanciulli della
                Parrocchia, sulle note del suggestivo canto dell&apos;Emmanuel; è stato toccante scorgere quel tenero
                sorriso che da sempre nasce sul Suo viso alla vista dei ragazzi.
              </p>
              <p>
                La visita del Papa, la Sua presenza, le Sue parole indirizzate proprio a noi, la serenità che è riuscito a
                trasmetterci, hanno suscitato nel cuore di ciascun testimone di quel giorno, sentimenti concordi di
                felicità e di gratitudine.
              </p>
            </>
          ),
          band: { src: foto("pontefici/gpii-cantori-2", 2000), alt: "San Giovanni Paolo II saluta i giovani musicisti nella chiesa", width: 2000, height: 1328 },
        },
      ]}
      video={{ id: "k3MjpkZOstI", title: "Video integrale della visita di San Giovanni Paolo II" }}
    />
  );
}
