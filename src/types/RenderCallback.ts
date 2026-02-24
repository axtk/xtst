import type { EventPayload } from "./EventPayload.ts";

export type RenderCallback<P extends EventPayload> = (
  render: () => void,
  payload?: P,
) => boolean | undefined | void;
