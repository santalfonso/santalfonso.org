/**
 * Popola il database con l'utente amministratore iniziale e i contenuti
 * recuperati dal sito storico www.santalfonso.org.
 *
 * Uso: npm run db:seed
 */
import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { articles, events, users } from "../src/db/schema";

const ADMIN_EMAIL = "gabrielemichelenapoli@gmail.com";
const ADMIN_PASSWORD = "cambiami123"; // Da cambiare al primo accesso!

const seedArticles = [
  {
    title: "Intitolazione Piazza a Don Eulogio Carballido Diaz",
    slug: "intitolazione-piazza-a-don-eulogio-carballido-diaz",
    excerpt:
      "Il 12 ottobre alle ore 16:00 verranno inaugurate, alla presenza di Autorità cittadine e religiose, le due nuove aree di pubblica circolazione.",
    body: `Il 12 ottobre 2023 alle ore 16:00 si terrà l'inaugurazione di due nuove aree pubbliche situate in via della Giustiniana, nella zona di Prima Porta, tra la Parrocchia e via Inverigo.

Le aree saranno dedicate a due figure importanti per la comunità locale: **Don Eulogio Carballido Diaz**, definito come "Il prete della gente", e **Calogero Quattrocchi**, detto Lillo. Entrambi hanno contribuito significativamente alla crescita sociale e spirituale della comunità di Prima Porta.

L'evento vedrà la partecipazione di autorità cittadine e religiose. La parrocchia invita i fedeli e i cittadini a partecipare numerosi all'inaugurazione, che rappresenta un'occasione per rendere omaggio a questi due personaggi attraverso l'intitolazione di una piazza e una via a loro ricordo.`,
    publishedAt: "2023-10-05T08:00:00.000Z",
  },
  {
    title: "XX Anniversario affidamento delle famiglie alla Madonna",
    slug: "xx-anniversario-affidamento-delle-famiglie-alla-madonna",
    excerpt:
      "In occasione del XX anniversario dell'affidamento delle famiglie alla Madonna, in ottobre ci onorano con una gradita visita i sacerdoti che hanno servito la parrocchia.",
    body: `La parrocchia Sant'Alfonso Maria de' Liguori celebra il ventesimo anniversario dell'affidamento delle famiglie alla Madonna. In questa occasione, durante il mese di ottobre, la comunità riceverà la visita di sacerdoti che hanno precedentemente servito la parrocchia.

Le celebrazioni includono messe alle 18:30 seguite da un momento di fraternità condiviso con i sacerdoti e la comunità. Il calendario prevede:

- **Domenica 1° ottobre:** don Elio
- **Lunedì 2 ottobre:** don Renzo
- **Lunedì 16 ottobre:** don Dario
- **Lunedì 23 ottobre:** don Nelson
- **Domenica 29 ottobre:** Monsignor Daniele Salera (vescovo del settore)

L'invito è rivolto a tutti i parrocchiani a partecipare e condividere qualcosa di buono con i sacerdoti e la comunità parrocchiale.`,
    publishedAt: "2023-10-01T08:00:00.000Z",
  },
  {
    title:
      "L'Atto di Consacrazione al Cuore Immacolato di Maria: in preghiera tutta la diocesi di Roma",
    slug: "atto-di-consacrazione-al-cuore-immacolato-di-maria",
    excerpt:
      "La diocesi di Roma si unirà spiritualmente a Papa Francesco per pregare insieme l'Atto di Consacrazione al Cuore Immacolato di Maria.",
    body: `La diocesi di Roma si unirà spiritualmente a Papa Francesco per pregare insieme l'Atto di Consacrazione al Cuore Immacolato di Maria.

Tutta la comunità parrocchiale è invitata a unirsi in preghiera in comunione con il Santo Padre e con la diocesi.`,
    publishedAt: "2022-03-25T08:00:00.000Z",
  },
  {
    title:
      "150° Anniversario della proclamazione di Sant'Alfonso Maria de' Liguori dottore della Chiesa",
    slug: "150-anniversario-proclamazione-dottore-della-chiesa",
    excerpt:
      "Il messaggio di Papa Francesco per i 150 anni dalla proclamazione del nostro santo titolare a Dottore della Chiesa.",
    body: `In occasione dei 150 anni dalla proclamazione di Sant'Alfonso Maria de' Liguori a Dottore della Chiesa (avvenuta il 23 marzo 1871 sotto il pontificato di Pio IX), Papa Francesco ha indirizzato un messaggio al Superiore Generale della Congregazione del Santissimo Redentore.

Il Papa evidenzia come la specificità della proposta morale alfonsiana risieda nel saper indicare "la via sicura nel groviglio delle opinioni contrastanti del rigorismo e del lassismo".

Sant'Alfonso, formatosi in una mentalità rigorista, si converte alla "benignità" attraverso l'ascolto della realtà. La sua esperienza missionaria nelle periferie esistenziali, l'impegno confessionale, la fondazione della Congregazione e il ruolo di Vescovo lo trasformano in "padre e maestro di misericordia".

Papa Francesco sottolinea l'importanza dell'ascolto della realtà per annunciare il Vangelo in una società in rapido cambiamento. La teologia morale non deve limitarsi ai principi teorici, ma deve "farsi carico propositivamente della realtà" e accompagnare le coscienze nel discernimento del bene.

Il messaggio conclude invitando la Congregazione e l'Accademia Alfonsiana al dialogo costruttivo con tutte le culture, affinché possano ricercare risposte apostoliche a favore della fragilità umana.`,
    publishedAt: "2021-08-01T08:00:00.000Z",
  },
];

const seedEvents = [
  {
    title: "Adorazione eucaristica",
    description:
      "Adorazione eucaristica settimanale, ogni martedì dalle 8:30 alle 18:30.",
    location: "Cappellina feriale",
    startsAt: "2026-06-16T06:30:00.000Z",
    endsAt: "2026-06-16T16:30:00.000Z",
  },
  {
    title: "Gruppo di preghiera di Padre Pio",
    description:
      "Incontro mensile di preghiera, meditazione e ascolto della Parola di Dio (ogni quarto lunedì del mese).",
    location: "Cappellina feriale",
    startsAt: "2026-06-22T14:45:00.000Z",
    endsAt: null,
  },
  {
    title: "Festa della Madonna del Rosario",
    description:
      "Festeggiamenti annuali in onore della Madonna del Rosario: celebrazioni, processione e momenti di festa per tutta la comunità.",
    location: "Parrocchia Sant'Alfonso Maria de' Liguori",
    startsAt: "2026-10-04T08:30:00.000Z",
    endsAt: null,
  },
];

async function main() {
  // Utente amministratore
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, ADMIN_EMAIL),
  });
  if (existingAdmin) {
    console.log(`Utente admin già presente: ${ADMIN_EMAIL}`);
  } else {
    await db.insert(users).values({
      name: "Gabriele Michele Napoli",
      email: ADMIN_EMAIL,
      passwordHash: await hash(ADMIN_PASSWORD, 10),
      role: "admin",
    });
    console.log(`Creato utente admin ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`);
  }

  // Articoli
  for (const article of seedArticles) {
    const existing = await db.query.articles.findFirst({
      where: eq(articles.slug, article.slug),
    });
    if (existing) {
      console.log(`Articolo già presente: ${article.slug}`);
      continue;
    }
    await db.insert(articles).values({ ...article, published: true });
    console.log(`Creato articolo: ${article.title}`);
  }

  // Eventi di esempio
  for (const event of seedEvents) {
    const existing = await db.query.events.findFirst({
      where: eq(events.title, event.title),
    });
    if (existing) {
      console.log(`Evento già presente: ${event.title}`);
      continue;
    }
    await db.insert(events).values(event);
    console.log(`Creato evento: ${event.title}`);
  }

  console.log("Seed completato.");
}

main().then(() => process.exit(0));
