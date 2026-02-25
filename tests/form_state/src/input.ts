import { formState } from "./formState.ts";

let input = document.querySelector("input")!;

input.addEventListener("input", () => {
  formState.setValue((state) => ({ ...state, username: input.value }));
});
