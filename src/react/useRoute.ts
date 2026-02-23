import { useContext } from "react";
import { usePortableState } from "./usePortableState.ts";
import { RouteContext } from "./RouteContext.ts";
import { RenderCallback } from "../types/RenderCallback.ts";
import { NavigationOptions } from "../types/NavigationOptions.ts";

export function useRoute(callback?: RenderCallback<NavigationOptions>) {
  return usePortableState(useContext(RouteContext), callback);
}
