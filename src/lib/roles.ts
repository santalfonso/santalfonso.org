/**
 * Ruoli del sito, senza dipendenze dal server: li usano anche i moduli del pannello.
 * Ogni ruolo può tutto ciò che possono i ruoli sotto di lui:
 * - editor: crea articoli ed eventi, modifica solo i propri, non elimina;
 * - admin: avvisi, tutti gli articoli e gli eventi (anche eliminarli);
 * - superadmin: in più risorse, canti e utenti;
 * - owner: in più le impostazioni (configurazioni, aggiornamenti).
 */
export type Role = "owner" | "superadmin" | "admin" | "editor" | "utente";

/** Nomi dei ruoli mostrati nel sito e nell'amministrazione. */
export const ROLE_LABEL: Record<Role, string> = {
  owner: "Owner",
  superadmin: "Super Admin",
  admin: "Admin",
  editor: "Editor",
  utente: "User",
};

/** Cosa può fare ogni ruolo, per il modulo di creazione utenti. */
export const ROLE_DESCRIPTION: Record<Role, string> = {
  owner: "tutto, comprese le impostazioni",
  superadmin: "tutto tranne le impostazioni: anche risorse, canti e utenti",
  admin: "avvisi, articoli ed eventi (anche modificarli ed eliminarli)",
  editor: "crea articoli ed eventi e modifica solo i propri, senza eliminarli",
  utente: "usa le funzioni riservate del sito, senza accesso all'amministrazione",
};

const ROLE_RANK: Record<Role, number> = { utente: 0, editor: 1, admin: 2, superadmin: 3, owner: 4 };

export function roleAtLeast(role: Role | undefined, min: Role): boolean {
  return role !== undefined && (ROLE_RANK[role] ?? -1) >= ROLE_RANK[min];
}

/** Ruoli che `actor` può assegnare ed eliminare: solo quelli sotto il suo (l'owner tutti tranne owner). */
export function manageableRoles(actor: Role | undefined): Role[] {
  if (actor === "owner") return ["superadmin", "admin", "editor", "utente"];
  if (actor === "superadmin") return ["admin", "editor", "utente"];
  return [];
}

export function canManageRole(actor: Role | undefined, target: Role): boolean {
  return manageableRoles(actor).includes(target);
}
