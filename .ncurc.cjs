/**
 * Aggiornamenti "compatibili", applicati dal pulsante in Impostazioni → Aggiornamenti
 * (automazione .github/workflows/aggiorna-dipendenze.yml):
 * - nuove funzioni e correzioni (minor e patch), mai una nuova versione principale;
 * - per i pacchetti 0.x solo le correzioni: lì anche un cambio di minor può richiedere modifiche al codice;
 * - solo versioni pubblicate da almeno 3 giorni (protezione da pacchetti compromessi appena usciti).
 */
module.exports = {
  upgrade: true,
  cooldown: 3,
  target: (name, semver) => (String(semver[0]?.major) === "0" ? "patch" : "minor"),
};
