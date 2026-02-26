import { QuasiURL } from "quasiurl";
import type { LocationValue } from "../types/LocationValue.ts";
import type { URLData } from "../types/URLData.ts";
import { isLocationObject } from "./isLocationObject.ts";

export function compileURL<T extends LocationValue>(
  urlPattern: T,
  data?: URLData<T>,
) {
  if (isLocationObject(urlPattern)) return urlPattern.compile(data);

  let url = new QuasiURL(urlPattern ?? "");
  let query = data?.query;

  if (query) {
    url.search = new URLSearchParams(
      // Remove null und undefined values, stringify nonstring values
      Object.entries(query).reduce<Record<string, string>>((p, [k, v]) => {
        if (v !== null && v !== undefined)
          p[k] = typeof v === "string" ? v : JSON.stringify(v);
        return p;
      }, {}),
    );
  }

  return url.href;
}
