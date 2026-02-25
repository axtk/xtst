import type { EventCallback } from "./types/EventCallback.ts";
import type { EventCallbackMap } from "./types/EventCallbackMap.ts";

export class EventEmitter<
  P extends Record<string, unknown> = Record<string, void>,
> {
  _callbacks: EventCallbackMap<P> = {};
  _active = true;
  /**
   * Adds an event handler.
   *
   * Returns an unsubscription function. Once it's invoked, the given
   * `callback` is removed and no longer called in response to the event.
   */
  on<E extends string>(event: E, callback: EventCallback<P[E]>) {
    (this._callbacks[event] ??= new Set()).add(callback);

    return () => this.off(event, callback);
  }
  /**
   * Adds a one-time event handler: once the event is emitted, the callback
   * is called and immediately removed.
   */
  once<E extends string>(event: E, callback: EventCallback<P[E]>) {
    let oneTimeCallback = (payload: P[E]) => {
      this.off(event, oneTimeCallback);
      callback(payload);
    };

    return this.on(event, oneTimeCallback);
  }
  /**
   * Removes the specified `callback` from the handlers of the given event,
   * and removes all handlers of the given event if `callback` is not
   * specified.
   */
  off<E extends string>(event: E, callback?: EventCallback<P[E]>) {
    if (callback === undefined) delete this._callbacks[event];
    else this._callbacks[event]?.delete(callback);
  }
  /**
   * Emits the specified event. Returns `false` if at least one event callback
   * returns `false`, effectively interrupting the callback call chain.
   * Otherwise returns `true`.
   */
  emit<E extends string>(event: E, payload?: P[E]) {
    let callbacks = this._callbacks[event];

    if (this._active && callbacks?.size) {
      for (let callback of callbacks) {
        if (callback(payload!) === false) return false;
      }
    }

    return true;
  }
  get active() {
    return this._active;
  }
  start() {
    if (!this._active) {
      this._active = true;
      this.emit("start");
    }
  }
  stop() {
    if (this._active) {
      this._active = false;
      this.emit("stop");
    }
  }
}
