import type { URLConfig } from "./URLConfig.ts";
import type { LocationObject } from "./LocationObject.ts";

export type LocationValue = URLConfig["strict"] extends true
  ? LocationObject | undefined
  : string | LocationObject | undefined;
