import { type ReactNode, useEffect, useMemo } from "react";
import { URLContext } from "./URLContext.ts";
import { URLState } from "../URLState.ts";

export type RouterProps = {
  href?: string | URLState | undefined;
  children?: ReactNode;
};

/**
 * A component providing a URL value to the nested components.
 */
export const Router = ({ href, children }: RouterProps) => {
  let urlState = useMemo(() => {
    if (href instanceof URLState) return href;
    else if (href === undefined || typeof href === "string")
      return new URLState(href);
    else throw new Error("Router's 'href' of unsupported type");
  }, [href]);

  useEffect(() => {
    urlState.start();

    return () => urlState.stop();
  }, [urlState]);

  return (
    <URLContext.Provider value={urlState}>{children}</URLContext.Provider>
  );
};
