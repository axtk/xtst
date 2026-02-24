# xtst

A lightweight data container allowing for subscription to its updates, e.g. to be shared by multiple independent parts of code

Such containers can be used as state shared across application components with libraries like React. See [`@axcraft/react-external-state`](https://github.com/axcraft/react-external-state) exposing a ready-to-use hook for shared state management.

## Initialization

`ExternalState` accepts data of any kind.

```js
import { ExternalState } from "@axcraft/external-state";

// With a primitive value
let state1 = new ExternalState(0);

// With a nonprimitive value
let state2 = new ExternalState({ counter: 0 });
```

## Value manipulation

The `ExternalState` value can be read and updated with `getValue()` and `setValue(update)`. `setValue(update)` accepts either a new value or a function `(value) => nextValue` that returns a new state value based on the current state value.

```js
let state = new ExternalState({ counter: 0 });

state.setValue({ counter: 100 });
state.setValue((value) => ({ ...value, counter: value.counter + 1 }));

let value = state.getValue();
console.log(value.counter); // 101
```

## Subscription to updates

Each time the `ExternalState` value is updated via `setValue(value)` the state emits an `"update"` event allowing for subscriptions:

```js
let unsubscribe = state.on("update", ({ current, previous }) => {
  console.log(current, previous);
});
```

Each subscription returns an unsubscription function. Once it's invoked, the given `callback` is removed from the `ExternalState` instance and no longer called when the state is updated.
