import { Route } from "../../src/Route.ts";
import "./index.css";

let route = new Route();

route.on("navigationcomplete", () => {
  renderHeader();
  renderMainContent();
});

route.observe(document);
route.start();

function renderHeader() {
  document.querySelector("header")!.className = route.at(
    "/",
    "full",
    "compact",
  );
}

function renderMainContent() {
  let { ok: isSection, params } = route.match(/^\/sections\/(?<id>\d+)\/?/);

  if (isSection)
    document.querySelector('[data-id="section"] h2 span')!.textContent =
      params.id ?? "";

  document
    .querySelector('main[data-id="intro"]')!
    .toggleAttribute("hidden", isSection);

  document
    .querySelector('main[data-id="section"]')!
    .toggleAttribute("hidden", !isSection);

  document.body.removeAttribute("hidden");
}
