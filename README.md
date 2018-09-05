# pubsub

`pubsub` is a small, fast JavaScript library that implements [Publish/Subscribe](http://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern) pattern for web applications.

## Usage

```js
npm install --save @evercoder/pubsub
```

## API Reference

§ **new pubsub**(_options_) creates a new message bus.

Available options:

-   **strict**: (Boolean, default `false`) deprecates some ways of using `pubsub` that we found were promoting error-prone code patterns and restricts the message bus to a subset of its API. See [Strict Mode](#strict-mode).

```js
import pubsub from '@evercoder/pubsub';

let bus = new pubsub();
```

§ bus.**pub**(_event_, _payload_, ..._additional_args_) — publish an event.

§ bus.**sub**(_event(s)_, _callback_, _thisArg_, _options_) — subscribe a callback to an event.

Available options:

-   **once** (Boolean, default `false`) whether the callback should unsubscribe itself from the event after being called once.
-   **recoup** (Boolean, default `false`) whether the callback should be immediately executed if the event already happened before the subscription.

§ bus.**recoup**(_event_, _callback_, _thisArg_) is a shortcut for calling `sub()` with the `recoup: true` option.

§ bus.**once**(_event_, _callback_, _thisArg_) is a shortcut for calling `once()` with the `once: true` option.

§ bus.**unsub**(_event_, _callback_) — unsubscribe a callback from an event.

When _callback_ is omitted, all _callbacks_ on that particular event are unsubscribed.

## Strict mode

In strict mode, the following patterns log a warning:

-   `pub()`-ing an event with multiple arguments; use a single argument for the payload. Will allow us to make the library faster in a future version by leveraging the browser's function optimization.
-   `sub()`-ing to multiple events via a space-separated string; instead, you can send an array of events.
-   `sub()`: using `thisArg`; instead, bind the listener manually with `bind()` or using an arrow function.
-   `recoup()`: using it in any way;
-   `unsub()` called without a listener; The default behavior here (unsubscribing _all_ listeners from the event) may cause hard-to-trace bugs.
