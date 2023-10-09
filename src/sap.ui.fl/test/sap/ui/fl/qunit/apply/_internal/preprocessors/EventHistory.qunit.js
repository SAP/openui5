/* global QUnit */

sap.ui.define([
	"sap/ui/core/EventBus",
	"sap/ui/fl/apply/_internal/preprocessors/EventHistory",
	"sap/ui/thirdparty/sinon-4"
], function(EventBus, EventHistory, sinon) {
	"use strict";

	var sandbox = sinon.createSandbox();

	QUnit.module("EventHistory", {
		beforeEach() {
			this.oSubscribeStub = sandbox.stub(EventBus.getInstance(), "subscribe");
			this.oUnsubscribeStub = sandbox.stub(EventBus.getInstance(), "unsubscribe");
		},
		afterEach() {
			EventHistory._oHistory = {};
			EventHistory._aUnsubscribedEventIds = [];
			sandbox.restore();
		}
	}, function() {
		QUnit.test("start subscribes to all events in the array and initializes the history object", function(assert) {
			EventHistory.start();

			assert.equal(EventHistory._aEventIds.length, 1);
			assert.ok(this.oSubscribeStub.calledOnce, "subscribe method was called once");

			var sEventId = EventHistory._aEventIds[0];
			var oHistory = EventHistory._oHistory[sEventId];
			assert.equal(oHistory.length, 0);
		});

		QUnit.test("start subscribes to all events in the array and initializes the history object, but skips it if method getHistoryAndStop was already called", function(assert) {
			var sEventId = EventHistory._aEventIds[0];
			var aItems = EventHistory.getHistoryAndStop(sEventId);

			EventHistory.start();

			assert.equal(EventHistory._aEventIds.length, 1);
			assert.equal(this.oSubscribeStub.callCount, 0, "subscribe method was not called");

			assert.equal(aItems.length, 0);
		});

		QUnit.test("saveEvent saves the event in the history object and ignores events that are not registered", function(assert) {
			var sChannelId = "sap.ui";
			var sEventId = EventHistory._aEventIds[0];
			var mParameters1 = {
				param11: "value11",
				param12: "value12",
				getId() {
					return "id1";
				}
			};
			var mParameters2 = {
				param21: "value21",
				param22: "value22",
				getId() {
					return "id2";
				}
			};

			var oExpectedEvent1 = {
				channelId: sChannelId,
				eventId: sEventId,
				parameters: mParameters1.getId()
			};

			var oExpectedEvent2 = {
				channelId: sChannelId,
				eventId: sEventId,
				parameters: mParameters2.getId()
			};

			EventHistory.start();
			EventHistory.saveEvent(sChannelId, sEventId, mParameters1);
			EventHistory.saveEvent(sChannelId, "anotherEventId", mParameters1);
			EventHistory.saveEvent(sChannelId, sEventId, mParameters2);

			[sEventId] = EventHistory._aEventIds;
			var oHistory = EventHistory._oHistory[sEventId];
			assert.equal(oHistory.length, 2);
			assert.deepEqual(oHistory[0], oExpectedEvent1);
			assert.deepEqual(oHistory[1], oExpectedEvent2);
		});

		QUnit.test("getHistoryAndStop unsubscribes for the given eventId and returns all items in the history object that belong to the eventId", function(assert) {
			var sChannelId = "sap.ui";
			var sEventId = EventHistory._aEventIds[0];
			var mParameters1 = {
				param11: "value11",
				param12: "value12",
				getId() {
					return "id1";
				}
			};
			var mParameters2 = {
				param21: "value21",
				param22: "value22",
				getId() {
					return "id2";
				}
			};

			var oExpectedEvent1 = {
				channelId: sChannelId,
				eventId: sEventId,
				parameters: mParameters1.getId()
			};

			var oExpectedEvent2 = {
				channelId: sChannelId,
				eventId: sEventId,
				parameters: mParameters2.getId()
			};

			EventHistory.start();
			EventHistory.saveEvent(sChannelId, sEventId, mParameters1);
			EventHistory.saveEvent(sChannelId, "anotherEventId", mParameters1);
			EventHistory.saveEvent(sChannelId, sEventId, mParameters2);
			var aItems = EventHistory.getHistoryAndStop(sEventId);
			var aItemsAnother = EventHistory.getHistoryAndStop("anotherEventId");

			assert.equal(aItems.length, 2);
			assert.deepEqual(aItems[0], oExpectedEvent1);
			assert.deepEqual(aItems[1], oExpectedEvent2);
			assert.equal(Array.isArray(aItemsAnother), true);
			assert.equal(aItemsAnother.length, 0);
			assert.equal(this.oUnsubscribeStub.callCount, 2);
		});

		QUnit.test("saveEvent saves the event in the history object and ignores duplicates", function(assert) {
			var sChannelId = "sap.ui";
			var sEventId = EventHistory._aEventIds[0];
			var mParameters1 = {
				param11: "value11",
				param12: "value12",
				getId() {
					return "id1";
				}
			};
			var mParameters2 = {
				param21: "value21",
				param22: "value22",
				getId() {
					return "id2";
				}
			};

			var oExpectedEvent1 = {
				channelId: sChannelId,
				eventId: sEventId,
				parameters: mParameters1.getId()
			};

			var oExpectedEvent2 = {
				channelId: sChannelId,
				eventId: sEventId,
				parameters: mParameters2.getId()
			};

			EventHistory.start();
			EventHistory.saveEvent(sChannelId, sEventId, mParameters1);
			EventHistory.saveEvent(sChannelId, sEventId, mParameters1);
			EventHistory.saveEvent(sChannelId, sEventId, mParameters1);
			EventHistory.saveEvent(sChannelId, "anotherEventId", mParameters1);
			EventHistory.saveEvent(sChannelId, "anotherEventId", mParameters1);
			EventHistory.saveEvent(sChannelId, "anotherEventId", mParameters1);
			EventHistory.saveEvent(sChannelId, sEventId, mParameters2);
			EventHistory.saveEvent(sChannelId, sEventId, mParameters2);
			EventHistory.saveEvent(sChannelId, sEventId, mParameters2);

			[sEventId] = EventHistory._aEventIds;
			var oHistory = EventHistory._oHistory[sEventId];
			assert.equal(oHistory.length, 2);
			assert.deepEqual(oHistory[0], oExpectedEvent1);
			assert.deepEqual(oHistory[1], oExpectedEvent2);
		});
	});

	QUnit.done(function() {
		document.getElementById("qunit-fixture").style.display = "none";
	});
});