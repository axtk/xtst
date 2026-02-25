import { counterState } from "./counterState.ts";

let button = document.querySelector("button.plus")!;

button.addEventListener("click", () => {
  counterState.setValue((value) => value + 1);
});
