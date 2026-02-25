import { type EventPayloadMap, State } from "./State.ts";
import type { PersistentStorage } from "./types/PersistentStorage.ts";

function getStorage(session = false) {
  if (typeof window !== "undefined")
    return session ? window.sessionStorage : window.localStorage;
}

export type StorageEntryOptions<T> = {
  key: string;
  session?: boolean;
  serialize?: (value: T) => string;
  deserialize?: (serializedValue: string) => T;
};

export function getStorageEntry<T>({
  key,
  session,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
}: StorageEntryOptions<T>): PersistentStorage<T> {
  let storage = getStorage(session);

  if (!storage) return { read: () => null, write: () => {} };

  return {
    read() {
      try {
        let serializedValue = storage.getItem(key);
        if (serializedValue !== null) return deserialize(serializedValue);
      } catch {}
      return null;
    },
    write(value: T) {
      try {
        storage.setItem(key, serialize(value));
      } catch {}
    },
  };
}

/**
 * A container for data persistent across page reloads.
 */
export class PersistentState<
  T,
  P extends EventPayloadMap<T> = EventPayloadMap<T>,
> extends State<T, P> {
  _synced = false;
  /**
   * @param value - Initial state value.
   * @param options - Either of the following:
   * - A set of browser storage settings: `key` points to the target browser
   * storage key where the state value should be saved; `session` set to `true`
   * signals to use `sessionStorage` instead of `localStorage`, with the latter
   * being the default; the optional `serialize` and `deserialize` define the
   * way the state value is saved to and restored from the browser storage
   * entry (default: `JSON.stringify` and `JSON.parse` respectively).
   * - A storage singleton with a `read` and an optional `write` method
   * (synchronous or asynchronous).
   */
  constructor(
    value: T,
    options: StorageEntryOptions<T> | PersistentStorage<T>,
  ) {
    super(value);

    let { read, write } =
      "read" in options ? options : getStorageEntry(options);

    let update = (value: T | null) => {
      if (value === null) write?.(this.getValue());
      else this.setValue(value);
    };

    let sync = () => {
      if (!this._synced) this._synced = true;

      let value = read();

      if (value instanceof Promise) value.then(update);
      else update(value);
    };

    let syncOnce = () => {
      if (!this._synced) sync();
    };

    if (write) {
      this.on("update", ({ current }) => {
        write(current);
      });
    }

    this.on("sync", sync);
    this.once("synconce", syncOnce);
    this.once("effect", syncOnce);
  }
}
