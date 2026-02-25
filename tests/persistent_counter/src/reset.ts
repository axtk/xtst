import { counterState } from "./counterState.ts";

let button = document.querySelector("button.reset")!;

button.addEventListener("click", () => {
  counterState.setValue(0);
});
