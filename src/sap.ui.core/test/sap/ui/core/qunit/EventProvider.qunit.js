/*global QUnit sinon */
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/EventProvider"
], function(Log, EventProvider) {
	"use strict";

	QUnit.test("InitialObject", function(assert) {
		assert.expect(0);
		var oObject = new EventProvider();
		var mEventRegistry = oObject.mEventRegistry;

		for (var key in mEventRegistry) {
			assert.ok(typeof mEventRegistry[key] !== "object", "no data");
		}
	});

	var globalEvents = [];

	function received(event, theReceiver, theReceiverName) {
		var oEventInfo = { listener : theReceiver,  handler : theReceiverName};
		if (!event) {
			oEventInfo.isValid = false;
		} else {
			oEventInfo.isValid = true;
			oEventInfo.id = event.getId();
			oEventInfo.source = event.getSource();
			oEventInfo.params = event.getParameters();
		}
		globalEvents.push(oEventInfo);
	}

	function receivedWithData(event, theReceiver, theReceiverName, additionalData) {
		var oEventInfo = { listener : theReceiver,  handler : theReceiverName};
		if (!event) {
			oEventInfo.isValid = false;
		} else {
			oEventInfo.isValid = true;
			oEventInfo.id = event.getId();
			oEventInfo.source = event.getSource();
			oEventInfo.params = event.getParameters();
			oEventInfo.additionalData = additionalData;
		}
		globalEvents.push(oEventInfo);
	}

	function handler1(event) {
		received(event, this,  'handler1');
	}

	function handler2(event) {
		received(event, this,  'handler2');
	}

	function handler3(event) {
		received(event, this,  'handler3');
	}

	function handler4(event, additionalData) {
		receivedWithData(event, this,  'handler4', additionalData);
	}

	var listenerA = { handler : handler1 };
	var listenerB = { handler : handler2 };
	var listenerC = { handler : handler3 };
	var listenerD = { handler : handler4 };

	function count(oSource, sEventId) {
		if ( !oSource || !oSource.mEventRegistry ) {
			return "no event provider given";
		}
		if ( !oSource.mEventRegistry[sEventId] ) {
			return undefined;
		}
		if ( !oSource.mEventRegistry[sEventId].length ) {
			var c = 0;
			for (var key in oSource.mEventRegistry[sEventId]) { //eslint-disable-line no-unused-vars
				c++;
			}
			return c;
		}

		return oSource.mEventRegistry[sEventId].length;
	}

	function hasNoListeners(oSource, sEventId) {
		if ( !oSource || !oSource.mEventRegistry ) {
			return true;
		}
		if ( !oSource.mEventRegistry[sEventId] ) {
			return true;
		}
		return isEmpty(oSource.mEventRegistry[sEventId]);
	}

	function isEmpty(o) {
		if (!o) {
			return true;
		}
		for (var p in o) {
			if (o[p] != o.constructor.prototype[p]) {
				return false;
			}
		}
		return true;
	}

	QUnit.test("FireEventSingleListener", function(assert) {
		var oObject = new EventProvider();
		// simple registration
		oObject.attachEvent("Fire1", handler1);
		globalEvents = [];
		oObject.fireEvent("Fire1", {name: "testFireEventSingleListener"} );
		assert.strictEqual(globalEvents.length, 1, "number of received events");
		var oEventInfo = globalEvents.pop();
		assert.strictEqual(oEventInfo.id, "Fire1", "id of the received event");
	});

	QUnit.test("ReservedNames", function(assert) {
		var oObject = new EventProvider();
//					assertEquals("number of event registrations for 'constructor'", undefined, count(oObject, "constructor"));
		assert.strictEqual(hasNoListeners(oObject, "constructor"), true, "number of event registrations for 'constructor'");
//					assertEquals("number of event registrations or 'length'", undefined, count(oObject, "length"));
		assert.strictEqual(hasNoListeners(oObject, "length"), true, "number of event registrations or 'length'");
//					assertEquals("number of event registrations or 'prototype'", undefined, count(oObject, "prototype"));
		assert.strictEqual(hasNoListeners(oObject, "prototype"), true, "number of event registrations or 'prototype'");
		globalEvents = [];
		oObject.fireEvent("constructor", {name:"testReservedNames"} );
		oObject.fireEvent("length", {name:"testReservedNames"} );
		oObject.fireEvent("prototype", {name:"testReservedNames"} );
	});

	QUnit.test("FireEventMultipleListeners", function(assert) {
		var oObject = new EventProvider();
		oObject.attachEvent("Fire1", handler3);
		oObject.attachEvent("Fire1", handler1, listenerA);
		oObject.attachEvent("Fire1", handler2);
		globalEvents = [];
		oObject.fireEvent("Fire1", {source:"testFireEventMultipleListeners"} );
		assert.ok(globalEvents.length == 3, "3 events received");
		var mHandlers = { handler1 : false, handler2 : false, handler3 : false };
		var oEventInfo = globalEvents.pop();
		assert.strictEqual(oEventInfo.id, "Fire1", "correct event id");
		mHandlers[oEventInfo.handler] = true;
		oEventInfo = globalEvents.pop();
		assert.strictEqual(oEventInfo.id, "Fire1", "object is the right");
		mHandlers[oEventInfo.handler] = true;
		oEventInfo = globalEvents.pop();
		assert.strictEqual(oEventInfo.id, "Fire1", "object is the right");
		mHandlers[oEventInfo.handler] = true;
		assert.ok(mHandlers['handler1'], "handler1 received info");
		assert.ok(mHandlers['handler1'], "handler2 received info");
		assert.ok(mHandlers['handler1'], "handler3 received info");
	});

	QUnit.test("FireEventDoubleRegistration", function(assert) {
		var oObject = new EventProvider();
		oObject.attachEvent("Fire1", handler1);
		oObject.attachEvent("Fire1", handler1);
		globalEvents = [];
		oObject.fireEvent("Fire1", {name:"Fire1"} );
		assert.strictEqual(globalEvents.length, 2, "2 events received");
		var oEventInfo = globalEvents.pop();
		assert.strictEqual(oEventInfo.id, "Fire1", "object is the right");
		assert.strictEqual(oEventInfo.handler, 'handler1', "handler1 received info");
		oEventInfo = globalEvents.pop();
		assert.strictEqual(oEventInfo.id, "Fire1", "object is the right");
		assert.strictEqual(oEventInfo.handler, 'handler1', "handler1 received info");
	});

	QUnit.test("AttachDetach", function(assert) {
		var oObject = new EventProvider();
		//var mEventRegistry = oObject.mEventRegistry;
		oObject.attachEvent("Fire1", handler1, listenerA);
		oObject.attachEvent("Fire1", handler2, listenerB);
		oObject.attachEvent("Fire1", handler3, listenerC);
		oObject.attachEvent("Fire_2", handler1, listenerA);
		oObject.attachEvent("Fire_2", handler1, listenerB);
		oObject.attachEvent("Fire_2", handler1, listenerC);

		assert.strictEqual(count(oObject, "Fire1"), 3, "registration for Fire1 complete");
		assert.strictEqual(count(oObject, "Fire_2"), 3, "registration for Fire_2 complete");

		oObject.detachEvent("Fire1", handler1, listenerA);
		assert.strictEqual(count(oObject, "Fire1"), 2, "registration removed");
		oObject.detachEvent("Fire1", handler1, listenerA);
		assert.strictEqual(count(oObject, "Fire1"), 2, "no double remove");
		oObject.detachEvent("Fire1", handler2, listenerA);
		assert.strictEqual(count(oObject, "Fire1"), 2, "no detach with wrong combination");
		oObject.detachEvent("Fire" + 1, handler2, listenerB);
		assert.strictEqual(count(oObject, "Fire1"), 1, "2nd registration removed");
		oObject.detachEvent("Fire1", handler3, listenerC);
		assert.strictEqual(count(oObject, "Fire1"), undefined, "last registration removed -> deleted");
		// typeof mEventRegistry["Fire1"] === "undefined");

		oObject.detachEvent("Fire_2", handler1);
		assert.strictEqual(count(oObject, "Fire_2"), 3, "wrong params -> no remove");
		oObject.detachEvent("Fire_2", handler1, listenerA);
		assert.strictEqual(count(oObject, "Fire_2"), 2, "1st remove");
		oObject.detachEvent("Fire_2", handler1, listenerA);
		assert.strictEqual(count(oObject, "Fire_2"), 2, "no remove, already removed");
		oObject.detachEvent("Fire_2", handler1, listenerB);
		assert.strictEqual(count(oObject, "Fire_2"), 1, "2nd remove");
		oObject.attachEvent("Fire_2", handler1);
		assert.strictEqual(count(oObject, "Fire_2"), 2, "attach");
		oObject.detachEvent("Fire_2", handler1);
		assert.strictEqual(count(oObject, "Fire_2"), 1, "remove again");
		oObject.detachEvent("Fire_2", handler1, listenerC);
		assert.strictEqual(count(oObject, "Fire_2"), undefined, "last remove");
		//typeof mEventRegistry["Fire1"] === "undefined");

		oObject.attachEvent("Fire1", handler1, oObject);
		assert.strictEqual(count(oObject, "Fire1"), 1, "attach with oListener");
		oObject.detachEvent("Fire1", handler1);
		assert.strictEqual(count(oObject, "Fire1"), undefined, "detach without oListener");
		oObject.attachEvent("Fire1", handler1);
		assert.strictEqual(count(oObject, "Fire1"), 1, "attach without oListener");
		oObject.detachEvent("Fire1", handler1, oObject);
		assert.strictEqual(count(oObject, "Fire1"), undefined, "detach with oListener");

	});

	QUnit.test("FireEventWithAdditionalData", function(assert) {
		var oObject = new EventProvider();
		oObject.attachEvent("Fire4", {info: "Test data for event-handler function"}, handler4);
		oObject.attachEvent("Fire4", {info: "Test data for event-handler function on listener object"}, handler4, listenerD);
		globalEvents = [];
		oObject.fireEvent("Fire4", {source:"testFireEventWithAdditionalData"} );
		assert.ok(globalEvents.length == 2, "2 events received");
		var oEventInfo = globalEvents.shift();
		assert.strictEqual(oEventInfo.id, "Fire4", "id of the received event");
		assert.strictEqual(oEventInfo.listener, oObject, "listener object should be the EventProvider instance");
		assert.notStrictEqual(oEventInfo.additionalData, null, "additional (static) data should be present");
		assert.notStrictEqual(oEventInfo.additionalData.info, null, "additional (static) data should be present");
		assert.strictEqual(oEventInfo.additionalData.info, "Test data for event-handler function", "additional (static) data should be present");
		oEventInfo = globalEvents.shift();
		assert.strictEqual(oEventInfo.id, "Fire4", "id of the received event");
		assert.strictEqual(oEventInfo.listener, listenerD, "listener object should be the event listener object");
		assert.notStrictEqual(oEventInfo.additionalData, null, "additional (static) data should be present");
		assert.notStrictEqual(oEventInfo.additionalData.info, null, "additional (static) data should be present");
		assert.strictEqual(oEventInfo.additionalData.info, "Test data for event-handler function on listener object", "additional (static) data should be present");

	});

	QUnit.test("PreventDefault", function(assert) {
		var oObject = new EventProvider(),
			bExecDefault;
		oObject.attachEvent("noprevent", function(oEvent) {});
		oObject.attachEvent("prevent", function(oEvent) {
			oEvent.preventDefault();
		});
		bExecDefault = oObject.fireEvent("noprevent", true);
		assert.ok(bExecDefault, "If preventDefault is not called, default is true");
		bExecDefault = oObject.fireEvent("prevent", true);
		assert.ok(!(bExecDefault), "If preventDefault is called, this should return false");
	});

	var oBubble1 = new EventProvider(),
		oBubble2 = new EventProvider(),
		oBubble3 = new EventProvider(),
		cancelHandler = function(event) {
			event.cancelBubble();
		};

	oBubble2.getEventingParent = function() {
		return oBubble1;
	};

	oBubble3.getEventingParent = function() {
		return oBubble2;
	};

	QUnit.test("EventBubbling", function(assert) {
		oBubble1.attachEvent("test", handler1);
		oBubble2.attachEvent("test", handler2);
		oBubble3.attachEvent("test", handler3);

		// basic test
		globalEvents = [];
		oBubble3.fireEvent("test", false, true);
		assert.ok(globalEvents.length == 3, "three events due to bubbling");

		oBubble1.detachEvent("test", handler1);
		oBubble2.detachEvent("test", handler2);
		oBubble3.detachEvent("test", handler3);
	});

	QUnit.test("CancelBubble", function(assert) {
		oBubble1.attachEvent("test", handler1);
		oBubble2.attachEvent("test", handler2);
		oBubble3.attachEvent("test", handler3);

		// last handler cancels
		oBubble1.attachEvent("test", cancelHandler);
		globalEvents = [];
		oBubble3.fireEvent("test", false, true);
		assert.ok(globalEvents.length == 3, "still three events, last handler cancels");
		oBubble1.detachEvent("test", cancelHandler);

		// second handler cancels
		oBubble2.attachEvent("test", cancelHandler);
		globalEvents = [];
		oBubble3.fireEvent("test", false, true);
		assert.ok(globalEvents.length == 2, "only two events, as second handler cancels");
		oBubble1.detachEvent("test", cancelHandler);

		// first handler cancels
		oBubble3.attachEvent("test", cancelHandler);
		globalEvents = [];
		oBubble3.fireEvent("test", false, true);
		assert.ok(globalEvents.length == 1, "one event only, first handler cancels");
		oBubble3.detachEvent("test", cancelHandler);

		oBubble1.detachEvent("test", handler1);
		oBubble2.detachEvent("test", cancelHandler);
		oBubble3.detachEvent("test", handler3);
	});


	QUnit.test("attachEventOnce", function(assert) {
		assert.expect(2);
		var oEventProvider = new EventProvider();
		var iCount = 0;
		var that = this;
		oEventProvider.attachEventOnce("testOnce", function() {
			iCount++;
			// Firing inside handler also should not trigger handler again
			if (iCount === 1) {
				oEventProvider.fireEvent("testOnce");
			}
			assert.equal(that, this, "Right scope");
		}, this);
		oEventProvider.fireEvent("testOnce");
		oEventProvider.fireEvent("testOnce");
		assert.equal(iCount, 1, "Handler is only called once");
	});

	QUnit.test("attachEventOnce, detach before fire", function(assert) {
		assert.expect(1);
		var oEventProvider = new EventProvider();
		var iCount = 0;
		var handler = function() {
			iCount++;
			assert.ok(false, "Should not be called");
		};
		oEventProvider.attachEventOnce("testOnce", handler, this);
		oEventProvider.detachEvent("testOnce", handler, this);
		oEventProvider.fireEvent("testOnce");
		oEventProvider.fireEvent("testOnce");
		assert.equal(iCount, 0, "Handler is never called");
	});

	QUnit.test("EventHandlerChange", function(assert) {
		assert.expect(13);
		var oEventProvider = new EventProvider();
		var oListener = {};
		var fnFunction = function(){};
		var oData = {test: true};
		var iCount = 0;
		oEventProvider.attachEvent("EventHandlerChange", function(oEvent) {
			iCount++;
			if (iCount === 1) {
				assert.strictEqual(oEvent.getParameter("EventId"), "EventHandlerChange", "Event ID is provided correctly");
				assert.strictEqual(oEvent.getParameter("type"), "listenerAttached", "Type is provided correctly");
			}
			if (iCount > 1) {
				assert.strictEqual(oEvent.getParameter("EventId"), "test", "Event ID is provided correctly");
				assert.strictEqual(oEvent.getParameter("listener"), oListener, "Listener is provided correctly");
				assert.strictEqual(oEvent.getParameter("func"), fnFunction, "Function is provided correctly");
				assert.strictEqual(oEvent.getParameter("data"), oData, "Data is provided correctly");
			}
			if (iCount === 2) {
				assert.strictEqual(oEvent.getParameter("type"), "listenerAttached", "Type is provided correctly");
			}
			if (iCount === 3) {
				assert.strictEqual(oEvent.getParameter("type"), "listenerDetached", "Type is provided correctly");
			}

		});
		oEventProvider.attachEvent("test", oData, fnFunction, oListener);
		oEventProvider.detachEvent("test", fnFunction, oListener);
		assert.equal(iCount, 3, "Handler is called three times");
	});

	QUnit.test("FireEvent with Async Listener", async (assert) => {
		const oEventProvider = new EventProvider();
		const aPromises = [];

		const myPromiseFunction = () => {
			const oPromise = Promise.reject(new Error("Function failed."));
			aPromises.push(oPromise);
			return oPromise;
		};
		const myAsyncFunction = async () => {
			const oPromise = Promise.reject(new Error("Async function failed."));
			aPromises.push(oPromise);
			await oPromise;
		};

		const myLogSpy = sinon.spy(Log, "error");
		oEventProvider.attachEvent("MyEvent1", myPromiseFunction);
		oEventProvider.attachEvent("MyEvent2", myAsyncFunction);
		oEventProvider.fireEvent("MyEvent1");
		oEventProvider.fireEvent("MyEvent2");

		await Promise.allSettled(aPromises).then(() => {
			assert.equal(myLogSpy.callCount, 2, "Error log should be displayed");
			assert.ok(myLogSpy.getCall(0).calledWith("EventProvider.fireEvent: Event Listener for event 'MyEvent1' failed during execution."), "Correct Error Log displayed.");
			assert.ok(myLogSpy.getCall(1).calledWith("EventProvider.fireEvent: Event Listener for event 'MyEvent2' failed during execution."), "Correct Error Log displayed.");
		});
	});
});
