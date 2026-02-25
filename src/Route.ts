import { QuasiURL } from "quasiurl";
import type { LinkElement } from "./types/LinkElement.ts";
import type { NavigationOptions } from "./types/NavigationOptions.ts";
import { URLState } from "./URLState.ts";
import { getNavigationOptions } from "./utils/getNavigationOptions.ts";
import { isRouteEvent } from "./utils/isRouteEvent.ts";

export type ContainerElement = Document | Element | null | undefined;
export type ElementCollection = (string | Node)[] | HTMLCollection | NodeList;

export type ObservedElement =
  | string
  | Node
  | (string | Node)[]
  | HTMLCollection
  | NodeList;

let isElementCollection = (x: unknown): x is ElementCollection =>
  Array.isArray(x) || x instanceof NodeList || x instanceof HTMLCollection;

let isLinkElement = (x: unknown): x is LinkElement =>
  x instanceof HTMLAnchorElement || x instanceof HTMLAreaElement;

export class Route extends URLState {
  _clicks = new Set<(event: MouseEvent) => void>();
  _init() {
    super._init();

    let handleClick = (event: MouseEvent) => {
      for (let callback of this._clicks) callback(event);
    };

    let start = () => {
      document.addEventListener("click", handleClick);
    };

    let stop = () => {
      document.removeEventListener("click", handleClick);
    };

    this.on("start", start);
    this.on("stop", stop);
    start();
  }
  observe(
    container: ContainerElement | (() => ContainerElement),
    elements: ObservedElement = "a, area",
  ) {
    let handleClick = (event: MouseEvent) => {
      if (!this._active || event.defaultPrevented || !isRouteEvent(event))
        return;

      let resolvedContainer =
        typeof container === "function" ? container() : container;

      if (!resolvedContainer) return;

      let element: HTMLAnchorElement | HTMLAreaElement | null = null;
      let targetElements = isElementCollection(elements)
        ? Array.from(elements)
        : [elements];

      for (let targetElement of targetElements) {
        let target: Node | null = null;

        if (typeof targetElement === "string")
          target =
            event.target instanceof HTMLElement
              ? event.target.closest(targetElement)
              : null;
        else target = targetElement;

        if (isLinkElement(target) && resolvedContainer.contains(target)) {
          element = target;
          break;
        }
      }

      if (element) {
        event.preventDefault();
        this.navigate(getNavigationOptions(element));
      }
    };

    this._clicks.add(handleClick);

    return () => {
      this._clicks.delete(handleClick);
    };
  }
  navigate(options?: NavigationOptions) {
    if (options?.href) this.setValue(options.href, options);
  }
  assign(url: string) {
    this.navigate({ href: url });
  }
  replace(url: string) {
    this.navigate({ href: url, history: "replace" });
  }
  reload() {
    this.assign(this.getValue());
  }
  go(delta: number) {
    if (typeof window !== "undefined" && window.history)
      window.history.go(delta);
  }
  back() {
    this.go(-1);
  }
  forward() {
    this.go(1);
  }
  get href() {
    return this.getValue();
  }
  set href(value: string) {
    this.assign(value);
  }
  get pathname(): string {
    return new QuasiURL(this.href).pathname;
  }
  set pathname(value: string) {
    let url = new QuasiURL(this.href);
    url.pathname = value;
    this.assign(url.href);
  }
  get search(): string {
    return new QuasiURL(this.href).search;
  }
  set search(value: string | URLSearchParams) {
    let url = new QuasiURL(this.href);
    url.search = value;
    this.assign(url.href);
  }
  get hash() {
    return new QuasiURL(this.href).hash;
  }
  set hash(value: string) {
    let url = new QuasiURL(this.href);
    url.hash = value;
    this.assign(url.href);
  }
  toString() {
    return this.href;
  }
}
