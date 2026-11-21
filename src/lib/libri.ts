/**
 * Libri consigliati dalla parrocchia (letture proposte durante le catechesi).
 * Usati nella pagina Risorse (tutti) e in quella del Santo titolare (le opere di sant'Alfonso).
 * Copertine su Cloudinary in AVIF, cartella santalfonso/libri.
 */

export type Libro = {
  coverUrl: string;
  autore: string;
  titolo: string;
  didascalia: string;
  amazonUrl: string;
};

const CDN = "https://res.cloudinary.com/dksk2bjyd/image/upload/santalfonso/libri";
export const ALFONSO = "Sant'Alfonso Maria de' Liguori";
const MIRIANO = "Costanza Miriano";

/** Nello stesso ordine del vecchio sito. */
export const LIBRI: Libro[] = [
  {
    coverUrl: `${CDN}/ricominciamo-per-sempre.avif`,
    autore: "Ricardo Reyes Castillo",
    titolo: "Ricominciamo da «per sempre»",
    didascalia:
      "Attraverso le pagine di questo libro ho cercato di aiutare una mia cara amica che, in un periodo di profonda crisi, mi chiedeva consiglio su come rinnovare ogni giorno il proprio matrimonio. Vorrei che le righe delicate e sincere di questo libro suonassero quasi come una poesia capace di far riavvicinare all'amore.",
    amazonUrl: "https://www.amazon.it/dp/8868797208/",
  },
  {
    coverUrl: `${CDN}/diario-soldato-semplice.avif`,
    autore: MIRIANO,
    titolo: "Diario di un soldato semplice",
    didascalia:
      "Costanza Miriano alcuni anni fa ha scoperto, un po' per caso, la potenza della rete, capace di chiamare a raccolta, con un silenzioso squillo di tromba, un popolo unito dalla passione per le stesse battaglie, che per un cristiano hanno sempre due fronti. Il primo è quello interno, lì dove si lavora il proprio cuore, e si combatte in ginocchio. Il secondo è quello esterno, dove si cerca di costruire il mondo.",
    amazonUrl: "https://www.amazon.it/dp/8845400239/",
  },
  {
    coverUrl: `${CDN}/si-salvi-chi-vuole.avif`,
    autore: MIRIANO,
    titolo: "Si salvi chi vuole",
    didascalia:
      "Avete letto di tutto, dalle regole giapponesi al metodo danese, avete ascoltato guru improbabili, dal Grande Cocomero ai maestri orientali. Perché non provare allora a riscoprire una tradizione che, almeno, ha duemila anni di storia e miliardi di clienti molto soddisfatti e indubbiamente rimborsati?",
    amazonUrl: "https://www.amazon.it/dp/8845426548/",
  },
  {
    coverUrl: `${CDN}/quando-eravamo-femmine.avif`,
    autore: MIRIANO,
    titolo: "Quando eravamo femmine",
    didascalia:
      "Noi donne ci siamo, per così dire, emancipate, abbiamo conquistato la libertà di scegliere, nel lavoro, nell'amore, nella vita. Ma a che prezzo? Siamo davvero più felici? E soprattutto, rendiamo più felici le persone che ci sono affidate? Non è che per caso femminismo, rivoluzione sessuale e battaglie per la parità hanno finito per lasciarci più sole e tristi?",
    amazonUrl: "https://www.amazon.it/dp/8845426084/",
  },
  {
    coverUrl: `${CDN}/obbedire-e-meglio.avif`,
    autore: MIRIANO,
    titolo: "Obbedire è meglio",
    didascalia:
      "Tutti cerchiamo il segreto della felicità. Qualcuno vorrebbe convincerci che si trova nell'assoluta libertà. E se, al contrario, quel segreto si nascondesse nell'obbedienza? Obbedienza a come la natura ci ha creati, alle regole di saggezza che i secoli hanno tramandato; obbedienza alla propria vocazione, ai consigli di chi ne sa, e perfino a quel marito o a quella moglie il cui amore forse è da riscoprire.",
    amazonUrl: "https://www.amazon.it/dp/8845425819/",
  },
  {
    coverUrl: `${CDN}/sposala-e-muori-per-lei.avif`,
    autore: MIRIANO,
    titolo: "Sposala e muori per lei",
    didascalia:
      "Sta alla donna aiutare l'uomo a ritrovare il suo ruolo virile, paterno, autorevole. Un ruolo che si è un po' perso per strada, così che troppe volte ci ritroviamo in casa dei maschi disorientati, poco preparati a prendere in mano le situazioni più delicate e a salvaguardare l'equilibrio della famiglia.",
    amazonUrl: "https://www.amazon.it/dp/8845425703/",
  },
  {
    coverUrl: `${CDN}/sposati-e-sii-sottomessa.avif`,
    autore: MIRIANO,
    titolo: "Sposati e sii sottomessa",
    didascalia:
      "Sposare un uomo, che appartiene irrimediabilmente a un'altra razza, e vivere con lui, è un'impresa. Ma è un'avventura meravigliosa. È la sfida dell'impegno, di giocarsi tutto, di accogliere e accompagnare nuove vite. Una sfida che si può affrontare solo se ognuno fa la sua parte.",
    amazonUrl: "https://www.amazon.it/dp/8845425738/",
  },
  {
    coverUrl: `${CDN}/pratica-amare-gesu.avif`,
    autore: ALFONSO,
    titolo: "Pratica di amare Gesù Cristo",
    didascalia:
      `Uno dei meriti di Sant’Alfonso è quello di aver avuto la “pretesa” pastorale di portare tutti, laici e non, alla perfezione della vita. Probabilmente questo è il più bel libro di Sant’Alfonso: tutto incentrato sull’arte di amare Gesù Cristo.`,
    amazonUrl:
      "https://www.amazon.it/Pratica-Cristo-Alfonso-Maria-Liguori/dp/8884043239/ref=sr_1_1?ie=UTF8&qid=1550316295&sr=8-1&keywords=9788884043238",
  },
  {
    coverUrl: `${CDN}/visite-santissimo.avif`,
    autore: ALFONSO,
    titolo: "Visite al Santissimo Sacramento e a Maria Santissima",
    didascalia:
      "Un manuale di preghiera agile e accessibile a tutti, dallo stile scorrevole e piacevole, di contenuto ricco. Aprilo in qualunque chiesa dove sia presente il Santissimo Sacramento, o durante l'adorazione eucaristica.",
    amazonUrl:
      "https://www.amazon.it/Visite-santissimo-sacramento-Maria-Santissima/dp/8884041880/ref=sr_1_1?ie=UTF8&qid=1550317032&sr=8-1&keywords=9788884041883",
  },
  {
    coverUrl: `${CDN}/massime-eterne.avif`,
    autore: ALFONSO,
    titolo: "Massime Eterne",
    didascalia:
      "Il libro che aiuta il credente a parlare con Dio, a intensificare il rapporto personale con lui, specialmente nei momenti di dolore e nelle prove della vita. Un sussidio efficace per conseguire la salvezza eterna.",
    amazonUrl:
      "https://www.amazon.it/Massime-eterne-Ediz-caratteri-grandi/dp/8884041929/ref=sr_1_1?ie=UTF8&qid=1550315882&sr=8-1&keywords=9788884041920",
  },
  {
    coverUrl: `${CDN}/glorie-di-maria.avif`,
    autore: ALFONSO,
    titolo: "Le Glorie di Maria",
    didascalia:
      "Il più grande capolavoro mariano di Sant'Alfonso: meditazioni sulla Salve Regina, le sette principali feste di Maria, i sette dolori, le sue virtù e quasi 100 esempi dell'azione di Maria Santissima.",
    amazonUrl:
      "https://www.amazon.it/glorie-Maria-Alfonso-Liguori/dp/888404216X/ref=sr_1_1?ie=UTF8&qid=1550320559&sr=8-1&keywords=9788884042163",
  },
  {
    coverUrl: `${CDN}/apparecchio-alla-morte.avif`,
    autore: ALFONSO,
    titolo: "Apparecchio alla Morte",
    didascalia:
      "Nato dalla predicazione trentennale di Sant'Alfonso nei paesi più depressi del Regno di Napoli. Al centro il tema dei Novissimi, per risvegliare nei fedeli il senso del peccato e la speranza della vita eterna.",
    amazonUrl:
      "https://www.amazon.it/Apparecchio-considerazioni-meditare-sacerdoti-predicare/dp/882156035X/ref=sr_1_1?ie=UTF8&qid=1550321812&sr=8-1&keywords=9788821560354",
  },
  {
    coverUrl: `${CDN}/conversare-con-dio.avif`,
    autore: ALFONSO,
    titolo: "Conversare con Dio",
    didascalia:
      `"Vedo da una parte l'assoluta necessità della preghiera, e all'incontro vedo che i cristiani praticano poco questo gran mezzo della loro salvezza." Un'osservazione del Santo quanto mai attuale.`,
    amazonUrl:
      "https://www.amazon.it/Conversare-Dio-mezzo-della-preghiera/dp/8884042623/ref=sr_1_4?s=books&ie=UTF8&qid=1550322248&sr=1-4&keywords=del+gran+mezzo+della+preghiera",
  },
  {
    coverUrl: `${CDN}/uniformita-volonta-dio.avif`,
    autore: ALFONSO,
    titolo: "Uniformità alla Volontà di Dio",
    didascalia:
      `Accogliere in tutto e per tutto la volontà di Dio è possibile. Sant'Alfonso spiega: "Uniformità significa fare della volontà di Dio e della nostra una sola volontà".`,
    amazonUrl:
      "https://www.amazon.it/Uniformit%C3%A0-volont%C3%A0-Lamore-opuscoli-affini/dp/888404345X/",
  },
  {
    coverUrl: `${CDN}/solitudine-aridita.avif`,
    autore: ALFONSO,
    titolo: "Solitudine e Aridità Spirituale",
    didascalia:
      "Sant'Alfonso tratta argomenti delicatissimi con garbo e profondità. Quando tutto sembra oscurità, riaccende la luce della fede, della speranza, dell'ottimismo.",
    amazonUrl:
      "https://www.amazon.it/Solitudine-aridit%C3%A0-spirituale-Alfonso-Liguori/dp/8884042879/",
  },
  {
    coverUrl: `${CDN}/meditazioni-passione.avif`,
    autore: ALFONSO,
    titolo: "Meditazioni sulla Passione di Gesù Cristo",
    didascalia:
      "Da chi mai i santi hanno preso fortezza per sopportare i tormenti, se non dalle pene di Gesù crocifisso? Non c'è esercizio più adatto al perfetto amore che meditare spesso sulla sua Passione.",
    amazonUrl:
      "https://www.amazon.it/Meditazioni-sulla-passione-Ges%C3%B9-Cristo/dp/8864093141/",
  },
];

/** Le opere di sant'Alfonso, per la pagina del Santo titolare. */
export const LIBRI_SANT_ALFONSO = LIBRI.filter((l) => l.autore === ALFONSO);
