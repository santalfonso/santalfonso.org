/**
 * Canti iniziali per "Lodate, lodate Iddio".
 *
 * SOLO testi di pubblico dominio: inni, sequenze e antifone latine della
 * tradizione e canti italiani tradizionali di autori morti da oltre 70 anni.
 * I canti moderni (protetti) vanno caricati dall'amministratore solo se la
 * parrocchia ne possiede la licenza.
 *
 * Formato del testo: ChordPro ridotto (vedi contratto condiviso).
 * Gli accordi sono indicati solo dove la melodia tradizionale è nota con
 * sicurezza; altrimenti il testo è senza accordi.
 */

export type SeedSong = {
  slug: string;
  title: string;
  author?: string;
  copyrightNote: string;
  musicalKey?: string;
  body: string;
  moments: string[];
  seasons: string[];
};

const PD_ORDINARIO = "Pubblico dominio — testo latino dell'Ordinario della Messa";
const PD_GREGORIANO = "Pubblico dominio — antifona/inno latino della tradizione gregoriana";

/** Rimuove l'indentazione comune e le righe vuote iniziali/finali. */
function t(s: string): string {
  const lines = s.replace(/^\n+|\s+$/g, "").split("\n");
  const indent = Math.min(
    ...lines.filter((l) => l.trim()).map((l) => l.match(/^ */)![0].length),
  );
  return lines.map((l) => l.slice(indent).trimEnd()).join("\n");
}

export const seedSongs: SeedSong[] = [
  // ───────────────────────── ORDINARIO DELLA MESSA ─────────────────────────
  {
    slug: "gloria-in-excelsis-deo",
    title: "Gloria in excelsis Deo",
    copyrightNote: PD_ORDINARIO,
    body: t(`
      Gloria in excelsis Deo
      et in terra pax hominibus bonae voluntatis.

      Laudamus te, benedicimus te,
      adoramus te, glorificamus te,
      gratias agimus tibi propter magnam gloriam tuam,
      Domine Deus, Rex caelestis,
      Deus Pater omnipotens.

      Domine Fili unigenite, Iesu Christe,
      Domine Deus, Agnus Dei, Filius Patris,
      qui tollis peccata mundi, miserere nobis;
      qui tollis peccata mundi, suscipe deprecationem nostram.
      Qui sedes ad dexteram Patris, miserere nobis.

      Quoniam tu solus Sanctus, tu solus Dominus,
      tu solus Altissimus, Iesu Christe,
      cum Sancto Spiritu: in gloria Dei Patris.
      Amen.
    `),
    moments: ["gloria"],
    seasons: ["ordinario", "natale", "pasqua", "spirito-santo", "matrimoni"],
  },
  {
    slug: "sanctus",
    title: "Sanctus",
    copyrightNote: PD_ORDINARIO,
    body: t(`
      Sanctus, Sanctus, Sanctus
      Dominus Deus Sabaoth.
      Pleni sunt caeli et terra gloria tua.
      Hosanna in excelsis.

      Benedictus qui venit in nomine Domini.
      Hosanna in excelsis.
    `),
    moments: ["santo"],
    seasons: ["ordinario", "avvento", "natale", "quaresima", "pasqua", "matrimoni", "funerali"],
  },
  {
    slug: "agnus-dei",
    title: "Agnus Dei",
    copyrightNote: PD_ORDINARIO,
    body: t(`
      Agnus Dei, qui tollis peccata mundi:
      miserere nobis.

      Agnus Dei, qui tollis peccata mundi:
      miserere nobis.

      Agnus Dei, qui tollis peccata mundi:
      dona nobis pacem.
    `),
    moments: ["agnello"],
    seasons: ["ordinario", "avvento", "natale", "quaresima", "pasqua", "perdono", "matrimoni", "funerali"],
  },

  // ───────────────────────────────── PACE ─────────────────────────────────
  {
    slug: "da-pacem-domine",
    title: "Da pacem, Domine",
    copyrightNote: PD_GREGORIANO,
    body: t(`
      Da pacem, Domine, in diebus nostris,
      quia non est alius
      qui pugnet pro nobis,
      nisi tu, Deus noster.
    `),
    moments: ["pace"],
    seasons: ["ordinario", "avvento", "quaresima"],
  },
  {
    slug: "ubi-caritas",
    title: "Ubi caritas",
    copyrightNote: "Pubblico dominio — inno latino tradizionale (IX sec.)",
    body: t(`
      {soc}
      Ubi caritas et amor, Deus ibi est.
      {eoc}

      Congregavit nos in unum Christi amor.
      Exsultemus, et in ipso iucundemur.
      Timeamus, et amemus Deum vivum.
      Et ex corde diligamus nos sincero.

      Simul ergo cum in unum congregamur:
      ne nos mente dividamur, caveamus.
      Cessent iurgia maligna, cessent lites.
      Et in medio nostri sit Christus Deus.

      Simul quoque cum beatis videamus
      glorianter vultum tuum, Christe Deus:
      gaudium, quod est immensum atque probum,
      saecula per infinita saeculorum. Amen.
    `),
    moments: ["offertorio", "pace", "comunione"],
    seasons: ["ordinario", "quaresima", "matrimoni"],
  },

  // ───────────────────────────────── AVVENTO ─────────────────────────────────
  {
    slug: "rorate-caeli",
    title: "Rorate caeli",
    copyrightNote: "Pubblico dominio — testo latino tradizionale (da Isaia)",
    body: t(`
      {soc}
      Rorate caeli desuper,
      et nubes pluant iustum.
      {eoc}

      Ne irascaris, Domine, ne ultra memineris iniquitatis:
      ecce civitas Sancti facta est deserta:
      Sion deserta facta est, Ierusalem desolata est:
      domus sanctificationis tuae et gloriae tuae,
      ubi laudaverunt te patres nostri.

      Peccavimus, et facti sumus tamquam immundus nos,
      et cecidimus quasi folium universi:
      et iniquitates nostrae quasi ventus abstulerunt nos:
      abscondisti faciem tuam a nobis,
      et allisisti nos in manu iniquitatis nostrae.

      Vide, Domine, afflictionem populi tui,
      et mitte quem missurus es:
      emitte Agnum dominatorem terrae,
      de Petra deserti ad montem filiae Sion:
      ut auferat ipse iugum captivitatis nostrae.

      Consolamini, consolamini, popule meus:
      cito veniet salus tua:
      quare maerore consumeris, quia innovavit te dolor?
      Salvabo te, noli timere:
      ego enim sum Dominus Deus tuus,
      Sanctus Israel, Redemptor tuus.
    `),
    moments: ["iniziale", "offertorio"],
    seasons: ["avvento"],
  },
  {
    slug: "veni-veni-emmanuel",
    title: "Veni, veni, Emmanuel",
    copyrightNote: "Pubblico dominio — inno latino tradizionale (Psalteriolum, 1710)",
    body: t(`
      Veni, veni, Emmanuel,
      captivum solve Israel,
      qui gemit in exilio,
      privatus Dei Filio.

      {soc}
      Gaude! Gaude! Emmanuel
      nascetur pro te, Israel!
      {eoc}

      Veni, o Iesse virgula,
      ex hostis tuos ungula,
      de specu tuos tartari
      educ et antro barathri.

      Veni, veni, o Oriens,
      solare nos adveniens,
      noctis depelle nebulas,
      dirasque noctis tenebras.

      Veni, Clavis Davidica,
      regna reclude caelica,
      fac iter tutum superum,
      et claude vias inferum.

      Veni, veni, Adonai,
      qui populo in Sinai
      legem dedisti vertice
      in maiestate gloriae.
    `),
    moments: ["iniziale", "finale"],
    seasons: ["avvento"],
  },
  {
    slug: "alma-redemptoris-mater",
    title: "Alma Redemptoris Mater",
    copyrightNote: PD_GREGORIANO,
    body: t(`
      Alma Redemptoris Mater, quae pervia caeli
      porta manes, et stella maris,
      succurre cadenti, surgere qui curat, populo:
      tu quae genuisti, natura mirante,
      tuum sanctum Genitorem,
      Virgo prius ac posterius,
      Gabrielis ab ore sumens illud Ave,
      peccatorum miserere.
    `),
    moments: ["finale"],
    seasons: ["avvento", "natale", "maria"],
  },

  // ───────────────────────────────── NATALE ─────────────────────────────────
  {
    slug: "adeste-fideles",
    title: "Adeste fideles",
    author: "Tradizionale (attribuito a J. F. Wade, XVIII sec.)",
    copyrightNote: "Pubblico dominio — inno latino del XVIII secolo",
    musicalKey: "G",
    body: t(`
      [G]Adeste fi[D]deles, [G]laeti trium[D]phantes,
      [Em]venite, [D]venite [A7]in Beth[D]lehem.
      [G]Natum vi[D]dete [G]Regem ange[C]lorum:

      {soc}
      [G]Venite ado[D]remus, [G]venite ado[D]remus,
      [G]venite ado[C]remus [G]Do[D]mi[G]num.
      {eoc}

      En grege relicto, humiles ad cunas
      vocati pastores approperant:
      et nos ovanti gradu festinemus.

      Cantet nunc io chorus angelorum,
      cantet nunc aula caelestium:
      Gloria, gloria in excelsis Deo!

      Ergo qui natus die hodierna,
      Iesu, tibi sit gloria:
      Patris aeterni Verbum caro factum.
    `),
    moments: ["iniziale", "offertorio", "finale"],
    seasons: ["natale"],
  },
  {
    slug: "tu-scendi-dalle-stelle",
    title: "Tu scendi dalle stelle",
    author: "S. Alfonso Maria de' Liguori",
    copyrightNote: "Pubblico dominio — S. Alfonso M. de' Liguori (1754)",
    musicalKey: "G",
    body: t(`
      [G]Tu scendi dalle [D]stelle, o Re del [G]Cielo,
      e vieni in una [D]grotta al freddo e al [G]gelo.
      {c: bis}
      O Bam[C]bino mio di[G]vino,
      io ti [D]vedo qui a tre[G]mar;
      o Dio be[C]ato!
      Ah, [G]quanto ti co[D]stò l'avermi a[G]mato!
      {c: bis}

      A te, che sei del mondo il Creatore,
      mancano panni e fuoco, o mio Signore.
      {c: bis}
      Caro eletto pargoletto,
      quanto questa povertà
      più m'innamora,
      giacché ti fece amor povero ancora!
      {c: bis}

      Tu lasci il bel gioir del divin seno,
      per giungere a penar su questo fieno.
      {c: bis}
      Dolce amore del mio core,
      dove amore ti trasportò?
      O Gesù mio,
      per chi tanto patir? Per amor mio!
      {c: bis}
    `),
    moments: ["iniziale", "offertorio", "comunione", "finale"],
    seasons: ["natale"],
  },
  {
    slug: "puer-natus-in-bethlehem",
    title: "Puer natus in Bethlehem",
    copyrightNote: "Pubblico dominio — canto latino medievale (XIV sec.)",
    body: t(`
      Puer natus in Bethlehem, alleluia,
      unde gaudet Ierusalem, alleluia, alleluia.

      {soc}
      In cordis iubilo Christum natum adoremus,
      cum novo cantico.
      {eoc}

      Assumpsit carnem Filius, alleluia,
      Dei Patris altissimus, alleluia, alleluia.

      Per Gabrielem nuntium, alleluia,
      Virgo concepit Filium, alleluia, alleluia.

      Hic iacet in praesepio, alleluia,
      qui regnat sine termino, alleluia, alleluia.

      Reges de Saba veniunt, alleluia,
      aurum, thus, myrrham offerunt, alleluia, alleluia.

      In hoc natali gaudio, alleluia,
      benedicamus Domino, alleluia, alleluia.
    `),
    moments: ["iniziale", "finale"],
    seasons: ["natale"],
  },

  // ─────────────────────────────── QUARESIMA / PERDONO ───────────────────────────────
  {
    slug: "attende-domine",
    title: "Attende, Domine",
    copyrightNote: "Pubblico dominio — inno latino tradizionale (X sec.)",
    body: t(`
      {soc}
      Attende, Domine, et miserere,
      quia peccavimus tibi.
      {eoc}

      Ad te, Rex summe, omnium Redemptor,
      oculos nostros sublevamus flentes:
      exaudi, Christe, supplicantum preces.

      Dextera Patris, lapis angularis,
      via salutis, ianua caelestis,
      ablue nostri maculas delicti.

      Rogamus, Deus, tuam maiestatem:
      auribus sacris gemitus exaudi:
      crimina nostra placidus indulge.

      Tibi fatemur crimina admissa:
      contrito corde pandimus occulta:
      tua, Redemptor, pietas ignoscat.

      Innocens captus, nec repugnans ductus,
      testibus falsis pro impiis damnatus:
      quos redemisti, tu conserva, Christe.
    `),
    moments: ["iniziale", "offertorio"],
    seasons: ["quaresima", "perdono"],
  },
  {
    slug: "parce-domine",
    title: "Parce, Domine",
    copyrightNote: "Pubblico dominio — antifona latina tradizionale (da Gioele 2,17)",
    body: t(`
      {soc}
      Parce, Domine, parce populo tuo:
      ne in aeternum irascaris nobis.
      {eoc}
    `),
    moments: ["iniziale", "offertorio"],
    seasons: ["quaresima", "perdono"],
  },
  {
    slug: "stabat-mater",
    title: "Stabat Mater",
    author: "Attribuito a Iacopone da Todi",
    copyrightNote: "Pubblico dominio — sequenza latina (XIII sec.)",
    body: t(`
      Stabat Mater dolorosa
      iuxta crucem lacrimosa,
      dum pendebat Filius.
      Cuius animam gementem,
      contristatam et dolentem
      pertransivit gladius.

      O quam tristis et afflicta
      fuit illa benedicta
      Mater Unigeniti!
      Quae maerebat et dolebat,
      pia Mater, dum videbat
      nati poenas incliti.

      Quis est homo qui non fleret,
      Matrem Christi si videret
      in tanto supplicio?
      Quis non posset contristari,
      Christi Matrem contemplari
      dolentem cum Filio?

      Pro peccatis suae gentis
      vidit Iesum in tormentis
      et flagellis subditum.
      Vidit suum dulcem natum
      moriendo desolatum,
      dum emisit spiritum.

      Eia, Mater, fons amoris,
      me sentire vim doloris
      fac, ut tecum lugeam.
      Fac, ut ardeat cor meum
      in amando Christum Deum,
      ut sibi complaceam.

      Sancta Mater, istud agas,
      crucifixi fige plagas
      cordi meo valide.
      Tui nati vulnerati,
      tam dignati pro me pati,
      poenas mecum divide.

      Fac me tecum pie flere,
      crucifixo condolere,
      donec ego vixero.
      Iuxta crucem tecum stare,
      et me tibi sociare
      in planctu desidero.

      Virgo virginum praeclara,
      mihi iam non sis amara,
      fac me tecum plangere.
      Fac, ut portem Christi mortem,
      passionis fac consortem,
      et plagas recolere.

      Fac me plagis vulnerari,
      fac me cruce inebriari,
      et cruore Filii.
      Flammis ne urar succensus,
      per te, Virgo, sim defensus
      in die iudicii.

      Christe, cum sit hinc exire,
      da per Matrem me venire
      ad palmam victoriae.
      Quando corpus morietur,
      fac, ut animae donetur
      paradisi gloria. Amen.
    `),
    moments: ["offertorio", "comunione", "finale"],
    seasons: ["quaresima", "maria"],
  },
  {
    slug: "santa-madre-deh-voi-fate",
    title: "Santa Madre, deh voi fate",
    author: "Tradizionale (dalla Via Crucis)",
    copyrightNote: "Pubblico dominio — ritornello popolare tradizionale (dallo Stabat Mater)",
    body: t(`
      {soc}
      Santa Madre, deh voi fate
      che le piaghe del Signore
      siano impresse nel mio cuore.
      {eoc}
    `),
    moments: ["offertorio", "comunione"],
    seasons: ["quaresima", "maria", "perdono"],
  },
  {
    slug: "ave-regina-caelorum",
    title: "Ave Regina caelorum",
    copyrightNote: PD_GREGORIANO,
    body: t(`
      Ave, Regina caelorum,
      ave, Domina Angelorum:
      salve, radix, salve, porta,
      ex qua mundo lux est orta.

      Gaude, Virgo gloriosa,
      super omnes speciosa:
      vale, o valde decora,
      et pro nobis Christum exora.
    `),
    moments: ["finale"],
    seasons: ["quaresima", "maria"],
  },

  // ───────────────────────────────── PASQUA ─────────────────────────────────
  {
    slug: "victimae-paschali-laudes",
    title: "Victimae paschali laudes",
    author: "Attribuito a Wipo di Borgogna",
    copyrightNote: "Pubblico dominio — sequenza pasquale latina (XI sec.)",
    body: t(`
      Victimae paschali laudes
      immolent Christiani.

      Agnus redemit oves:
      Christus innocens Patri
      reconciliavit peccatores.

      Mors et vita duello
      conflixere mirando:
      dux vitae mortuus,
      regnat vivus.

      Dic nobis, Maria,
      quid vidisti in via?

      Sepulcrum Christi viventis,
      et gloriam vidi resurgentis:
      angelicos testes,
      sudarium et vestes.

      Surrexit Christus spes mea:
      praecedet suos in Galilaeam.

      Scimus Christum surrexisse
      a mortuis vere:
      tu nobis, victor Rex, miserere.
      Amen. Alleluia.
    `),
    moments: ["iniziale", "offertorio"],
    seasons: ["pasqua"],
  },
  {
    slug: "o-filii-et-filiae",
    title: "O filii et filiae",
    author: "Attribuito a Jean Tisserand (†1494)",
    copyrightNote: "Pubblico dominio — inno pasquale latino (XV sec.)",
    body: t(`
      {soc}
      Alleluia, alleluia, alleluia.
      {eoc}

      O filii et filiae,
      Rex caelestis, Rex gloriae
      morte surrexit hodie. Alleluia.

      Et mane prima sabbati
      ad ostium monumenti
      accesserunt discipuli. Alleluia.

      Et Maria Magdalene,
      et Iacobi, et Salome
      venerunt corpus ungere. Alleluia.

      In albis sedens angelus
      praedixit mulieribus:
      in Galilaea est Dominus. Alleluia.

      In hoc festo sanctissimo
      sit laus et iubilatio:
      benedicamus Domino. Alleluia.

      De quibus nos humillimas
      devotas atque debitas
      Deo dicamus gratias. Alleluia.
    `),
    moments: ["iniziale", "finale"],
    seasons: ["pasqua"],
  },
  {
    slug: "haec-dies",
    title: "Haec dies",
    copyrightNote: "Pubblico dominio — antifona latina (Salmo 118,24)",
    body: t(`
      Haec dies quam fecit Dominus:
      exsultemus et laetemur in ea.
      Alleluia, alleluia.
    `),
    moments: ["iniziale", "offertorio"],
    seasons: ["pasqua"],
  },
  {
    slug: "regina-caeli",
    title: "Regina caeli",
    copyrightNote: PD_GREGORIANO,
    body: t(`
      Regina caeli, laetare, alleluia.
      Quia quem meruisti portare, alleluia,
      resurrexit, sicut dixit, alleluia.
      Ora pro nobis Deum, alleluia.
    `),
    moments: ["finale"],
    seasons: ["pasqua", "maria"],
  },

  // ───────────────────────────── SPIRITO SANTO ─────────────────────────────
  {
    slug: "veni-creator-spiritus",
    title: "Veni, Creator Spiritus",
    author: "Attribuito a Rabano Mauro",
    copyrightNote: "Pubblico dominio — inno latino (IX sec.)",
    body: t(`
      Veni, Creator Spiritus,
      mentes tuorum visita,
      imple superna gratia,
      quae tu creasti pectora.

      Qui diceris Paraclitus,
      altissimi donum Dei,
      fons vivus, ignis, caritas,
      et spiritalis unctio.

      Tu septiformis munere,
      digitus paternae dexterae,
      tu rite promissum Patris,
      sermone ditans guttura.

      Accende lumen sensibus,
      infunde amorem cordibus,
      infirma nostri corporis
      virtute firmans perpeti.

      Hostem repellas longius
      pacemque dones protinus;
      ductore sic te praevio
      vitemus omne noxium.

      Per te sciamus da Patrem,
      noscamus atque Filium,
      teque utriusque Spiritum
      credamus omni tempore.

      Deo Patri sit gloria,
      et Filio, qui a mortuis
      surrexit, ac Paraclito,
      in saeculorum saecula. Amen.
    `),
    moments: ["iniziale"],
    seasons: ["spirito-santo", "pasqua"],
  },
  {
    slug: "veni-sancte-spiritus",
    title: "Veni, Sancte Spiritus",
    author: "Attribuito a Stefano Langton",
    copyrightNote: "Pubblico dominio — sequenza di Pentecoste (XIII sec.)",
    body: t(`
      Veni, Sancte Spiritus,
      et emitte caelitus
      lucis tuae radium.

      Veni, pater pauperum,
      veni, dator munerum,
      veni, lumen cordium.

      Consolator optime,
      dulcis hospes animae,
      dulce refrigerium.

      In labore requies,
      in aestu temperies,
      in fletu solatium.

      O lux beatissima,
      reple cordis intima
      tuorum fidelium.

      Sine tuo numine,
      nihil est in homine,
      nihil est innoxium.

      Lava quod est sordidum,
      riga quod est aridum,
      sana quod est saucium.

      Flecte quod est rigidum,
      fove quod est frigidum,
      rege quod est devium.

      Da tuis fidelibus,
      in te confidentibus,
      sacrum septenarium.

      Da virtutis meritum,
      da salutis exitum,
      da perenne gaudium.
      Amen. Alleluia.
    `),
    moments: ["iniziale", "offertorio"],
    seasons: ["spirito-santo", "pasqua"],
  },

  // ─────────────────────────────── EUCARISTIA ───────────────────────────────
  {
    slug: "ave-verum-corpus",
    title: "Ave verum corpus",
    copyrightNote: "Pubblico dominio — inno eucaristico latino (XIV sec.)",
    body: t(`
      Ave verum corpus, natum de Maria Virgine,
      vere passum, immolatum in cruce pro homine,
      cuius latus perforatum fluxit aqua et sanguine:
      esto nobis praegustatum in mortis examine.

      O Iesu dulcis, o Iesu pie,
      o Iesu, fili Mariae. Amen.
    `),
    moments: ["comunione"],
    seasons: ["ordinario", "quaresima", "funerali", "matrimoni"],
  },
  {
    slug: "adoro-te-devote",
    title: "Adoro te devote",
    author: "S. Tommaso d'Aquino",
    copyrightNote: "Pubblico dominio — S. Tommaso d'Aquino (XIII sec.)",
    body: t(`
      Adoro te devote, latens Deitas,
      quae sub his figuris vere latitas:
      tibi se cor meum totum subicit,
      quia te contemplans totum deficit.

      Visus, tactus, gustus in te fallitur,
      sed auditu solo tuto creditur;
      credo quidquid dixit Dei Filius:
      nil hoc verbo Veritatis verius.

      In cruce latebat sola Deitas,
      at hic latet simul et humanitas;
      ambo tamen credens atque confitens,
      peto quod petivit latro paenitens.

      Plagas, sicut Thomas, non intueor;
      Deum tamen meum te confiteor;
      fac me tibi semper magis credere,
      in te spem habere, te diligere.

      O memoriale mortis Domini!
      Panis vivus, vitam praestans homini!
      Praesta meae menti de te vivere
      et te illi semper dulce sapere.

      Pie pellicane, Iesu Domine,
      me immundum munda tuo sanguine,
      cuius una stilla salvum facere
      totum mundum quit ab omni scelere.

      Iesu, quem velatum nunc aspicio,
      oro fiat illud quod tam sitio:
      ut te revelata cernens facie,
      visu sim beatus tuae gloriae. Amen.
    `),
    moments: ["comunione"],
    seasons: ["ordinario", "quaresima"],
  },
  {
    slug: "pange-lingua",
    title: "Pange lingua",
    author: "S. Tommaso d'Aquino",
    copyrightNote: "Pubblico dominio — S. Tommaso d'Aquino (XIII sec.)",
    body: t(`
      Pange, lingua, gloriosi
      Corporis mysterium,
      Sanguinisque pretiosi,
      quem in mundi pretium
      fructus ventris generosi
      Rex effudit gentium.

      Nobis datus, nobis natus
      ex intacta Virgine,
      et in mundo conversatus,
      sparso verbi semine,
      sui moras incolatus
      miro clausit ordine.

      In supremae nocte cenae
      recumbens cum fratribus,
      observata lege plene
      cibis in legalibus,
      cibum turbae duodenae
      se dat suis manibus.

      Verbum caro, panem verum
      verbo carnem efficit:
      fitque sanguis Christi merum,
      et si sensus deficit,
      ad firmandum cor sincerum
      sola fides sufficit.

      Tantum ergo Sacramentum
      veneremur cernui:
      et antiquum documentum
      novo cedat ritui:
      praestet fides supplementum
      sensuum defectui.

      Genitori, Genitoque
      laus et iubilatio,
      salus, honor, virtus quoque
      sit et benedictio:
      procedenti ab utroque
      compar sit laudatio. Amen.
    `),
    moments: ["comunione"],
    seasons: ["ordinario", "quaresima"],
  },
  {
    slug: "tantum-ergo",
    title: "Tantum ergo",
    author: "S. Tommaso d'Aquino",
    copyrightNote: "Pubblico dominio — S. Tommaso d'Aquino (XIII sec.)",
    body: t(`
      Tantum ergo Sacramentum
      veneremur cernui:
      et antiquum documentum
      novo cedat ritui:
      praestet fides supplementum
      sensuum defectui.

      Genitori, Genitoque
      laus et iubilatio,
      salus, honor, virtus quoque
      sit et benedictio:
      procedenti ab utroque
      compar sit laudatio. Amen.
    `),
    moments: ["comunione"],
    seasons: ["ordinario"],
  },
  {
    slug: "o-salutaris-hostia",
    title: "O salutaris Hostia",
    author: "S. Tommaso d'Aquino",
    copyrightNote: "Pubblico dominio — S. Tommaso d'Aquino (XIII sec.)",
    body: t(`
      O salutaris Hostia,
      quae caeli pandis ostium:
      bella premunt hostilia,
      da robur, fer auxilium.

      Uni trinoque Domino
      sit sempiterna gloria,
      qui vitam sine termino
      nobis donet in patria. Amen.
    `),
    moments: ["comunione"],
    seasons: ["ordinario"],
  },
  {
    slug: "panis-angelicus",
    title: "Panis angelicus",
    author: "S. Tommaso d'Aquino",
    copyrightNote: "Pubblico dominio — S. Tommaso d'Aquino (XIII sec.)",
    body: t(`
      Panis angelicus
      fit panis hominum;
      dat panis caelicus
      figuris terminum:
      o res mirabilis!
      Manducat Dominum
      pauper, servus et humilis.

      Te trina Deitas
      unaque poscimus:
      sic nos tu visita,
      sicut te colimus;
      per tuas semitas
      duc nos quo tendimus,
      ad lucem quam inhabitas. Amen.
    `),
    moments: ["comunione"],
    seasons: ["ordinario", "matrimoni"],
  },

  // ───────────────────────────── LODE / ORDINARIO ─────────────────────────────
  {
    slug: "laudate-dominum-omnes-gentes",
    title: "Laudate Dominum, omnes gentes",
    copyrightNote: "Pubblico dominio — Salmo 117 (Vulgata)",
    body: t(`
      Laudate Dominum, omnes gentes;
      laudate eum, omnes populi.

      Quoniam confirmata est super nos misericordia eius,
      et veritas Domini manet in aeternum.
    `),
    moments: ["iniziale", "offertorio", "finale"],
    seasons: ["ordinario", "pasqua", "matrimoni"],
  },
  {
    slug: "christus-vincit",
    title: "Christus vincit",
    copyrightNote: "Pubblico dominio — acclamazioni latine tradizionali (Laudes regiae)",
    body: t(`
      {soc}
      Christus vincit, Christus regnat,
      Christus imperat.
      {eoc}

      Rex regum, Rex noster,
      spes nostra, gloria nostra.

      Ipsi soli imperium, gloria et potestas
      per immortalia saecula saeculorum. Amen.

      Ipsi soli honor, laus et iubilatio
      per infinita saecula saeculorum. Amen.
    `),
    moments: ["iniziale", "finale"],
    seasons: ["ordinario", "pasqua"],
  },
  {
    slug: "te-deum",
    title: "Te Deum",
    copyrightNote: "Pubblico dominio — inno latino (IV sec.)",
    body: t(`
      Te Deum laudamus: te Dominum confitemur.
      Te aeternum Patrem omnis terra veneratur.
      Tibi omnes Angeli, tibi caeli et universae Potestates,
      tibi Cherubim et Seraphim incessabili voce proclamant:

      Sanctus, Sanctus, Sanctus
      Dominus Deus Sabaoth.
      Pleni sunt caeli et terra
      maiestatis gloriae tuae.

      Te gloriosus Apostolorum chorus,
      te Prophetarum laudabilis numerus,
      te Martyrum candidatus laudat exercitus.
      Te per orbem terrarum sancta confitetur Ecclesia:
      Patrem immensae maiestatis;
      venerandum tuum verum et unicum Filium;
      Sanctum quoque Paraclitum Spiritum.

      Tu Rex gloriae, Christe.
      Tu Patris sempiternus es Filius.
      Tu, ad liberandum suscepturus hominem,
      non horruisti Virginis uterum.
      Tu, devicto mortis aculeo,
      aperuisti credentibus regna caelorum.
      Tu ad dexteram Dei sedes, in gloria Patris.
      Iudex crederis esse venturus.

      Te ergo quaesumus, tuis famulis subveni,
      quos pretioso sanguine redemisti.
      Aeterna fac cum sanctis tuis in gloria numerari.
    `),
    moments: ["finale"],
    seasons: ["ordinario", "natale", "pasqua", "matrimoni"],
  },

  // ───────────────────────────────── MARIA ─────────────────────────────────
  {
    slug: "magnificat",
    title: "Magnificat",
    copyrightNote: "Pubblico dominio — Cantico di Maria (Lc 1,46-55, Vulgata)",
    body: t(`
      Magnificat anima mea Dominum,
      et exsultavit spiritus meus in Deo salutari meo,
      quia respexit humilitatem ancillae suae.

      Ecce enim ex hoc beatam me dicent omnes generationes,
      quia fecit mihi magna, qui potens est,
      et sanctum nomen eius,
      et misericordia eius in progenies et progenies
      timentibus eum.

      Fecit potentiam in brachio suo,
      dispersit superbos mente cordis sui;
      deposuit potentes de sede
      et exaltavit humiles;
      esurientes implevit bonis
      et divites dimisit inanes.

      Suscepit Israel puerum suum,
      recordatus misericordiae suae,
      sicut locutus est ad patres nostros,
      Abraham et semini eius in saecula.

      Gloria Patri, et Filio, et Spiritui Sancto.
      Sicut erat in principio, et nunc et semper,
      et in saecula saeculorum. Amen.
    `),
    moments: ["offertorio", "finale"],
    seasons: ["maria", "avvento", "natale", "matrimoni"],
  },
  {
    slug: "ave-maria",
    title: "Ave Maria",
    copyrightNote: PD_GREGORIANO,
    body: t(`
      Ave Maria, gratia plena,
      Dominus tecum,
      benedicta tu in mulieribus,
      et benedictus fructus ventris tui, Iesus.

      Sancta Maria, Mater Dei,
      ora pro nobis peccatoribus,
      nunc et in hora mortis nostrae.
      Amen.
    `),
    moments: ["offertorio", "comunione", "finale"],
    seasons: ["maria", "avvento", "matrimoni", "funerali"],
  },
  {
    slug: "salve-regina",
    title: "Salve Regina",
    copyrightNote: PD_GREGORIANO,
    body: t(`
      Salve, Regina, Mater misericordiae;
      vita, dulcedo et spes nostra, salve.
      Ad te clamamus, exsules filii Hevae.
      Ad te suspiramus, gementes et flentes
      in hac lacrimarum valle.

      Eia ergo, advocata nostra,
      illos tuos misericordes oculos ad nos converte.
      Et Iesum, benedictum fructum ventris tui,
      nobis post hoc exsilium ostende.

      O clemens, o pia, o dulcis Virgo Maria.
    `),
    moments: ["finale"],
    seasons: ["maria", "ordinario", "funerali"],
  },
  {
    slug: "ave-maris-stella",
    title: "Ave maris stella",
    copyrightNote: "Pubblico dominio — inno mariano latino (IX sec.)",
    body: t(`
      Ave, maris stella,
      Dei Mater alma,
      atque semper Virgo,
      felix caeli porta.

      Sumens illud Ave
      Gabrielis ore,
      funda nos in pace,
      mutans Evae nomen.

      Solve vincla reis,
      profer lumen caecis,
      mala nostra pelle,
      bona cuncta posce.

      Monstra te esse matrem,
      sumat per te preces
      qui pro nobis natus
      tulit esse tuus.

      Virgo singularis,
      inter omnes mitis,
      nos culpis solutos
      mites fac et castos.

      Vitam praesta puram,
      iter para tutum,
      ut videntes Iesum
      semper collaetemur.

      Sit laus Deo Patri,
      summo Christo decus,
      Spiritui Sancto,
      tribus honor unus. Amen.
    `),
    moments: ["iniziale", "finale"],
    seasons: ["maria"],
  },
  {
    slug: "sub-tuum-praesidium",
    title: "Sub tuum praesidium",
    copyrightNote: "Pubblico dominio — antifona mariana latina (III sec.)",
    body: t(`
      Sub tuum praesidium confugimus,
      sancta Dei Genetrix;
      nostras deprecationes ne despicias
      in necessitatibus,
      sed a periculis cunctis
      libera nos semper,
      Virgo gloriosa et benedicta.
    `),
    moments: ["finale"],
    seasons: ["maria", "ordinario"],
  },
  {
    slug: "mira-il-tuo-popolo",
    title: "Mira il tuo popolo",
    author: "Tradizionale",
    copyrightNote: "Pubblico dominio — canto mariano popolare tradizionale (XIX sec.)",
    musicalKey: "D",
    body: t(`
      [D]Mira il tuo [A]popolo, o bella Si[D]gnora,
      che pien di [A]giubilo oggi ti o[D]nora.
      [G]Anch'io fe[D]stevole [A]corro ai tuoi [D]piè:
      o Santa [A]Vergine, [A7]prega per [D]me.

      Il pietosissimo tuo dolce cuore
      egli è rifugio al peccatore.
      Tesori e grazie racchiude in sé:
      o Santa Vergine, prega per me.

      In questa misera valle infelice
      tutti t'invocano soccorritrice.
      Questo bel titolo conviene a te:
      o Santa Vergine, prega per me.

      Del vasto oceano propizia stella,
      ti vedo splendere sempre più bella.
      Al porto guidami per tua mercé:
      o Santa Vergine, prega per me.
    `),
    moments: ["iniziale", "finale"],
    seasons: ["maria"],
  },
  {
    slug: "dell-aurora-tu-sorgi-piu-bella",
    title: "Dell'aurora tu sorgi più bella",
    author: "Tradizionale",
    copyrightNote: "Pubblico dominio — canto mariano popolare tradizionale (XIX sec.)",
    body: t(`
      Dell'aurora tu sorgi più bella,
      coi tuoi raggi a far lieta la terra,
      e fra gli astri che il cielo rinserra
      non v'è stella più bella di te.

      {soc}
      Bella tu sei qual sole,
      bianca più della luna,
      e le stelle più belle
      non son belle al par di te.
      {eoc}

      {c: Altre strofe tradizionali possono essere aggiunte dall'amministratore}
    `),
    moments: ["iniziale", "finale"],
    seasons: ["maria"],
  },
  {
    slug: "noi-vogliam-dio",
    title: "Noi vogliam Dio",
    author: "Tradizionale (dal francese «Nous voulons Dieu», XIX sec.)",
    copyrightNote: "Pubblico dominio — canto popolare tradizionale (XIX sec.)",
    body: t(`
      Noi vogliam Dio, Vergin Maria,
      benigna ascolta il nostro dir;
      noi t'invochiamo, o Madre pia,
      dei figli tuoi compi il desir.

      {soc}
      Deh, benedici, o Madre,
      al grido della fé:
      noi vogliam Dio, ch'è nostro Padre,
      noi vogliam Dio, ch'è nostro Re.
      {eoc}

      Noi vogliam Dio nelle famiglie,
      dei nostri cari in mezzo al cuor;
      sian puri i figli, caste le figlie,
      tutti c'infiammi di Dio l'amor.
    `),
    moments: ["finale"],
    seasons: ["maria", "ordinario"],
  },

  // ─────────────────────────────── FUNERALI ───────────────────────────────
  {
    slug: "requiem-aeternam",
    title: "Requiem aeternam",
    copyrightNote: "Pubblico dominio — introito della Messa dei defunti",
    body: t(`
      {soc}
      Requiem aeternam dona eis, Domine,
      et lux perpetua luceat eis.
      {eoc}

      Te decet hymnus, Deus, in Sion,
      et tibi reddetur votum in Ierusalem:
      exaudi orationem meam,
      ad te omnis caro veniet.
    `),
    moments: ["iniziale"],
    seasons: ["funerali"],
  },
  {
    slug: "lux-aeterna",
    title: "Lux aeterna",
    copyrightNote: "Pubblico dominio — antifona di comunione della Messa dei defunti",
    body: t(`
      Lux aeterna luceat eis, Domine,
      cum sanctis tuis in aeternum,
      quia pius es.

      Requiem aeternam dona eis, Domine,
      et lux perpetua luceat eis,
      cum sanctis tuis in aeternum,
      quia pius es.
    `),
    moments: ["comunione"],
    seasons: ["funerali"],
  },
  {
    slug: "in-paradisum",
    title: "In paradisum",
    copyrightNote: "Pubblico dominio — antifona latina delle esequie",
    body: t(`
      In paradisum deducant te Angeli;
      in tuo adventu suscipiant te Martyres,
      et perducant te in civitatem sanctam Ierusalem.

      Chorus Angelorum te suscipiat,
      et cum Lazaro quondam paupere
      aeternam habeas requiem.
    `),
    moments: ["finale"],
    seasons: ["funerali"],
  },
];
