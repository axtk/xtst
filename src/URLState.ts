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
      referrer: this.previous,
    };

    if (this.emit("navigationstart", navigationOptions)) {
      this._assignValue(href);
      this._transition(navigationOptions);
      this.emit("update", navigationOptions);

      if (this.emit("navigationend", navigationOptions))
        this._complete(navigationOptions);
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
    let url = new QuasiURL(x);

    if (typeof window !== undefined && url.origin === window.location.origin)
      url.origin = "";

    return url.href;
  }
  get current() {
    return this.toHref(this._current);
  }
  get previous() {
    return this.toHref(this._previous);
  }
  navigate(options = defaultNavigationOptions) {
    if (options?.href) this.setValue(options.href, options);
  }
  assign(url: string) {
    this.navigate({ href: url });
  }
  replace(url: string) {
    this.navigate({ href: url, history: "replace" });
  }
  reload() {
    this.assign(this._current);
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
    return this.current;
  }
  set href(value: string) {
    this.assign(value);
  }
  get pathname(): string {
    return new QuasiURL(this._current).pathname;
  }
  set pathname(value: string) {
    let url = new QuasiURL(this._current);
    url.pathname = value;
    this.assign(url.href);
  }
  get search(): string {
    return new QuasiURL(this._current).search;
  }
  set search(value: string | URLSearchParams) {
    let url = new QuasiURL(this._current);
    url.search = value;
    this.assign(url.href);
  }
  get hash() {
    return new QuasiURL(this._current).hash;
  }
  set hash(value: string) {
    let url = new QuasiURL(this._current);
    url.hash = value;
    this.assign(url.href);
  }
  toString() {
    return this.current;
  }
}
