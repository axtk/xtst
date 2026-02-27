import type { State, StatePayloadMap } from "./State.ts";

/**
 * Serves as a replacement to `instanceof ExternalState` which can lead to
 * a false negative when `ExternalState` comes from transitive dependencies.
 */
export function isState<T, P extends StatePayloadMap<T> = StatePayloadMap<T>>(
  x: unknown,
): x is State<T, P> {
  return (
    x !== null &&
    typeof x === "object" &&
    "on" in x &&
    typeof x.on === "function" &&
    "emit" in x &&
    typeof x.emit === "function" &&
    "setValue" in x &&
    typeof x.setValue === "function"
  );
}
