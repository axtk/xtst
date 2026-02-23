import { useContext } from "react";
import { usePortableState } from "./usePortableState.ts";
import { URLContext } from "./URLContext.ts";
import { RenderCallback } from "../types/RenderCallback.ts";
import { NavigationOptions } from "../types/NavigationOptions.ts";

export function useURLState(callback?: RenderCallback<NavigationOptions>) {
  return usePortableState(useContext(URLContext), callback);
}
