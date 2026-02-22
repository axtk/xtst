export type StateUpdate<T> = (value: T) => T;
export type StateUpdateCallback = () => boolean | undefined | void;

/**
 * Data container allowing for subscription to its updates.
 */
export class State<T> {
  current: T;
  previous: T;

  callbacks: Record<string, Set<StateUpdateCallback>> = {};
  revision = -1;
  active = false;

  constructor(value: T) {
    this.current = value;
    this.previous = value;
    this.init();
  }
  init() {
    this.start();
  }
  start() {
    this.active = true;
    this.emit("start");
  }
  stop() {
    this.active = false;
    this.emit("stop");
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
  on(event: string, callback: StateUpdateCallback) {
    (this.callbacks[event] ??= new Set<StateUpdateCallback>()).add(callback);

    return () => this.off(event, callback);
  }
  /**
   * Adds a one-time event handler to the state: once the event is emitted,
   * the callback is called and removed from the state.
   */
  once(event: string, callback: StateUpdateCallback) {
    let oneTimeCallback: StateUpdateCallback = () => {
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
  off(event: string, callback?: StateUpdateCallback) {
    if (callback === undefined) delete this.callbacks[event];
    else this.callbacks[event]?.delete(callback);
  }
  /**
   * Emits the specified event. Returns `false` if at least one event callback
   * resolves as `false`, effectively interrupting the callback call chain.
   * Otherwise returns `true`.
   */
  emit(event: string) {
    let callbacks = this.callbacks[event];

    if (this.active && callbacks?.size) {
      for (let callback of callbacks) {
        if (callback() === false) return false;
      }
    }

    return true;
  }
  /**
   * Returns the current state value.
   */
  getValue(): T {
    return this.current;
  }
  /**
   * Updates the state value.
   *
   * @param update - A new value or an update function `(value) => nextValue`
   * that returns a new state value based on the current state value.
   */
  setValue(update: T | StateUpdate<T>): void {
    if (!this.active || !this.emit("updatestart")) return;

    this.previous = this.current;
    this.current = update instanceof Function ? update(this.current) : update;
    this.revision = Math.random();

    this.emit("update");
  }
}
