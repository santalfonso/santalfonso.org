import type { Metadata } from "next";
import PageTitle from "@/components/PageTitle";
import ParishSections, { ParishIndex, type ParishSection } from "@/components/parrocchia/ParishSections";
import { foto } from "@/lib/parrocchia-foto";
import "@/app/parrocchia.css";

export const metadata: Metadata = { title: "Servizi parrocchiali" };

const SEZIONI: ParishSection[] = [
  {
    id: "pastorale",
    label: "Consiglio pastorale",
    title: "Consiglio pastorale parrocchiale",
    image: { src: foto("servizi/servizi-consiglio-pastorale", 1100), alt: "La chiesa parrocchiale vista dall'esterno", width: 1908, height: 1248 },
    body: (
      <>
        <p>
          Il Consiglio Pastorale Parrocchiale (CPP) si pone nella comunità parrocchiale come segno di comunione e
          strumento di crescita alla luce del Vangelo. È formato da cristiani che sono chiamati a vivere l&apos;esperienza
          di fede e di comunione ecclesiale nella reciprocità dei carismi e dei ministeri, nella collaborazione e nel
          servizio gratuito. Si prende cura di tutta la pastorale parrocchiale, cioè di tutto ciò che concerne la vita e
          l&apos;attività della comunità.
        </p>
        <p>
          Il CPP ha carattere consultivo e di servizio alla comunità parrocchiale. Con il &ldquo;consiglio&rdquo; di
          tutti i membri, esso è chiamato a porsi in ascolto del Signore che guida la sua Chiesa, a leggere i segni dei
          tempi alla luce della fede, a promuovere la comunione affettiva ed effettiva tra i membri del popolo di Dio,
          nella reciprocità tra i carismi e ministeri che lo Spirito dona a ciascuno per il bene di tutti. Il CPP ha
          carattere rappresentativo ed esprime l&apos;intera comunità parrocchiale.
        </p>
      </>
    ),
  },
  {
    id: "economico",
    label: "Consiglio per gli affari economici",
    title: "Consiglio parrocchiale per gli affari economici",
    image: { src: foto("servizi/servizi-affari-economici", 900), alt: "La chiesa parrocchiale durante la costruzione, in bianco e nero", width: 1390, height: 2065 },
    body: (
      <>
        <p>
          Il Consiglio Parrocchiale per gli Affari Economici (CPAE) è l&apos;organismo di partecipazione dei fedeli nella
          gestione economica della parrocchia. È previsto dal Codice di Diritto Canonico e dalle norme emanate dal vescovo
          in tema di una pastorale di comunione e di corresponsabilità da parte di tutti i membri della comunità
          cristiana, unitamente al fine di sviluppare in ambito economico una autentica coscienza ecclesiale e debbono
          essere attivamente inseriti nella vita parrocchiale, capaci di valutare le scelte economiche della parrocchia
          stessa.
        </p>
        <p>I suoi compiti sono:</p>
        <ul>
          <li>
            Coadiuvare il parroco, che rimane l&apos;unico rappresentante legale della parrocchia, nel predisporre il
            bilancio preventivo, elencando le voci di spesa prevedibili ed individuando i relativi mezzi finanziari;
          </li>
          <li>
            Approvare alla fine di ogni esercizio il rendiconto consuntivo che viene presentato al consiglio pastorale e
            alla comunità;
          </li>
          <li>
            Esprimere il parere su contratti, progetti, piani di finanziamento, impiego dei capitali, relativamente agli
            atti di straordinaria amministrazione;
          </li>
          <li>Assicurare ogni adempimento di natura previdenziale, assicurativa, legislativa e fiscale della parrocchia.</li>
        </ul>
      </>
    ),
  },
  {
    id: "giovanile",
    label: "Pastorale giovanile",
    title: "Pastorale giovanile parrocchiale",
    image: { src: foto("servizi/servizi-pastorale-giovanile", 1100), alt: "Ragazzi che giocano al tiro alla fune", width: 1800, height: 1200 },
    body: (
      <>
        <p>
          &ldquo;La Pastorale Giovanile è costituita dall&apos;insieme delle azioni che la comunità ecclesiale, animata
          dallo Spirito Santo, realizza con e per i giovani, per attuare in essi il progetto di salvezza di Dio, in
          riferimento alle loro concrete situazioni di vita.&rdquo; (Dizionario di Pastorale Giovanile).
        </p>
        <p>
          In concreto nella nostra parrocchia, la Pastorale Giovanile Parrocchiale è composta dall&apos;insieme dei
          gruppi che collaborano nel portare avanti le attività rivolte ai bambini, adolescenti e giovani, ovvero:
        </p>
        <ul>
          <li>Catechismo</li>
          <li>Oratorio estivo</li>
          <li>Servizio dei campetti parrocchiali</li>
        </ul>
      </>
    ),
  },
  {
    id: "liturgie",
    label: "Liturgie e sacramenti",
    title: "Servizi per le liturgie e i sacramenti",
    image: { src: foto("servizi/servizi-liturgie", 1100), alt: "Altare allestito per l'adorazione eucaristica", width: 1688, height: 1200 },
    body: (
      <>
        <p>
          Le liturgie eucaristiche, le celebrazioni della Parola e le azioni liturgiche dei momenti &ldquo;forti&rdquo;
          dell&apos;anno sono il luogo privilegiato del nostro incontro con Dio, dove la nostra spiritualità può trovare
          alimento e sostegno per aiutarci a progredire nel cammino di fede. Affinché siano ben preparate e realizzate,
          serve, oltre certamente all&apos;opera del sacerdote che presiede la celebrazione, anche l&apos;aiuto di laici:
        </p>
        <ul>
          <li>
            <strong>Servizio per la cura della sacrestia</strong> che si occupa di tenerla ordinata, di preparare la
            mensa eucaristica e di sistemare i fiori;
          </li>
          <li>
            <strong>Ministri straordinari della comunione</strong> che aiutano il sacerdote nella distribuzione del Corpo
            di Cristo (questo servizio è esteso alle visite ai malati che sono impossibilitati a partecipare alle
            celebrazioni eucaristiche);
          </li>
          <li>
            <strong>Ministranti</strong> che affiancano il celebrante nel disporre l&apos;occorrente per la liturgia
            eucaristica e aiutano l&apos;assemblea nelle preghiere e nei canti;
          </li>
          <li>
            <strong>Lettori della Parola</strong> in grado di capire e &ldquo;annunciare&rdquo; la Parola di Dio;
          </li>
          <li>
            <strong>Cantori</strong> che scelgono ed interpretano i canti alla luce del momento liturgico.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "spazi",
    label: "Cura degli ambienti",
    title: "Servizi per la cura degli ambienti",
    image: { src: foto("servizi/servizi-ambienti", 1100), alt: "Il gruppo dei volontari per la cura degli ambienti in chiesa", width: 2000, height: 1500 },
    body: (
      <>
        <p>
          Il decoro di una chiesa è il primo segno dell&apos;amore per Dio; la meditazione e la preghiera fatte in un
          ambiente accogliente, ordinato e pulito valorizzano e rafforzano il raccoglimento e l&apos;incontro spirituale
          con il Signore.
        </p>
        <p>
          Il mantenimento di questo decoro rappresenta un&apos;importante azione di volontariato che, svolta nel silenzio
          e in spirito di servizio, evidenzia un forte attaccamento alla comunità parrocchiale e la valorizzazione dei
          fedeli che la frequentano. Si tratta nello specifico di tutte quelle persone che si occupano di:
        </p>
        <ul>
          <li>
            <strong>Pulizia degli interni della chiesa e del sagrato</strong>, svolta ogni lunedì e venerdì mattina;
          </li>
          <li>
            <strong>Cura degli spazi verdi e dei fiori</strong>, svolta costantemente da alcuni volontari;
          </li>
          <li>
            <strong>Cura del parcheggio parrocchiale</strong>, che consiste in un servizio di controllo dell&apos;area
            adibita soprattutto durante le celebrazioni o gli eventi con maggior partecipazione di fedeli.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "poveri",
    label: "Servizi ai bisognosi",
    title: "Servizi per i più bisognosi",
    image: { src: foto("servizi/servizi-bisognosi", 1100), alt: "Le volontarie dei servizi ai bisognosi nel cortile della parrocchia", width: 2000, height: 1500 },
    body: (
      <>
        <p>
          Immaginare oggi una Chiesa fraterna significa coniugare strettamente liturgia, catechesi e carità dentro un
          cammino di comunione e di condivisione.
        </p>
        <p>
          Per provvedere alle numerose persone che chiedono un sostegno alla parrocchia, sono presenti due importanti
          servizi che cercano di sostenere tali richieste:
        </p>
        <ul>
          <li>
            Il <strong>centro d&apos;ascolto Caritas</strong>, che ogni martedì alle ore 10:00 accoglie la richiesta di
            numerose famiglie distribuendo vestiario e generi alimentari;
          </li>
          <li>
            <strong>Dame di Sant&apos;Alfonso</strong>, che attraverso la realizzazione di lavori fatti a mano, raccolgono
            fondi da destinare ai poveri del quartiere.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "ufficio",
    label: "Ufficio parrocchiale",
    title: "Ufficio parrocchiale",
    image: { src: foto("servizi/servizi-ufficio", 1100), alt: "I volontari dell'ufficio parrocchiale", width: 2000, height: 1333 },
    body: (
      <>
        <p>Presso l&apos;Ufficio parrocchiale è possibile:</p>
        <ul>
          <li>Prenotare la celebrazione di una santa messa per i defunti o per altre intenzioni particolari;</li>
          <li>Fissare la data di un battesimo, di un matrimonio o la celebrazione di un funerale;</li>
          <li>Avere i certificati relativi ai sacramenti celebrati in parrocchia;</li>
          <li>Richiedere ogni informazione per ricevere i sacramenti;</li>
          <li>Avere notizie relative alle diverse attività pastorali parrocchiali.</li>
        </ul>
        <p>
          L&apos;Ufficio parrocchiale è aperto nei giorni feriali dalle 17:00 alle 18:30 e il sabato dalle 10:00 alle
          12:00.
        </p>
      </>
    ),
  },
  {
    id: "festa",
    label: "Festa parrocchiale",
    title: "Organizzazione della festa parrocchiale",
    image: { src: foto("servizi/servizi-festa", 1024), alt: "Processione della Madonna del Rosario durante la festa parrocchiale", width: 1024, height: 681 },
    body: (
      <>
        <p>
          Il servizio dell&apos;organizzazione della festa parrocchiale è formato da un gruppo di laici che, in stretta
          collaborazione con il parroco, hanno il compito di organizzare i Festeggiamenti in onore della Madonna del
          Rosario nel rispetto della Liturgia, della tradizione e della devozione popolare.
        </p>
        <p>
          Non è un gruppo chiuso, ma sempre aperto alla partecipazione di chiunque ne voglia far parte, giovani e meno
          giovani, uomini o donne che siano, apportando il proprio contributo in termini di idee e di lavoro. Le sue
          attività (riunioni e programmazioni) vengono svolte presso i locali della parrocchia.
        </p>
      </>
    ),
  },
  {
    id: "presepe",
    label: "Allestimento presepe",
    title: "Allestimento del presepe",
    image: { src: foto("servizi/servizi-presepe", 1100), alt: "Il presepe allestito in chiesa", width: 1200, height: 1200 },
    body: (
      <p>
        Per favorire la preghiera individuale e comunitaria in parrocchia è sempre presente un&apos;installazione in
        linea con il tempo liturgico: presepe natalizio, presepe pasquale o un angolo dedicato alla Madonna. Di fronte a
        queste vere e proprie opere d&apos;arte si ritrova, specialmente la domenica e nei tempi forti di Avvento e
        Quaresima, tutta la comunità parrocchiale e non solo: in tanti vengono ad ammirare questo straordinario lavoro
        artigianale frutto del servizio gratuito di un gruppo di parrocchiani che mettono insieme il loro saper fare
        frutto di esperienza e lavoro e lo offrono alla parrocchia come luogo privilegiato di preghiera.
      </p>
    ),
  },
  {
    id: "cornelia",
    label: "Cappella Santa Elisabetta",
    title: "Servizi svolti alla cappella Santa Elisabetta",
    image: { src: foto("servizi/servizi-santa-elisabetta", 1100), alt: "L'interno della cappella di Santa Elisabetta", width: 1984, height: 1488 },
    body: (
      <>
        <p>
          Grazie alla cura particolare di alcuni fedeli della zona e alla disponibilità dei sacerdoti, la
          &quot;storica&quot; Cappellina di Santa Cornelia, dedicata a Santa Elisabetta, mantiene la celebrazione
          eucaristica domenicale.
        </p>
        <p>
          Una realtà minuta ma salda nella preghiera e nella tradizione che è particolarmente viva durante la festa
          annuale della Parrocchia, che si svolge nel mese di Maggio mediante la recita del santo Rosario e una serata di
          festa a cura delle famiglie della zona che partecipa alle attività della parrocchia e al comitato della festa.
        </p>
      </>
    ),
  },
];

export default function ServiziPage() {
  return (
    <>
      <PageTitle
        kicker="La nostra parrocchia"
        title={
          <>
            Donarsi alla{" "}
            <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>comunità</span>.
          </>
        }
        lead="I servizi parrocchiali: ognuno, secondo il proprio carisma, offre il dono di sé per il bene di tutti."
      />

      <section style={{ padding: 0 }}>
        <div className="container">
          <figure className="par-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={foto("servizi/servizi-intestazione", 2000)} alt="La chiesa parrocchiale gremita durante una celebrazione" width={2000} height={1275} />
          </figure>
        </div>
      </section>

      <section style={{ paddingBottom: 48 }}>
        <div className="container-narrow">
          <blockquote className="par-epigraph">
            <p>
              &ldquo;Come in un solo corpo abbiamo molte membra e tutte le membra non hanno una medesima funzione, così
              noi, che siamo molti, siamo un solo corpo in Cristo, e, individualmente, siamo membra l&apos;uno
              dell&apos;altro. Avendo pertanto doni differenti secondo la grazia che ci è stata concessa, se abbiamo dono
              di profezia, profetizziamo conformemente alla fede; se di ministero, attendiamo al ministero; se
              d&apos;insegnamento, all&apos;insegnare; se di esortazione, all&apos;esortare; chi dà, dia con semplicità;
              chi presiede, lo faccia con diligenza; chi fa opere di misericordia, le faccia con gioia.&rdquo;
            </p>
            <cite>Rm 12,3-8</cite>
          </blockquote>
          <p style={{ fontSize: 17, lineHeight: 1.7 }}>
            Ognuno di noi è chiamato nella quotidianità. E ognuno per il proprio carisma può dare il dono di sé
            all&apos;interno dei servizi parrocchiali che promuovono il lavoro laicale per la comunità. In essi è molto
            sviluppato il senso di appartenenza responsabile alla comunità. E il senso di appartenenza ha, come primo
            frutto concreto, la consapevolezza che le doti di cui il Signore ha arricchito ciascuno (spirituali e non)
            sono anche per il bene di tutti.
          </p>
          <ParishIndex sections={SEZIONI} />
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
