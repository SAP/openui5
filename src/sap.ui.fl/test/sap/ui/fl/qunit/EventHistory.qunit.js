/*global QUnit, sinon*/
jQuery.sap.require("sap.ui.fl.EventHistory");

(function(QUnit, sinon, EventHistory) {
	"use strict";
	//sinon.config.useFakeTimers = false;
	var oSubscribeStub;
	var oUnsubscribeStub;

	QUnit.module("sap.ui.fl.EventHistory", {
		beforeEach: function() {
			oSubscribeStub = sinon.stub(sap.ui.getCore().getEventBus(), "subscribe");
			oUnsubscribeStub = sinon.stub(sap.ui.getCore().getEventBus(), "unsubscribe");
		},
		afterEach: function() {
			sap.ui.getCore().getEventBus().subscribe.restore();
			sap.ui.getCore().getEventBus().unsubscribe.restore();
			EventHistory._oHistory = {};
			EventHistory._aUnsubscribedEventIds = [];
		}
	});

	QUnit.test("start subscribes to all events in the array and initializes the history object", function(assert) {
		EventHistory.start();

		assert.equal(EventHistory._aEventIds.length, 1);
		assert.ok(oSubscribeStub.calledOnce, "subscribe method was called once");

		var sEventId = EventHistory._aEventIds[0];
		var oHistory = EventHistory._oHistory[sEventId];
		assert.equal(oHistory.length, 0);
	});

	QUnit.test("start subscribes to all events in the array and initializes the history object, but skips it if method getHistoryAndStop was already called", function(assert) {
		var sEventId = EventHistory._aEventIds[0];
		var aItems = EventHistory.getHistoryAndStop(sEventId);

		EventHistory.start();

		assert.equal(EventHistory._aEventIds.length, 1);
		assert.equal(oSubscribeStub.callCount, 0, "subscribe method was not called");

		var oHistory = EventHistory._oHistory[sEventId];
		assert.equal(oHistory, undefined);
		assert.equal(Array.isArray(aItems), true);
		assert.equal(aItems.length, 0);
	});

	QUnit.test("saveEvent saves the event in the history object and ignores events that are not registered", function(assert) {
		var sChannelId = "sap.ui";
		var sEventId = EventHistory._aEventIds[0];
		var mParameters1 = {
			"param11": "value11",
			"param12": "value12"
		};
		var mParameters2 = {
			"param21": "value21",
			"param22": "value22"
		};

		var oExpectedEvent1 = {
			"channelId": sChannelId,
			"eventId": sEventId,
			"parameters": mParameters1
		};

		var oExpectedEvent2 = {
			"channelId": sChannelId,
			"eventId": sEventId,
			"parameters": mParameters2
		};

		EventHistory.start();
		EventHistory.saveEvent(sChannelId, sEventId, mParameters1);
		EventHistory.saveEvent(sChannelId, "anotherEventId", mParameters1);
		EventHistory.saveEvent(sChannelId, sEventId, mParameters2);

		var sEventId = EventHistory._aEventIds[0];
		var oHistory = EventHistory._oHistory[sEventId];
		assert.equal(oHistory.length, 2);
		assert.deepEqual(oHistory[0], oExpectedEvent1);
		assert.deepEqual(oHistory[1], oExpectedEvent2);
	});

	QUnit.test("getHistoryAndStop unsubscribes for the given eventId and returns all items in the history object that belong to the eventId", function(assert) {
		var sChannelId = "sap.ui";
		var sEventId = EventHistory._aEventIds[0];
		var mParameters1 = {
			"param11": "value11",
			"param12": "value12"
		};
		var mParameters2 = {
			"param21": "value21",
			"param22": "value22"
		};

		var oExpectedEvent1 = {
			"channelId": sChannelId,
			"eventId": sEventId,
			"parameters": mParameters1
		};

		var oExpectedEvent2 = {
			"channelId": sChannelId,
			"eventId": sEventId,
			"parameters": mParameters2
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
		assert.equal(oUnsubscribeStub.callCount, 2);
	});
}(QUnit, sinon, sap.ui.fl.EventHistory));