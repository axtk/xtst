import type { Store } from "./Store.ts";

/**
 * Serves as a replacement to `instanceof Store` which can lead to a false
 * negative when the `Store` class comes from different package dependencies.
 */
export function isStore<T>(x: unknown): x is Store<T> {
  return (
    x !== null &&
    typeof x === "object" &&
    "on" in x &&
    typeof x.on === "function" &&
    "getValue" in x &&
    typeof x.getValue === "function" &&
    "setValue" in x &&
    typeof x.setValue === "function"
  );
}
