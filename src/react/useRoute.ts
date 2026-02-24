import { useContext, useMemo } from "react";
import { NavigationOptions } from "../types/NavigationOptions.ts";
import { RenderCallback } from "../types/RenderCallback.ts";
import { URLContext } from "./URLContext.ts";
import { usePortableState } from "./usePortableState.ts";
import { Route } from "../Route.ts";

export function useRoute(callback?: RenderCallback<NavigationOptions>) {
  let urlState = useContext(URLContext);

  usePortableState(urlState, callback);

  return useMemo(() => new Route(urlState), [urlState]);
}
