import {
  getStorageEntry,
  type StorageEntryOptions,
} from "./getStorageEntry.ts";
import { PortableState } from "./PortableState.ts";
import type { EventPayload } from "./types/EventPayload.ts";
import type { PersistentStorage } from "./types/PersistentStorage.ts";

/**
 * A container for data persistent across page reloads.
 */
export class PersistentState<
  T,
  P extends EventPayload = EventPayload,
> extends PortableState<T, P> {
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
      if (value === null) write?.(this.current);
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
      this.on("update", () => {
        write(this.current);
      });
    }

    this.on("sync", sync);
    this.once("synconce", syncOnce);
    this.once("effect", syncOnce);
  }
}
