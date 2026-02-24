import { isExternalState, ExternalState } from "./index.ts";

let testIndex = 0;

function assert(value: unknown, expectedValue: unknown) {
  let valid = JSON.stringify(value) === JSON.stringify(expectedValue);

  console.log(`000${++testIndex}`.slice(-3), valid ? "Passed" : "Failed");

  if (!valid) {
    console.error(`Expected: ${JSON.stringify(expectedValue)}`);
    console.error(`Got: ${JSON.stringify(value)}`);

    throw new Error("Test value mismatch");
  }
}

let state = new ExternalState(10);

let testValue = [100, -3];
let unsubscribe = [
  state.on("update", () => {
    testValue[0] += state.current;
  }),
  state.on("update", () => {
    testValue[1] *= state.current;
  }),
];

assert(isExternalState(state), true);
assert(isExternalState({}), false);

assert(state.current, 10);
assert(state._callbacks.update.size, 2);
assert(testValue[0], 100);
assert(testValue[1], -3);

state.setValue(2);
assert(state.current, 2);
assert(testValue[0], 102);
assert(testValue[1], -6);

state.setValue(-25);
assert(state.current, -25);
assert(testValue[0], 77);
assert(testValue[1], 150);

unsubscribe[1]();
assert(state._callbacks.update.size, 1);

state.setValue(12);
assert(state.current, 12);
assert(testValue[0], 89);
assert(testValue[1], 150);

state.setValue((value) => value - 2);
assert(state.current, 10);
assert(testValue[0], 99);
assert(testValue[1], 150);

console.log();
console.log("Passed");
