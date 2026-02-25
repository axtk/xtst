import { PersistentState } from "../../../src/PersistentState.ts";

export const counterState = new PersistentState(42, { key: "sidestate-dev" });

counterState.emit("sync");
