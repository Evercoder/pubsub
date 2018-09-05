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

```js
bus.pub('my-event', {
	myprop: myvalue
});
```

All `pub()` arguments after the event are forwarded as-is as arguments to the listeners.

**Note:** Although the library supports multiple arguments, we plan to [deprecate this feature](#strict-mode).

§ bus.**sub**(_event(s)_, _listener_, _thisArg_, _options_) — subscribe a listener to an event.

```js
bus.sub('my-event', function(payload) {
	console.log(payload.myrop);
	// ⇒ myvalue
});
```

Available options:

-   **once** (Boolean, default `false`) whether the listener should unsubscribe itself from the event after being called once.
-   👎 **recoup** (Boolean, default `false`) whether the listener should be immediately executed if the event already happened before the subscription.

§ 👎 bus.**recoup**(_event_, _listener_, _thisArg_) is a shortcut for calling `sub()` with the `recoup: true` option.

**Note:** This option [will be deprecated](#strict-mode).

§ bus.**once**(_event_, _listener_, _thisArg_) is a shortcut for calling `once()` with the `once: true` option.

§ bus.**unsub**(_event_, _listener_) — unsubscribe a listener from an event.

**Note:** Currently, when _listener_ is omitted, all listeners on that particular event are unsubscribed. We plan to [deprecate this feature](#strict-mode).

## Strict mode

In strict mode, the following patterns log a warning:

#### `pub()`-ing an event with multiple arguments

> Always use a single argument for the payload.

Handling multiple arguments means the library needs to manipulate the `arguments` object to properly forward them to the listeners. Renouncing this will allow us to make a faster library by leveraging browser code optimizations.

#### `sub()`-ing to multiple events via a space-separated string

> Always use an _array_ of events as the first argument to subscribe to many events at once.

A previous version of the library did not support arrays and used space-separated strings. When using statically analyzable event names, it made you use an awkward construct:

```js
bus.sub([EVENT_A, EVENT_B].join(''), function() { ... });
```

#### `sub()`: using `thisArg`;

> Instead, bind the listener manually with `bind()` or using an arrow function.

```js
bus.sub(
	'myevent',
	function() {
		this.doSomething();
	}.bind(this)
);

// or

bus.sub('myevent', () => {
	this.doSomething();
});
```

Storing `thisArg` in the `pubsub` instance may create memory leaks.

#### Using `recoup()`

> Find an alternative where you can use a simple `sub()`.

Similar to storing `thisArg` for `sub()`, storing the arguments with which `pub` was called, so that listeners could listen to that event retroactively, can create memory leaks or subtle inconsistencies in state.

#### `unsub()` called without a listener

> Always provide the listener you wish to unsubscribe.

The default behavior here (unsubscribing _all_ listeners from the event) may cause hard-to-trace bugs if `unsub()` silently receives an undefined reference to a listener.
