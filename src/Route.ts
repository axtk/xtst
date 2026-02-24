import { QuasiURL } from "quasiurl";
import type { NavigationOptions } from "./types/NavigationOptions.ts";
import { URLState } from "./URLState.ts";

export class Route {
  state: URLState;
  constructor(href?: string | URLState) {
    this.state = href instanceof URLState ? href : new URLState(href);
  }
  navigate(options?: NavigationOptions) {
    if (options?.href) this.state.setValue(options.href, options);
  }
  assign(url: string) {
    this.navigate({ href: url });
  }
  replace(url: string) {
    this.navigate({ href: url, history: "replace" });
  }
  reload() {
    this.assign(this.state.current);
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
    return this.state.current;
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
