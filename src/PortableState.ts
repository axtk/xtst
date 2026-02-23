import { StateEventPayload } from "./types/StateEventPayload.ts";

export type StateEventCallback<T extends StateEventPayload> = (event: T | undefined) => boolean | undefined | void;
export type StateUpdate<T> = (value: T) => T;

/**
 * Data container allowing for subscription to its updates.
 */
export class PortableState<Value, Payload extends StateEventPayload = StateEventPayload> {
  _current: Value;
  _previous: Value;
  _callbacks: Record<string, Set<StateEventCallback<Payload>>> = {};
  _revision = -1;
  _active = true;

  constructor(value: Value) {
    this._current = value;
    this._previous = value;
  }
  /**
   * Adds an event handler to the state.
   *
   * Handlers of the `"update"` event are called whenever the state value
   * is updated via `setValue(value)`.
   *
   * Returns an unsubscription function. Once it's invoked, the given
   * `callback` is removed from the state and no longer called when
   * the state emits the corresponding event.
   */
  on(event: string, callback: StateEventCallback<Payload>) {
    (this._callbacks[event] ??= new Set<StateEventCallback<Payload>>()).add(callback);

    return () => this.off(event, callback);
  }
  /**
   * Adds a one-time event handler to the state: once the event is emitted,
   * the callback is called and removed from the state.
   */
  once(event: string, callback: StateEventCallback<Payload>) {
    let oneTimeCallback: StateEventCallback<Payload> = (payload) => {
      this.off(event, oneTimeCallback);
      callback(payload);
    };

    return this.on(event, oneTimeCallback);
  }
  /**
   * Removes `callback` from the state's handlers of the given event,
   * and removes all handlers of the given event if `callback` is not
   * specified.
   */
  off(event: string, callback?: StateEventCallback<Payload>) {
    if (callback === undefined) delete this._callbacks[event];
    else this._callbacks[event]?.delete(callback);
  }
  /**
   * Emits the specified event. Returns `false` if at least one event callback
   * resolves as `false`, effectively interrupting the callback call chain.
   * Otherwise returns `true`.
   */
  emit(event: string, payload?: Payload) {
    let callbacks = this._callbacks[event];

    if (this._active && callbacks?.size) {
      for (let callback of callbacks) {
        if (callback(payload) === false) return false;
      }
    }

    return true;
  }
  _resolveValue(update: Value | StateUpdate<Value>) {
    return update instanceof Function ? update(this._current) : update;
  }
  _assignValue(value: Value) {
    this._previous = this._current;
    this._current = value;
    this._revision = Math.random();
  }
  /**
   * Updates the state value.
   *
   * @param update - A new value or an update function `(value) => nextValue`
   * that returns a new state value based on the current state value.
   */
  setValue(update: Value | StateUpdate<Value>, payload?: Payload): void {
    if (this._active && this.emit("updatestart", payload)) {
      this._assignValue(this._resolveValue(update));
      this.emit("update", payload);
    }
  }
  get current(): Value {
    return this._current;
  }
  get previous(): Value {
    return this._previous;
  }
  get revision() {
    return this._revision;
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
