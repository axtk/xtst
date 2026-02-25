import { EventCallback } from "./EventCallback.ts";

export type EventCallbackMap<Map extends Record<string, unknown>> = Partial<{
  [K in keyof Map]: Set<EventCallback<Map[K]>>;
}>;
