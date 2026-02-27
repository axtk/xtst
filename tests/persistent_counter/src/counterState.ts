import { PersistentState } from "../../../src/PersistentState.ts";

export const counterState = new PersistentState(42, { key: "sidestate-dev-counter" });

counterState.emit("sync");
