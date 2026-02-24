import type { EventPayload } from "./EventPayload.ts";

export type EventCallback<T extends EventPayload> = (
  event: T | undefined,
) => boolean | undefined | void;
