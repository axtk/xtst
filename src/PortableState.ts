import type { EventCallback } from "./types/EventCallback.ts";
import type { EventPayload } from "./types/EventPayload.ts";

export type StateUpdate<T> = (value: T) => T;

/**
 * Data container allowing for subscription to its updates.
 */
export class PortableState<Value, Payload extends EventPayload = EventPayload> {
  _current: Value;
  _previous: Value;
  _callbacks: Record<string, Set<EventCallback<Payload>>> = {};
  _revision = -1;
  _active = true;
  eventAliases: Record<string, string> = {};

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
  on(event: string, callback: EventCallback<Payload>) {
    let effectiveEvent = this.eventAliases[event] ?? event;

    (this._callbacks[effectiveEvent] ??= new Set<EventCallback<Payload>>()).add(
      callback,
    );

    return () => this.off(event, callback);
  }
  /**
   * Adds a one-time event handler to the state: once the event is emitted,
   * the callback is called and removed from the state.
   */
  once(event: string, callback: EventCallback<Payload>) {
    let oneTimeCallback: EventCallback<Payload> = (payload) => {
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
  off(event: string, callback?: EventCallback<Payload>) {
    let effectiveEvent = this.eventAliases[event] ?? event;

    if (callback === undefined) delete this._callbacks[effectiveEvent];
    else this._callbacks[effectiveEvent]?.delete(callback);
  }
  /**
   * Emits the specified event. Returns `false` if at least one event callback
   * resolves as `false`, effectively interrupting the callback call chain.
   * Otherwise returns `true`.
   */
  emit(event: string, payload?: Payload) {
    let effectiveEvent = this.eventAliases[event] ?? event;
    let callbacks = this._callbacks[effectiveEvent];

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
    if (!this._active) return;

    let nextValue = this._resolveValue(update);
    let updatedPayload = this._updatePayload(nextValue, payload);

    if (
      this.emit("updatestart", updatedPayload) &&
      this._transition(updatedPayload) !== false
    ) {
      this._assignValue(nextValue);

      if (this.emit("update", updatedPayload)) {
        this._complete(updatedPayload);
        this.emit("updateend", updatedPayload);
      }
    }
  }
  _updatePayload(_nextValue: Value, payload?: Payload): Payload | undefined {
    return payload;
  }
  /**
   * Applies a state value change to an external system.
   * Returns `false` when the transition doesn't result in actual changes
   * in the current session.
   */
  _transition(_payload?: Payload): boolean | undefined | void {
    return true;
  }
  _complete(_payload?: Payload): boolean | undefined | void {
    return true;
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
