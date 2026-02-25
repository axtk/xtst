import { counterState } from "./counterState.ts";

let output = document.querySelector("output")!;

output.textContent = String(counterState.getValue());

counterState.on("update", ({ current }) => {
  output.textContent = String(current);
});
