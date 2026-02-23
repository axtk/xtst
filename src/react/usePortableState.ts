import { useEffect, useMemo, useRef, useState } from "react";
import { PortableState } from "../PortableState.ts";
import { isPortableState } from "../isPortableState.ts";
import { EventPayload } from "../types/EventPayload.ts";
import { RenderCallback } from "../types/RenderCallback.ts";

export type SetPortableStateValue<T, P extends EventPayload> = PortableState<T, P>["setValue"];

const defaultRenderCallback = (render: () => void) => render();

export function usePortableState<T, P extends EventPayload = EventPayload>(
  state: PortableState<T, P>,
  callback: RenderCallback<P> = defaultRenderCallback,
): [T, SetPortableStateValue<T, P>] {
  if (!isPortableState<T>(state))
    throw new Error("'state' is not an instance of PortableState");

  let [, setRevision] = useState(-1);

  let setValue = useMemo(() => state.setValue.bind(state), [state]);
  let initialStateRevision = useRef(state.revision);
  let shouldUpdate = useRef(false);

  useEffect(() => {
    // Allow state instances to hook into the effect
    state.emit("effect");

    shouldUpdate.current = true;

    let render = () => {
      // Use `setRevision()` as long as the component is mounted
      if (shouldUpdate.current) setRevision(Math.random());
    };

    let unsubscribe = state.on("update", (payload) => {
      callback(render, payload);
    });

    if (state.revision !== initialStateRevision.current)
      setRevision(Math.random());

    return () => {
      unsubscribe();
      initialStateRevision.current = state.revision;
      shouldUpdate.current = false;
    };
  }, [state, callback]);

  return [state.current, setValue];
}
