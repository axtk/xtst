import { formState } from "./formState.ts";

let output = document.querySelector("output")!;
let defaultContent = output.textContent;

formState.on("update", ({ current }) => {
  output.textContent = current.username || defaultContent;
});
