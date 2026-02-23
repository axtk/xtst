import { StateEventPayload } from "./StateEventPayload.ts";

export type RenderCallback<P extends StateEventPayload> = (render: () => void, payload?: P) => void;
