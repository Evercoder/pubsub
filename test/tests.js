module('pubsub');

test('PubSub basic use case', function() {
	expect(2);
	var ps = new pubsub();
	ps.sub('topic', function() {
		ok('here!', 'single subscriber');
	});
	ps.pub('topic');
	var count = 0;
	ps.sub('topic2', function() {
		count++;
	});
	ps.sub('topic2', function() {
		count++;
	});
	ps.sub('topic2', function() {
		count++;
	});
	ps.sub('topic3', function() {
		count++;
	});
	ps.pub('topic2');
	strictEqual(count, 3, 'multiple subscribers');
});

test('PubSub.once()', function() {
	expect(7);
	var ps = new pubsub(),
		ran = 0;
	ps.sub('topic', function() {
		ok('here!', 'im a recurring subscriber');
	})
		.once('topic', function() {
			ok('here!', 'im a one-time subscriber');
		})
		.once('topic', function() {
			ok('here!', 'im a two-time subscriber');
			if (++ran < 2) return false;
		})
		.pub('topic')
		.pub('topic')
		.pub('topic')
		.pub('topic');
});

test('PubSub.sub() to multiple events, .once() to multiple events', function() {
	expect(9);
	var ps = new pubsub();
	ps.sub('topic1 topic2 topic3', function() {
		ok('here!', 'im a subscriber');
	});
	ps.once('topic1 topic2 topic3', function() {
		ok('here!', 'im a subscriber');
	});
	ps.pub('topic1')
		.pub('topic2')
		.pub('topic3');
	ps.pub('topic1')
		.pub('topic2')
		.pub('topic3');
});

test('PubSub.unsub()', function() {
	expect(2);
	var ps = new pubsub();
	var f = function() {
		ok('here!', 'subscriber executed');
	};
	ps.sub('event1 event2', f);
	ps.pub('event1');
	ps.unsub('event2', f);
	ps.pub('event1');
	ps.unsub('event1', f);
	ps.pub('event1');
});

test('PubSub.unsub() with non-subscribed method', function() {
	expect(1);
	var ps = new pubsub();
	var f1 = function() {
		ok('yay!', 'f1 triggered');
	};
	var f2 = function() {
		/* no-op */
	};
	ps.sub('event', f1)
		.unsub('event', f2)
		.pub('event');
});

test('PubSub.unsub() with no method', function() {
	expect(0);
	var ps = new pubsub();
	var f1 = function() {
		ok('you should not see this', 'f1 triggered');
	};
	var f2 = function() {
		ok('you should not see this', 'f1 triggered');
	};
	var f3 = function() {
		ok('you should not see this', 'f1 triggered');
	};
	ps.sub('event', f1)
		.sub('event', f2)
		.sub('event', f3);
	ps.unsub('event');
});

test('PubSub: namespaced events', function() {
	expect(2);
	var ps = new pubsub();
	ps.sub('namespace:topic1', function() {
		ok('here!', 'subscriber to topic1 in namespace');
	});
	ps.sub('namespace:topic2', function() {
		ok('here!', 'subscriber to topic2 in namespace');
	});
	ps.sub('namespace', function() {
		ok('here!', 'subscriber to entire namespace');
	});
	ps.sub('namespace2:topic1', function() {
		ok('here!', 'subscriber to topic1 in different namespace');
	});
	ps.pub('namespace:topic1');
});

test('PubSub: nested namespaces', function() {
	expect(3);
	var ps = new pubsub();
	ps.sub('parent:child:event', function() {
		ok('here!', 'subscribed to specific event');
	});
	ps.sub('parent:child', function() {
		ok('here!', 'subscribed to sub-namespace');
	});
	ps.sub('parent', function() {
		ok('here!', 'subscribed to entire namespace');
	});
	ps.sub('child:event', function() {
		ok('here!', 'subscribed to invalid namespace portion');
	});
	ps.pub('parent:child:event');
});

test('PubSub.recoup()', function() {
	expect(4);
	var ps = new pubsub();
	ps.pub('event1', 1, 2, 3);
	ps.pub('event2', 1, 2, 3);
	ps.recoup('event1', function() {
		strictEqual(arguments.length, 3, 'correct args');
	});
	ps.recoup('event1', function() {
		strictEqual(arguments.length, 3, 'correct args');
	});
	ps.pub('event1', 3, 4, 5);
});
