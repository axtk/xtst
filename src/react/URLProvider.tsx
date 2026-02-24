import { type ReactNode, useEffect, useMemo } from "react";
import { URLState } from "../URLState.ts";
import { URLContext } from "./URLContext.ts";

export type URLProviderProps = {
  href?: string | URLState | undefined;
  children?: ReactNode;
};

/**
 * A component providing a URL value to the nested components.
 */
export const URLProvider = ({ href, children }: URLProviderProps) => {
  let urlState = useMemo(() => {
    if (href instanceof URLState) return href;
    else if (href === undefined || typeof href === "string")
      return new URLState(href);
    else throw new Error("URLProvider's 'href' of unsupported type");
  }, [href]);

  useEffect(() => {
    urlState.start();

    return () => urlState.stop();
  }, [urlState]);

  return <URLContext.Provider value={urlState}>{children}</URLContext.Provider>;
};
