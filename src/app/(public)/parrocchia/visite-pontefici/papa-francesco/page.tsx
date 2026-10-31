import type { Metadata } from "next";
import PopeVisit from "@/components/parrocchia/PopeVisit";
import { foto } from "@/lib/parrocchia-foto";
import "@/app/parrocchia.css";

export const metadata: Metadata = { title: "Visita di Papa Francesco" };

export default function VisitaPapaFrancescoPage() {
  return (
    <PopeVisit
      name={
        <>
          Visita di{" "}
          <span style={{ background: "linear-gradient(90deg, var(--azure-deep), var(--azure))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Papa Francesco</span>
        </>
      }
      date="6 Gennaio 2014"
      hero={{ src: foto("pontefici/francesco-intestazione", 2000), alt: "Papa Francesco saluta i fedeli nel presepe vivente della parrocchia", width: 1951, height: 1244 }}
      intro={
        <p>
          Era il 3 gennaio del 2014 quando il nostro parroco, Don Dario Criscuoli, riceve personalmente la telefonata da
          Papa Francesco per informarlo che avrebbe avuto il piacere di visitare il nostro Presepe Vivente. La telefonata
          è stata frutto di un invito al Papa stesso da parte dei nostri parrocchiani che gli hanno chiesto di venire a
          visitare la piccola raffigurazione di Betlemme che loro stessi hanno realizzato nel piazzale della parrocchia.
        </p>
      }
      blocks={[
        {
          photo: { src: foto("pontefici/francesco-mate", 1100), alt: "Papa Francesco sorridente tra i figuranti del presepe vivente", width: 1280, height: 868 },
          text: (
            <p>
              Il 6 gennaio, solo tre giorni dopo la sua telefonata, il Papa è venuto a farci visita. Arrivato verso le
              16.15, superato l&apos;acquedotto che segnava l&apos;ingresso a Betlemme e dato uno sguardo a tutte le
              costruzioni, si è rivolto verso il parroco e gli ha detto: &quot;Tu sei matto! - poi aggiunse - Ma queste
              pazzie piacciono a Dio!&quot;. È iniziata così la visita del pontefice che ha voluto salutare uno per uno
              tutti i 200 figuranti che lavoravano nelle botteghe, stalle e osterie della piccola città. Con ciascuno di
              loro si è intrattenuto parlando e scherzando, assaggiando persino dei prodotti locali, come la ricotta
              preparata dai pastori e alcune ciliegie. Arrivato dai pastori, ha accettato di farsi mettere un agnellino
              sulle spalle come immagine del buon pastore; lui stesso all&apos;inizio del suo pontificato aveva detto ai
              sacerdoti: &quot;Questo vi chiedo: di essere pastori con &apos;l&apos;odore delle pecore&apos;, pastori in
              mezzo al proprio gregge, e pescatori di uomini&quot;.
            </p>
          ),
          band: { src: foto("pontefici/francesco-interno", 2000), alt: "Papa Francesco in preghiera nella chiesa parrocchiale", width: 2000, height: 1355 },
        },
        {
          photo: { src: foto("pontefici/francesco-ricotta", 1100), alt: "Papa Francesco assaggia la ricotta preparata dai pastori del presepe", width: 1280, height: 1075 },
          text: (
            <>
              <p>
                Nonostante la Sua voleva essere una &quot;visita privata&quot; rivolta al Presepe Vivente, Papa Francesco
                non si è sottratto al voler salutare la folla che da fuori &quot;Betlemme&quot; aspettava sperando di
                poterlo salutare. Alla folla si è rivolto dicendo: &quot;Vi ringrazio dell&apos;accoglienza e vi ringrazio
                del fervore cristiano. Ringrazio questa comunità e questo bel presepe vivente, del lavoro, della catechesi.
                Ma ora vi dico, finisce Natale e poi? Comincia l&apos;anno, ma Gesù sempre rimane con noi. Credete
                questo?&quot; Ha chiesto ai più piccoli avviando un dialogo con loro. Dopo la loro risposta affermativa ha
                aggiunto: &quot;Gesù vince il diavolo? E il diavolo ci vince a tutti noi? No! Siete bravi!&quot; ha
                commentato, complimentandosi con le catechiste per la preparazione dimostrata dai bambini. Dopo aver
                pregato insieme un Ave Maria per i bambini, i bambini in arrivo e i nonni il Papa ha concluso con tre
                &quot;evviva&quot; finali per Gesù, Giuseppe e Maria.
              </p>
              <p>
                Dopo circa un&apos;ora e mezza, alle 17.50, dopo aver salutato anche le persone che erano per strada, fuori
                dalla parrocchia, il papa è risalito in macchina per tornare in Vaticano.
              </p>
            </>
          ),
          band: { src: foto("pontefici/francesco-nativita", 2000), alt: "Papa Francesco accarezza il Bambino nella scena della Natività", width: 2000, height: 1347 },
        },
      ]}
      video={{ id: "X5_m6NFSdLU", title: "Video integrale della visita di Papa Francesco" }}
    />
  );
}
