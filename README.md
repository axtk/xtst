# sidestate

Vanilla TS/JS state management for data sharing across decoupled parts of the code and routing. Routing is essentially shared state management, too, with the shared state being the URL.

This package exposes the following classes:

```
EventEmitter ───► State ───► PersistentState
                    │
                    └──────► URLState ───► Route
```

Roughly, their purpose boils down to the following:

- `EventEmitter` is for triggering actions without tightly coupling the interacting components
- `State` is `EventEmitter` that stores data and emits an event when the data gets updated, for dynamic data sharing without tight coupling
- `PersistentState` is `State` that syncs its data to the browser storage and restores it on page reload
- `URLState` is `State` that stores the URL + syncs with the browser's URL in a SPA fashion
- `Route` is `URLState` + native-like APIs for SPA navigation and an API for URL matching

## `State`

Purpose: dynamic data sharing without tight coupling.

```js
import { State } from "sidestate";

const counterState = new State(42);

document.querySelector("button").addEventListener("click", () => {
  counterState.setValue((value) => value + 1);
});

counterState.on("update", ({ current }) => {
  document.querySelector("output").textContent = String(current);
});
```

In this example, a button changes a counter value and an `<output>` element shows the updating value. Both elements are only aware of the shared counter state, but not of each other.

## `PersistentState`

Similar to `State`. Additionally, it syncs its data to the browser storage and restores it on page reload.

```js
import { PersistentState } from "sidestate";

const counterState = new PersistentState(42, { key: "counter" });

counterState.on("update", ({ current }) => {
  document.querySelector("output").textContent = String(current);
});

counterState.emit("sync");
```

By default, `PersistentState` stores its data at the specified `key` in `localStorage` and transforms the data with `JSON.stringify()` and `JSON.parse()`. Switch to `sessionStorage` by setting `session: true` in the constructor's second parameter. Set custom `serialize()` and `deserialize()` to override the default data transforms.

Emit the `"sync"` event to signal the state to update its value from the browser storage, which can be done once or multiple times after creating the state. If it's desirable to sync the state once regardless of the number of sync calls (possibly coming from multiple independent parts of the code), a `"synconce"` event can be used instead.

## `Route`

Stores the URL, exposes a native-like API for SPA navigation and an API for URL matching.

```js
import { Route } from "sidestate";

const route = new Route();
```

Navigate to other URLs in a SPA fashion similarly to the native APIs:

```js
route.href = "/intro";
route.assign("/intro");
route.replace("/intro");
```

Or in a more fine-grained manner:

```js
route.navigate({ href: "/intro", history: "replace", scroll: "off" });
```

Check the current URL value like a regular `string` with `route.href`:

```js
route.href === "/intro";
route.href.startsWith("/sections/");
/^\/sections\/\d+\/?/.test(route.href);
```

Or, alternatively, with `route.at(url, x, y)` which is similar to the ternary conditional operator `atURL ? x : y`:

```js
document.querySelector("header").className = route.at("/", "full", "compact");
```

Use `route.at(url, x, y)` with dynamic values that require values from the URL pattern's capturing groups:

```js
document.querySelector("h1").textContent = route.at(
  /^\/sections\/(?<id>\d+)\/?/,
  ({ params }) => `Section ${params.id}`,
);
```

Convert links to SPA links inside the specified container (or the entire `document`):

```js
route.observe(document);
```

Tweak the links' navigation behavior by setting their optional `data-` attributes (corresponding to the `route.navigate()` options):

```html
<a href="/intro" data-history="replace" data-scroll="off" data-spa="off">Intro</a>
```

Define what should be done when the URL changes:

```js
route.on("navigationcomplete", ({ href }) => {
  renderContent();
});
```

Define what should be done before the URL changes (in a way effectively similar to routing middleware):

```js
route.on("navigationstart", ({ href }) => {
  if (hasUnsavedInput)
    return false; // Preventing navigation

  if (href === "/") {
    route.href = "/intro"; // SPA redirection
    return false;
  }
});
```

## Integrations

[`react-sidestate`](https://www.npmjs.com/package/react-sidestate)
