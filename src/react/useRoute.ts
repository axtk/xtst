import { useContext, useMemo } from "react";
import { Route } from "../Route.ts";
import type { NavigationOptions } from "../types/NavigationOptions.ts";
import type { RenderCallback } from "../types/RenderCallback.ts";
import { URLContext } from "./URLContext.ts";
import { usePortableState } from "./usePortableState.ts";

export function useRoute(callback?: RenderCallback<NavigationOptions>) {
  let urlState = useContext(URLContext);

  usePortableState(urlState, callback);

  return useMemo(() => new Route(urlState), [urlState]);
}
