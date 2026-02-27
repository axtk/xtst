import { counterState } from "./counterState.ts";

let output = document.querySelector("output")!;

output.textContent = String(counterState.getValue());

counterState.on("set", ({ current }) => {
  output.textContent = String(current);
});
