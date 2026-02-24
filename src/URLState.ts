import { QuasiURL } from "quasiurl";
import { PortableState } from "./PortableState.ts";
import type { NavigationOptions } from "./types/NavigationOptions.ts";

const defaultNavigationOptions: NavigationOptions = {};

export class URLState extends PortableState<string, NavigationOptions> {
  eventAliases = {
    navigationstart: "updatestart",
    navigation: "update",
    navigationend: "updateend",
  };
  constructor(href = "") {
    super(href);
    this._init();
  }
  _init() {
    if (typeof window === "undefined") return;

    let handleURLChange = () => {
      this.setValue(window.location.href);
    };

    let start = () => {
      window.addEventListener("popstate", handleURLChange);
    };

    let stop = () => {
      window.removeEventListener("popstate", handleURLChange);
    };

    this.on("start", start);
    this.on("stop", stop);
    start();
  }
  _updatePayload(nextHref: string, payload?: NavigationOptions) {
    return {
      ...payload,
      href: this.toHref(nextHref),
      referrer: this.current,
    };
  }
  _transition(options = defaultNavigationOptions) {
    if (typeof window === "undefined" || options?.href === undefined) return;

    let { href, target, spa, history } = options;

    if (target && target !== "_self") {
      window.open(href, target);
      return false;
    }

    let url = new QuasiURL(href);

    if (
      spa === "off" ||
      !window.history ||
      (url.origin !== "" && url.origin !== window.location.origin)
    ) {
      window.location[history === "replace" ? "replace" : "assign"](href);
      return false;
    }

    window.history[history === "replace" ? "replaceState" : "pushState"](
      {},
      "",
      href,
    );
  }
  _complete(options = defaultNavigationOptions) {
    if (typeof window === "undefined" || options?.scroll === "off") return;

    let { href, target } = options;

    if (href === undefined || (target && target !== "_self")) return;

    let { hash } = new QuasiURL(String(href));

    requestAnimationFrame(() => {
      let targetElement =
        hash === ""
          ? null
          : document.querySelector(`${hash}, a[name="${hash.slice(1)}"]`);

      if (targetElement) targetElement.scrollIntoView();
      else window.scrollTo(0, 0);
    });
  }
  toHref(x: string) {
    if (typeof window === "undefined") return x;

    let url = new QuasiURL(x || window.location.href);

    if (url.origin === window.location.origin) url.origin = "";

    return url.href;
  }
  get current() {
    return this.toHref(this._current);
  }
  get previous() {
    return this.toHref(this._previous);
  }
}
