import { isStore, Store } from "./index.ts";

let testIndex = 0;

function assert(value: unknown, expectedValue: unknown) {
  let valid = JSON.stringify(value) === JSON.stringify(expectedValue);

  console.log(`000${++testIndex}`.slice(-3), valid ? "Passed" : "Failed");

  if (!valid) throw new Error(`Expected ${expectedValue}, got ${value}.`);
}

let store = new Store(10);

let testValue = [100, -3];
let unsubscribe = [
  store.on("update", ({ current }) => {
    testValue[0] += current;
  }),
  store.on("update", ({ current }) => {
    testValue[1] *= current;
  }),
];

assert(isStore(store), true);
assert(isStore({}), false);

assert(store.getValue(), 10);
assert(store.callbacks.update.size, 2);

store.setValue(2);
assert(store.getValue(), 2);
assert(testValue[0], 102);
assert(testValue[1], -6);

store.setValue(-25);
assert(store.getValue(), -25);
assert(testValue[0], 77);
assert(testValue[1], 150);

unsubscribe[1]();
assert(store.callbacks.update.size, 1);

store.setValue(12);
assert(store.getValue(), 12);
assert(testValue[0], 89);
assert(testValue[1], 150);

console.log();
console.log("Passed");
