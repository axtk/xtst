import { EventEmitter } from "./EventEmitter.ts";

export type StateUpdate<T> = (value: T) => T;

export type StateUpdatePayload<T> = {
  previous: T;
  current: T;
};

export type StatePayloadMap<T> = Record<string, void> & {
  update: StateUpdatePayload<T>;
  // Similar to "update", but its callback is also immediately invoked when added
  set: StateUpdatePayload<T>;
  start: void;
  stop: void;
};

function isImmediatelyInvokedEvent(event: unknown): event is "set" {
  return event === "set";
}

/**
 * Data container allowing for subscription to its updates.
 */
export class State<
  T,
  P extends StatePayloadMap<T> = StatePayloadMap<T>,
> extends EventEmitter<P> {
  _value: T;
  _revision = -1;
  constructor(value: T) {
    super();
    this._value = value;
  }
  getImmediateInvocation<E extends keyof P>(event: E): { ok: boolean; payload?: P[E] } {
    if (isImmediatelyInvokedEvent(event)) {
      let current = this.getValue();

      return {
        ok: true,
        payload: {
          current,
          previous: current,
        } as P[typeof event],
      };
    }

    return super.getImmediateInvocation(event);
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

    // Unlike "update" callbacks, "set" callbacks are also immediately
    // invoked when added
    this.emit("set", { previous, current });
  }
  get revision() {
    return this._revision;
  }
}
