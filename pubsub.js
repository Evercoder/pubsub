//    pubsub (c) 2013 Dan Burzo
//    pubsub can be freely distributed under the MIT license.
// Made by [@danburzo](https://twitter.com/danburzo).
//
// Fork & contribute at [github.com/danburzo/pubsub](https://github.com/danburzo/pubsub). 
//
// Download [zip](https://github.com/danburzo/pubsub/zipball/master), [tar](https://github.com/danburzo/pubsub/tarball/master). 
//
// The guiding principles were: speed, terseness and progressive disclosure.
//
// ## Annotated API

// Encapsulate the library to protect global scope.
(function() {
  var root = this;

  var pubsub = root.pubsub = function(options) {
    this.options = options;
    this._pubsubEvents = {};
    this._pubsubHappened = {};
  };

  // Current version of the `pubsub`, using [semantic versioning](http://semver.org/).
  pubsub.version = '0.1.0';

  var prototype = {
    // ### pubsub.pub
    // Publish an event.
    //  
    // * **pub(event, [arg1, [arg2 ...]])**
    //  * *event* the event to trigger;
    //  * *arg1 ... argN* (optional) any number of additional params to pass to the event subscribers.
    pub: function(eventString) {
      var eventComponents = this.eventNamespace(eventString);
      var eventArray, i, ilen, j, jlen, args, subscriber, ret, event;
      for (i = 0, ilen = eventComponents.length; i < ilen; i++) {
        eventArray = this._pubsubEvents[event = eventComponents[i]] || [];
        args = Array.prototype.slice.call(arguments, 1);
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
    },

    // ### pubsub.sub
    // Subscribe a function to one or more events.
    //
    //  * **sub(eventString, method, [thisArg, [flags]])**
    //    * *eventString* one or more space-separated events;
    //    * *method* the function to subscribe to the events;
    //    * *thisArg* (optional) context for the method;
    //    * *flags* (optional) boleans to configure the subscribers's behavior:
    //      * *once* if true, the subscriber will self-unsubscribe after the first successful execution. Use *pubsub.once()* for clarity;
    //      * *recoup* if true, the subscriber will execute immediately if the event it subscribes to already happened. Use *pubsub.recoup()* for clarity.
    //
    // *Note:* When subscribing to multiple events, make sure these events are published with the same (or similar) list of arguments.
    sub: function(eventStr, method, thisArg, flags) {
      var events = eventStr.split(/\s+/), event, eventArray, i, len, oldArgs;
      flags = flags || { once: false, recoup: false };
      for (i = 0, len = events.length; i < len; i++) {
        eventArray = this._pubsubEvents[event = events[i]];
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
    },

    // ### pubsub.unsub
    // Unsubscribe a function from one or more events.
    //
    //  * **unsub(eventString, method)**
    //    * *eventString* one or more space-separated events;
    //    * *method* (optional) the function to unsubscribe
    //
    // If no *method* is provided, all attached methods will be unsubscribed from the event(s).
    unsub: function(eventStr, method) {
      var events = eventStr.split(/\s+/), event, eventArray, newEventArray, i, j;
      for (i = 0; i < events.length; i++) {
        eventArray = this._pubsubEvents[event = events[i]] || [];
        newEventArray = [];
        for (j = 0; method && j < eventArray.length; j++) {
          if (eventArray[j][0] !== method) {
            newEventArray.push(eventArray[j]);
          }
        }
        this._pubsubEvents[event] = newEventArray;
      }
      return this;
    },

    // ### pubsub.once
    // Subscribe to an event once. 
    // 
    // The function will be unsubscribed upon successful exectution.
    // To mark the function execution as unsuccessful 
    // (and thus keep it subscribed), make it return `false`.
    //
    //  * **once(eventString, method, thisArg)** identical to *pubsub.sub()*.
    once: function(eventStr, method, thisArg) {
      return this.sub(eventStr, method, thisArg, { once: true });
    },

    // ### pubsub.recoup
    // Subscribe to an event, and execute immediately if that event was ever published before.
    //
    // If executed immediately, the subscriber will get as parameters the last values sent with the event.
    //
    //  * **recoup(eventString, method, thisArg)** identical to *pubsub.sub()*.
    recoup: function(eventStr, method, thisArg) {
      return this.sub(eventStr, method, thisArg, { recoup: true });
    },

    // ### pubsub.eventSplitter
    // The character on which to split the event namespace.
    eventSplitter: ':',

    // ### pubsub.eventNamespace
    // Parses the namespaced event string and returns an array of events to publish.
    // The original implementation does: `"path:to:event" => ["path", "path:to", "path:to:event"]`.
    // Overwrite the implementation to create your custom namespacing rules.
    eventNamespace: function(eventString) {
      var events = [], str = '', ch, i, splitter = this.eventSplitter;
      for (i = 0; i < eventString.length; i++) {
        if ((ch = eventString.charAt(i)) === splitter) {
          events.push(str);
        }
        str += ch;
      }
      events.push(str);
      return events;
    }
  };

  // Mix public methods into `pubsub`'s prototype.
  for (var i in prototype) {
    if (prototype.hasOwnProperty(i)) {
      pubsub.prototype[i] = prototype[i];
    }
  }
})(this);