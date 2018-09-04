class pubsub {
	constructor(options) {
		this.options = options;
		this._pubsubEvents = {};
		this._pubsubHappened = {};
	}

	/*
		Publish an event.
		
		* **pub(event, [arg1, [arg2 ...]])**
		 * *event* the event to trigger;
		 * *arg1 ... argN* (optional) any number of additional params to pass to the event subscribers.
	*/
	pub(eventString) {
		if (!eventString) {
			throw new Error('pubsub.pub() received empty event string');
		}

		if (arguments.length > 2) {
			console.warn(
				`[Deprecated]: Publishing an event with multiple arguments is deprecated. Re: ${eventString}`
			);
		}

		var eventComponents = this.eventNamespace(eventString);
		var eventArray, i, ilen, j, jlen, args, subscriber, ret, event;
		for (i = 0, ilen = eventComponents.length; i < ilen; i++) {
			eventArray = this._pubsubEvents[(event = eventComponents[i])] || [];
			args = [];
			for (j = 1; j < arguments.length; j++) {
				args.push(arguments[j]);
			}
			for (j = 0, jlen = eventArray.length; j < jlen; j++) {
				subscriber = eventArray[j];
				ret = subscriber[0].apply(subscriber[1] || this, args);
				if (subscriber[2] && ret !== false) {
					this.unsub(event, subscriber[0]);
				}
			}
			this._pubsubHappened[event] = args;
		}
		return this;
	}

	/*
		Subscribe a function to one or more events.
		
		 * **sub(eventString, method, [thisArg, [flags]])**
		   * *eventString* one or more space-separated events;
		   * *method* the function to subscribe to the events;
		   * *thisArg* (optional) context for the method;
		   * *flags* (optional) boleans to configure the subscribers's behavior:
		     * *once* if true, the subscriber will self-unsubscribe after the first successful execution. Use *pubsub.once()* for clarity;
		     * *recoup* if true, the subscriber will execute immediately if the event it subscribes to already happened. Use *pubsub.recoup()* for clarity.
		
		*Note:* When subscribing to multiple events, make sure these events are published with the same (or similar) list of arguments.
	*/
	sub(eventStr, method, thisArg, flags) {
		if (!eventStr) {
			throw new Error('pubsub.sub() received empty event string');
		}

		if (thisArg) {
			console.warn(
				`sub(): thisArg is deprecated, please bind your method manually. Re: ${eventStr}`
			);
		}

		var events;

		if (Array.isArray(eventStr)) {
			events = eventStr;
		} else {
			events = eventStr.split(/\s+/);
			if (events.length > 1) {
				console.warn(
					`Subscribing to space-separated events is deprecated; please use an array of events. Re: ${eventStr}`
				);
			}
		}

		var event, eventArray, i, len, oldArgs;

		flags = flags || { once: false, recoup: false };
		for (i = 0, len = events.length; i < len; i++) {
			eventArray = this._pubsubEvents[(event = events[i])];
			if (eventArray) {
				eventArray.push([method, thisArg, flags.once]);
			} else {
				this._pubsubEvents[event] = [[method, thisArg, flags.once]];
			}
			if (flags.recoup) {
				oldArgs = this._pubsubHappened[event];
				if (oldArgs) {
					method.apply(thisArg || this, oldArgs);
				}
			}
		}
		return this;
	}

	/*
		Unsubscribe a function from one or more events.
		
		 * **unsub(eventString, method)**
		   * *eventString* one or more space-separated events;
		   * *method* (optional) the function to unsubscribe
		
		If no *method* is provided, all attached methods will be unsubscribed from the event(s).
	*/
	unsub(eventStr, method) {
		if (!eventStr) {
			throw new Error('pubsub.unsub() received empty event string');
		}
		var events = eventStr.split(/\s+/),
			event,
			eventArray,
			newEventArray,
			i,
			j;
		for (i = 0; i < events.length; i++) {
			eventArray = this._pubsubEvents[(event = events[i])] || [];
			newEventArray = [];
			for (j = 0; method && j < eventArray.length; j++) {
				if (eventArray[j][0] !== method) {
					newEventArray.push(eventArray[j]);
				}
			}
			this._pubsubEvents[event] = newEventArray;
		}
		return this;
	}

	/*
		### pubsub.once
		Subscribe to an event once.
		
		The function will be unsubscribed upon successful exectution.
		To mark the function execution as unsuccessful
		(and thus keep it subscribed), make it return `false`.
		
		 * **once(eventString, method, thisArg)** identical to *pubsub.sub()*.
	*/
	once(eventStr, method, thisArg) {
		return this.sub(eventStr, method, thisArg, { once: true });
	}

	/*
		### pubsub.recoup
		Subscribe to an event, and execute immediately if that event was ever published before.
		
		If executed immediately, the subscriber will get as parameters the last values sent with the event.
		
		 * **recoup(eventString, method, thisArg)** identical to *pubsub.sub()*.
	*/
	recoup(eventStr, method, thisArg) {
		return this.sub(eventStr, method, thisArg, { recoup: true });
	}

	/*
		### pubsub.eventNamespace
		Parses the namespaced event string and returns an array of events to publish.
		The original implementation does: `"path:to:event" => ["path", "path:to", "path:to:event"]`.
		Overwrite the implementation to create your custom namespacing rules.
	*/
	eventNamespace(eventString) {
		var events = [],
			str = '',
			ch,
			i;
		for (i = 0; i < eventString.length; i++) {
			if ((ch = eventString.charAt(i)) === ':') {
				events.push(str);
			}
			str += ch;
		}
		events.push(str);
		return events;
	}
}

export default pubsub;
