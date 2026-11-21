import { useSyncExternalStore } from "react";

const noSubscribe = () => () => {};

/**
 * Funzioni del browser (service worker, IndexedDB, iPhone...): false durante il rendering sul
 * server e nella prima idratazione, poi il valore vero, senza setState dentro un effect.
 */
export function useBrowserCheck(check: () => boolean): boolean {
  return useSyncExternalStore(noSubscribe, check, () => false);
}
