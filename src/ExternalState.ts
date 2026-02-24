export type StateUpdate<T> = (value: T) => T;
export type EventCallback<T> = (payload: T) => boolean | undefined | void;

export type EventCallbackMap<Map extends Record<string, unknown>> = Partial<{
  [K in keyof Map]: Set<EventCallback<Map[K]>>;
}>;

export type EventPayloadMapShape<T extends Record<string, unknown>> = Record<string, void> & T;

export type EventPayloadMap<T> = EventPayloadMapShape<{
  update: {
    previous: T;
    current: T;
  };
}>;

/**
 * Data container allowing for subscription to its updates.
 */
export class ExternalState<T, P extends EventPayloadMap<T> = EventPayloadMap<T>> {
  _value: T;
  _callbacks: EventCallbackMap<P> = {};
  _revision = -1;
  _active = true;

  constructor(value: T) {
    this._value = value;
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
  on<E extends keyof P>(event: E, callback: EventCallback<P[E]>) {
    (this._callbacks[event] ??= new Set()).add(callback);

    return () => this.off(event, callback);
  }
  /**
   * Adds a one-time event handler to the state: once the event is emitted,
   * the callback is called and removed from the state.
   */
  once<E extends keyof P>(event: E, callback: EventCallback<P[E]>) {
    let oneTimeCallback = (payload: P[E]) => {
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
  off<E extends keyof P>(event: E, callback?: EventCallback<P[E]>) {
    if (callback === undefined) delete this._callbacks[event];
    else this._callbacks[event]?.delete(callback);
  }
  /**
   * Emits the specified event. Returns `false` if at least one event callback
   * resolves as `false`, effectively interrupting the callback call chain.
   * Otherwise returns `true`.
   */
  emit<E extends keyof P>(event: E, payload?: P[E]) {
    let callbacks = this._callbacks[event];

    if (this._active && callbacks?.size) {
      for (let callback of callbacks) {
        if (callback(payload!) === false) return false;
      }
    }

    return true;
  }
  getValue() {
    return this._value;
  }
  /**
   * Updates the state value.
   *
   * @param update - A new value or an update function `(value) => nextValue`
   * that returns a new state value based on the current state value.
   */
  setValue(update: T | StateUpdate<T>): void {
    if (!this._active) return;

    let previous = this._value;
    let current = update instanceof Function ? update(this._value) : update;

    this._value = current;
    this._revision = Math.random();

    this.emit("update", { previous, current });
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
