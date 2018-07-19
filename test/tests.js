let test = require('tape');
let pubsub = require('../dist/pubsub.umd.js');

test('PubSub basic use case', t => {
	t.plan(2);
	var ps = new pubsub();
	ps.sub('topic', function() {
		t.pass('single subscriber');
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
	t.equal(count, 3, 'multiple subscribers');
	t.end();
});

test('PubSub.once()', t => {
	t.plan(7);
	var ps = new pubsub(),
		ran = 0;
	ps.sub('topic', function() {
		t.pass('im a recurring subscriber');
	})
		.once('topic', function() {
			t.pass('im a one-time subscriber');
		})
		.once('topic', function() {
			t.pass('im a two-time subscriber');
			if (++ran < 2) return false;
		})
		.pub('topic')
		.pub('topic')
		.pub('topic')
		.pub('topic');
	t.end();
});

test('PubSub.sub() to multiple events, .once() to multiple events', t => {
	t.plan(9);
	var ps = new pubsub();
	ps.sub('topic1 topic2 topic3', function() {
		t.pass('im a subscriber');
	});
	ps.once('topic1 topic2 topic3', function() {
		t.pass('im a subscriber');
	});
	ps.pub('topic1')
		.pub('topic2')
		.pub('topic3');
	ps.pub('topic1')
		.pub('topic2')
		.pub('topic3');
	t.end();
});

test('PubSub.unsub()', t => {
	t.plan(2);
	var ps = new pubsub();
	var f = function() {
		t.pass('subscriber executed');
	};
	ps.sub('event1 event2', f);
	ps.pub('event1');
	ps.unsub('event2', f);
	ps.pub('event1');
	ps.unsub('event1', f);
	ps.pub('event1');
	t.end();
});

test('PubSub.unsub() with non-subscribed method', t => {
	t.plan(1);
	var ps = new pubsub();
	var f1 = function() {
		t.pass('f1 triggered');
	};
	var f2 = function() {
		/* no-op */
	};
	ps.sub('event', f1)
		.unsub('event', f2)
		.pub('event');
	t.end();
});

test('PubSub.unsub() with no method', t => {
	t.plan(0);
	var ps = new pubsub();
	var f1 = function() {
		t.pass('f1 triggered');
	};
	var f2 = function() {
		t.pass('f1 triggered');
	};
	var f3 = function() {
		t.pass('f1 triggered');
	};
	ps.sub('event', f1)
		.sub('event', f2)
		.sub('event', f3);
	ps.unsub('event');
	t.end();
});

test('PubSub: namespaced events', t => {
	t.plan(2);
	var ps = new pubsub();
	ps.sub('namespace:topic1', function() {
		t.pass('subscriber to topic1 in namespace');
	});
	ps.sub('namespace:topic2', function() {
		t.pass('subscriber to topic2 in namespace');
	});
	ps.sub('namespace', function() {
		t.pass('subscriber to entire namespace');
	});
	ps.sub('namespace2:topic1', function() {
		t.pass('subscriber to topic1 in different namespace');
	});
	ps.pub('namespace:topic1');
	t.end();
});

test('PubSub: nested namespaces', t => {
	t.plan(3);
	var ps = new pubsub();
	ps.sub('parent:child:event', function() {
		t.pass('subscribed to specific event');
	});
	ps.sub('parent:child', function() {
		t.pass('subscribed to sub-namespace');
	});
	ps.sub('parent', function() {
		t.pass('subscribed to entire namespace');
	});
	ps.sub('child:event', function() {
		t.pass('subscribed to invalid namespace portion');
	});
	ps.pub('parent:child:event');
	t.end();
});

test('PubSub.recoup()', t => {
	t.plan(4);
	var ps = new pubsub();
	ps.pub('event1', 1, 2, 3);
	ps.pub('event2', 1, 2, 3);
	ps.recoup('event1', function() {
		t.equal(arguments.length, 3, 'correct args');
	});
	ps.recoup('event1', function() {
		t.equal(arguments.length, 3, 'correct args');
	});
	ps.pub('event1', 3, 4, 5);
	t.end();
});
