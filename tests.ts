import { isState, State } from "./index.ts";

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

let state = new State(10);

let testValue = [100, -3];
let unsubscribe = [
  state.on("update", () => {
    testValue[0] += state.value;
  }),
  state.on("update", () => {
    testValue[1] *= state.value;
  }),
];

assert(isState(state), true);
assert(isState({}), false);

assert(state.value, 10);
assert(state._callbacks.update.size, 2);
assert(testValue[0], 100);
assert(testValue[1], -3);

state.setValue(2);
assert(state.value, 2);
assert(testValue[0], 102);
assert(testValue[1], -6);

state.setValue(-25);
assert(state.value, -25);
assert(testValue[0], 77);
assert(testValue[1], 150);

unsubscribe[1]();
assert(state._callbacks.update.size, 1);

state.setValue(12);
assert(state.value, 12);
assert(testValue[0], 89);
assert(testValue[1], 150);

state.setValue((value) => value - 2);
assert(state.value, 10);
assert(testValue[0], 99);
assert(testValue[1], 150);

console.log();
console.log("Passed");
