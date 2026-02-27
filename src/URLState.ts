import { QuasiURL } from "quasiurl";
import { type StatePayloadMap, State, type StateUpdate } from "./State.ts";
import type { EventCallback } from "./types/EventCallback.ts";
import type { NavigationOptions } from "./types/NavigationOptions.ts";

export type URLStatePayloadMap = StatePayloadMap<string> & {
  navigationstart: NavigationOptions;
  // Similar to the "update" event, but with a `NavigationOptions` payload
  navigation: NavigationOptions;
  navigationcomplete: NavigationOptions;
};

function isImmediatelyInvoked(
  event: string,
): event is "navigationstart" | "navigationcomplete" {
  return event === "navigationstart" || event === "navigationcomplete";
}

export class URLState extends State<string, URLStatePayloadMap> {
  constructor(href = "") {
    super(href);
    this._init();
  }
  _init() {
    if (typeof window === "undefined") return;

    let handleURLChange = () => {
      this.setValue(window.location.href, { source: "popstate" });
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
  on<E extends keyof URLStatePayloadMap>(
    event: E,
    callback: EventCallback<URLStatePayloadMap[E]>,
    invokeImmediately?: boolean,
  ) {
    // The navigation event callbacks are invoked immediately by default as
    // soon as they are added to adjust to the current URL state.
    if (
      this._active &&
      isImmediatelyInvoked(event) &&
      invokeImmediately !== false
    ) {
      let payload: NavigationOptions = {
        href: this.getValue(),
      };

      callback(payload as URLStatePayloadMap[typeof event]);
    }

    return super.on(event, callback);
  }
  getValue() {
    return this.toValue(this._value);
  }
  setValue(update: string | StateUpdate<string>, options?: NavigationOptions) {
    if (!this._active) return;

    let href = this.toValue(this._resolveValue(update));

    let extendedOptions: NavigationOptions = {
      ...options,
      href,
      referrer: this.getValue(),
    };

    if (
      this.emit("navigationstart", extendedOptions) &&
      this._transition(extendedOptions) !== false
    ) {
      this._assignValue(href);
      this.emit("navigation", extendedOptions);

      if (this.emit("navigationcomplete", extendedOptions))
        this._complete(extendedOptions);
    }
  }
  _transition(options?: NavigationOptions): boolean | void | undefined {
    if (
      typeof window === "undefined" ||
      options?.href === undefined ||
      options?.source === "popstate"
    )
      return;

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
  _complete(options?: NavigationOptions): boolean | void | undefined {
    if (typeof window === "undefined" || !options || options.scroll === "off")
      return;

    let { href, target } = options;

    if (href === undefined || (target && target !== "_self")) return;

    let { hash } = new QuasiURL(href);

    requestAnimationFrame(() => {
      let targetElement =
        hash === ""
          ? null
          : document.querySelector(`${hash}, a[name="${hash.slice(1)}"]`);

      if (targetElement) targetElement.scrollIntoView();
      else window.scrollTo(0, 0);
    });
  }
  toValue(x: string) {
    if (typeof window === "undefined") return x;

    let url = new QuasiURL(x || window.location.href);

    if (url.origin === window.location.origin) url.origin = "";

    return url.href;
  }
}
