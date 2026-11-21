/** Sottomenù di Impostazioni nel backend (solo owner). */
export const SETTINGS_ITEMS = [
  { href: "/admin/impostazioni/configurazioni", label: "Configurazioni" },
  { href: "/admin/impostazioni/aggiornamenti", label: "Aggiornamenti" },
  { href: "/admin/impostazioni/consumi", label: "Consumi" },
] as const;
