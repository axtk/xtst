import { counterState } from "./counterState.ts";

let output = document.querySelector("output")!;

counterState.on("set", ({ current }) => {
  output.textContent = String(current);
});
