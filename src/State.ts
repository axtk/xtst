import { EventEmitter } from "./EventEmitter.ts";

export type StateUpdate<T> = (value: T) => T;

export type EventPayloadMap<T> = Record<string, void> & {
  update: {
    previous: T;
    current: T;
  };
};

/**
 * Data container allowing for subscription to its updates.
 */
export class State<T, P extends EventPayloadMap<T> = EventPayloadMap<T>> extends EventEmitter<P> {
  _value: T;
  _revision = -1;
  constructor(value: T) {
    super();
    this._value = value;
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
  setValue(update: T | StateUpdate<T>) {
    if (this._active) this._assignValue(this._resolveValue(update));
  }
  _resolveValue(update: T | StateUpdate<T>) {
    return update instanceof Function ? update(this._value) : update;
  }
  _assignValue(value: T) {
    let previous = this._value;
    let current = value;

    this._value = current;
    this._revision = Math.random();

    this.emit("update", { previous, current });
  }
  get revision() {
    return this._revision;
  }
}
