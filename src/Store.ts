export type StoreUpdate<T> = (value: T) => T;
export type StoreUpdateCallback<T> = (store: Store<T>) => void;

/**
 * Data container allowing for subscription to its updates.
 */
export class Store<T> {
  current: T;
  previous: T;
  callbacks: Record<string, Set<StoreUpdateCallback<T>>> = {};
  revision = -1;
  constructor(value: T) {
    this.previous = value;
    this.current = value;
  }
  /**
   * Adds an event handler to the store.
   *
   * Handlers of the `"update"` event are called whenever the store value
   * is updated via `setValue(value)`.
   *
   * Returns an unsubscription function. Once it's invoked, the given
   * `callback` is removed from the store and no longer called when
   * the store emits the corresponding event.
   */
  on(event: string, callback: StoreUpdateCallback<T>) {
    (this.callbacks[event] ??= new Set<StoreUpdateCallback<T>>()).add(callback);

    return () => this.off(event, callback);
  }
  /**
   * Adds a one-time event handler to the store: once the event is emitted,
   * the callback is called and removed from the store.
   */
  once(event: string, callback: StoreUpdateCallback<T>) {
    let oneTimeCallback: StoreUpdateCallback<T> = (store) => {
      this.off(event, oneTimeCallback);
      callback(store);
    };

    return this.on(event, oneTimeCallback);
  }
  /**
   * Removes `callback` from the store's handlers of the given event,
   * and removes all handlers of the given event if `callback` is not
   * specified.
   */
  off(event: string, callback?: StoreUpdateCallback<T>) {
    if (callback === undefined) delete this.callbacks[event];
    else this.callbacks[event]?.delete(callback);
  }
  emit(event: string) {
    if (this.callbacks[event]?.size) {
      for (let callback of this.callbacks[event]) callback(this);
    }
  }
  /**
   * Returns the current store value.
   */
  getValue() {
    return this.current;
  }
  /**
   * Updates the store value.
   *
   * @param update - A new value or an update function `(value) => nextValue`
   * that returns a new store value based on the current store value.
   */
  setValue(update: T | StoreUpdate<T>) {
    this.previous = this.current;
    this.current = update instanceof Function ? update(this.current) : update;
    this.revision = Math.random();
    this.emit("update");
  }
}
