import { useContext } from "react";
import { usePortableState } from "./usePortableState.ts";
import { RouteContext } from "./RouteContext.ts";

export function useRoute() {
  return usePortableState(useContext(RouteContext));
}
