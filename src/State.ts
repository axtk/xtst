export type StateUpdate<T> = (value: T) => T;
export type StateEventCallback = () => boolean | undefined | void;

/**
 * Data container allowing for subscription to its updates.
 */
export class State<T> {
  _value: T;
  _callbacks: Record<string, Set<StateEventCallback>> = {};
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
  on(event: string, callback: StateEventCallback) {
    (this._callbacks[event] ??= new Set<StateEventCallback>()).add(callback);

    return () => this.off(event, callback);
  }
  /**
   * Adds a one-time event handler to the state: once the event is emitted,
   * the callback is called and removed from the state.
   */
  once(event: string, callback: StateEventCallback) {
    let oneTimeCallback: StateEventCallback = () => {
      this.off(event, oneTimeCallback);
      callback();
    };

    return this.on(event, oneTimeCallback);
  }
  /**
   * Removes `callback` from the state's handlers of the given event,
   * and removes all handlers of the given event if `callback` is not
   * specified.
   */
  off(event: string, callback?: StateEventCallback) {
    if (callback === undefined) delete this._callbacks[event];
    else this._callbacks[event]?.delete(callback);
  }
  /**
   * Emits the specified event. Returns `false` if at least one event callback
   * resolves as `false`, effectively interrupting the callback call chain.
   * Otherwise returns `true`.
   */
  emit(event: string) {
    let callbacks = this._callbacks[event];

    if (this._active && callbacks?.size) {
      for (let callback of callbacks) {
        if (callback() === false) return false;
      }
    }

    return true;
  }
  /**
   * Updates the state value.
   *
   * @param update - A new value or an update function `(value) => nextValue`
   * that returns a new state value based on the current state value.
   */
  setValue(update: T | StateUpdate<T>): void {
    if (!this._active || !this.emit("updatestart")) return;

    this._value = update instanceof Function ? update(this._value) : update;
    this._revision = Math.random();

    this.emit("update");
  }
  get value(): T {
    return this._value;
  }
  get revision() {
    return this._revision;
  }
  get active() {
    return this._active;
  }
  set active(value: boolean) {
    this._active = value;
    this.emit(value ? "active" : "inactive");
  }
}
