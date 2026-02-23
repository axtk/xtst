import { useEffect, useMemo, useRef, useState } from "react";
import { PortableState } from "../PortableState.ts";
import { isPortableState } from "../isPortableState.ts";
import { StateEventPayload } from "../types/StateEventPayload.ts";
import { RenderCallback } from "../types/RenderCallback.ts";
import { defaultRenderCallback } from "../const/defaultRenderCallback.ts";

export type SetStoreValue<T> = PortableState<T>["setValue"];
export type ShouldUpdateCallback<T> = (nextValue: T, prevValue: T) => boolean;
export type ShouldUpdate<T> = boolean | ShouldUpdateCallback<T>;

export function usePortableState<T, P extends StateEventPayload>(
  state: PortableState<T, P>,
  callback: RenderCallback<P> = defaultRenderCallback,
): [T, SetStoreValue<T>] {
  if (!isPortableState<T>(state))
    throw new Error("'state' is not an instance of PortableState");

  let [, setRevision] = useState(-1);

  let setValue = useMemo(() => state.setValue.bind(state), [state]);
  let initialStoreRevision = useRef(state.revision);

  useEffect(() => {
    // Allow state instances to hook into the effect
    state.emit("effect");

    let render = () => {
      setRevision(Math.random());
    };

    let unsubscribe = state.on("update", (payload) => {
      callback(render, payload);
    });

    if (state.revision !== initialStoreRevision.current)
      setRevision(Math.random());

    return () => {
      unsubscribe();
      initialStoreRevision.current = state.revision;
    };
  }, [state, callback]);

  return [state.current, setValue];
}
