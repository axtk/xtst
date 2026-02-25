import type { URLConfig } from "./URLConfig.ts";
import type { LocationValue } from "./LocationValue.ts";

export type LocationPattern = URLConfig["strict"] extends true
  ? LocationValue | LocationValue[]
  : LocationValue | RegExp | (LocationValue | RegExp)[];
