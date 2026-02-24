import { QuasiURL } from "quasiurl";
import { PortableState, StateUpdate } from "./PortableState.ts";
import { NavigationOptions } from "./types/NavigationOptions.ts";

const defaultNavigationOptions: NavigationOptions = {};

export class URLState extends PortableState<string, NavigationOptions> {
  constructor(href = "") {
    super(href);

    if (typeof window !== "undefined") {
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
  }
  setValue(update: string | StateUpdate<string>, payload?: NavigationOptions) {
    if (!this._active) return;

    let href = this.toHref(this._resolveValue(update));

    let navigationOptions = {
      ...payload,
      href,
      referrer: this.current,
    };

    if (this.emit("updatestart", navigationOptions)) {
      this._assignValue(href);

      if (this.emit("update", navigationOptions)) {
        this._transition(navigationOptions);
        this._complete(navigationOptions);
        this.emit("updateend", navigationOptions);
      }
    }
  }
  _transition(options = defaultNavigationOptions) {
    if (typeof window === "undefined" || options?.href === undefined) return;

    let { href, target, spa, history } = options;

    if (target && target !== "_self") {
      window.open(href, target);
      return;
    }

    let url = new QuasiURL(href);

    if (spa === "off" || !window.history || (url.origin !== "" && url.origin !== window.location.origin)) {
      window.location[history === "replace" ? "replace" : "assign"](href);
      return;
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

    return new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        let targetElement =
          hash === ""
            ? null
            : document.querySelector(`${hash}, a[name="${hash.slice(1)}"]`);

        if (targetElement) targetElement.scrollIntoView();
        else window.scrollTo(0, 0);

        resolve();
      });
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
