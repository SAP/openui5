/*global QUnit */
sap.ui.define([
	"sap/ui/base/EventProvider"
], function(EventProvider) {
	"use strict";

	var oBus = sap.ui.getCore().getEventBus();

	function checkNumberOfListeners(assert, oEventProvider, sEventId, iExpected) {
		if (oEventProvider) {
			var aRegisteredListeners = EventProvider.getEventList(oEventProvider)[sEventId];
			if (aRegisteredListeners && Array.isArray(aRegisteredListeners)){
				assert.equal(aRegisteredListeners.length, iExpected, iExpected + " listener(s) subscribed for event " + sEventId);
			} else {
				assert.ok(!oEventProvider.hasListeners(sEventId) && iExpected == 0, "0 listener(s) subscribed for event " + sEventId);
			}
		} else {
			assert.ok(iExpected == 0, "0 listener(s) subscribed for event " + sEventId);
		}
	}

	function checkHandler(assert, bWithListener, sChannelId, sEventId, oData, oThis, sExpectedChannel, sExpectedEventId, sExpectedData, oListener){
		assert.equal(sChannelId, sExpectedChannel, "Expected Channel");
		assert.equal(sEventId, sExpectedEventId, "Expected Event");
		assert.ok(oThis === (bWithListener ? oListener : oBus), "'this' is set as expected - " + (bWithListener ? "Listener" : "EventBus"));
		assert.ok(!!oData, "Data object provided");
		if (sExpectedData) {
			assert.equal(oData.data, sExpectedData, "Expected Data");
		}
	}

	// Test functions

	QUnit.module("Basics");

	QUnit.test("EventBus initialized", function(assert) {
		assert.ok(!!oBus, "Event Bus initialized");
	});

	QUnit.module("(Un-)subscribe");

	QUnit.test("Default channel", function(assert) {
		assert.expect(5);
		var sEventId = "Test1";
		checkNumberOfListeners(assert, oBus._defaultChannel, sEventId, 0);
		var fnHandler1 = function(){};
		oBus.subscribe(sEventId, fnHandler1);
		checkNumberOfListeners(assert, oBus._defaultChannel, sEventId, 1);
		var fnHandler2 = function(){};
		var oObj2 = {};
		oBus.subscribe(sEventId, fnHandler2, oObj2);
		checkNumberOfListeners(assert, oBus._defaultChannel, sEventId, 2);
		oBus.unsubscribe(sEventId, fnHandler1);
		checkNumberOfListeners(assert, oBus._defaultChannel, sEventId, 1);
		oBus.unsubscribe(sEventId, fnHandler2, oObj2);
		checkNumberOfListeners(assert, oBus._defaultChannel, sEventId, 0);
	});

	QUnit.test("Custom channel", function(assert) {
		assert.expect(6);
		var sEventId = "Test2";
		var sChannelId = "TestChannel2";
		checkNumberOfListeners(assert, oBus._mChannels[sChannelId], sEventId, 0);
		var fnHandler1 = function(){};
		oBus.subscribe(sChannelId, sEventId, fnHandler1);
		checkNumberOfListeners(assert, oBus._mChannels[sChannelId], sEventId, 1);
		var fnHandler2 = function(){};
		var oObj2 = {};
		oBus.subscribe(sChannelId, sEventId, fnHandler2, oObj2);
		checkNumberOfListeners(assert, oBus._mChannels[sChannelId], sEventId, 2);
		oBus.unsubscribe(sChannelId, sEventId, fnHandler1);
		checkNumberOfListeners(assert, oBus._mChannels[sChannelId], sEventId, 1);
		oBus.unsubscribe(sChannelId, sEventId, fnHandler2, oObj2);
		checkNumberOfListeners(assert, oBus._mChannels[sChannelId], sEventId, 0);
		assert.ok(!oBus._mChannels[sChannelId], "Unused Channel is cleaned up.");
	});

	QUnit.module("SubscribeOnce");

	QUnit.test("Default channel", function(assert){
		assert.expect(12);
		var sEventId = "Test3";
		checkNumberOfListeners(assert, oBus._defaultChannel, sEventId, 0);

		// two listener subscribeOnce to the same event:
		var fnHandler1 = function(sChannel, sEvent, oData){
			checkHandler(assert, false, sChannel, sEvent, oData, this, null, sEventId, null);
		};
		oBus.subscribeOnce(sEventId, fnHandler1);
		checkNumberOfListeners(assert, oBus._defaultChannel, sEventId, 1);

		var oObj2 = {};
		var fnHandler2 = function(sChannel, sEvent, oData){
			checkHandler(assert, true, sChannel, sEvent, oData, this, null, sEventId, null, oObj2);
		};
		oBus.subscribeOnce(sEventId, fnHandler2, oObj2);
		checkNumberOfListeners(assert, oBus._defaultChannel, sEventId, 2);

		oBus.publish(sEventId);

		// after publish they should not be registered anymore
		checkNumberOfListeners(assert, oBus._defaultChannel, sEventId, 0);
	});

	QUnit.test("Custom channel", function(assert){
		assert.expect(12);
		var sEventId = "Test4";
		var sChannelId = "TestChannel4";

		checkNumberOfListeners(assert, oBus._mChannels[sChannelId], sEventId, 0);

		// two listener subscribeOnce to the same event:
		var fnHandler1 = function(sChannel, sEvent, oData){
			checkHandler(assert, false, sChannel, sEvent, oData, this, sChannelId, sEventId, null);
		};
		oBus.subscribeOnce(sChannelId, sEventId, fnHandler1);
		checkNumberOfListeners(assert, oBus._mChannels[sChannelId], sEventId, 1);

		var oObj2 = {};
		var fnHandler2 = function(sChannel, sEvent, oData){
			checkHandler(assert, true, sChannel, sEvent, oData, this, sChannelId, sEventId, null, oObj2);
		};
		oBus.subscribeOnce(sChannelId, sEventId, fnHandler2, oObj2);
		checkNumberOfListeners(assert, oBus._mChannels[sChannelId], sEventId, 2);

		oBus.publish(sChannelId, sEventId);

		// after publish they should not be registered anymore
		checkNumberOfListeners(assert, oBus._mChannels[sChannelId], sEventId, 0);
	});


	QUnit.module("Publish", {
		beforeEach : function(assert) {
			var that = this;
			this.oObj11 = {id: "Obj11"};
			this.oObj13 = {id: "Obj13"};

			this.fnHandler11 = function(sChannelId, sEventId, oData){
				checkHandler(assert, true, sChannelId, sEventId, oData, this, null, "Test11", "data11", that.oObj11);
			};
			this.fnHandler12 = function(sChannelId, sEventId, oData){
				checkHandler(assert, false, sChannelId, sEventId, oData, this, null, "Test12", "data12", null);
			};
			this.fnHandler13 = function(sChannelId, sEventId, oData){
				checkHandler(assert, true, sChannelId, sEventId, oData, this, null, "Test13", null, that.oObj13);
			};
			this.fnHandler14 = function(sChannelId, sEventId, oData){
				checkHandler(assert, false, sChannelId, sEventId, oData, this, null, "Test14", null, null);
			};

			this.oObj21 = {id: "Obj21"};
			this.oObj23 = {id: "Obj23"};

			this.fnHandler21 = function(sChannelId, sEventId, oData){
				checkHandler(assert, true, sChannelId, sEventId, oData, this, "CustomChannel", "Test21", "data21", that.oObj21);
			};
			this.fnHandler22 = function(sChannelId, sEventId, oData){
				checkHandler(assert, false, sChannelId, sEventId, oData, this, "CustomChannel", "Test22", "data22", null);
			};
			this.fnHandler23 = function(sChannelId, sEventId, oData){
				checkHandler(assert, true, sChannelId, sEventId, oData, this, "CustomChannel", "Test23", null, that.oObj23);
			};
			this.fnHandler24 = function(sChannelId, sEventId, oData){
				checkHandler(assert, false, sChannelId, sEventId, oData, this, "CustomChannel", "Test24", null, null);
			};

			oBus.subscribe("Test11", this.fnHandler11, this.oObj11);
			oBus.subscribe("Test12", this.fnHandler12);
			oBus.subscribe("Test13", this.fnHandler13, this.oObj13);
			oBus.subscribe("Test14", this.fnHandler14);
			oBus.subscribe("CustomChannel", "Test21", this.fnHandler21, this.oObj21);
			oBus.subscribe("CustomChannel", "Test22", this.fnHandler22);
			oBus.subscribe("CustomChannel", "Test23", this.fnHandler23, this.oObj23);
			oBus.subscribe("CustomChannel", "Test24", this.fnHandler24);
		},
		afterEach : function(){
			oBus.unsubscribe("Test11", this.fnHandler11, this.oObj11);
			oBus.unsubscribe("Test12", this.fnHandler12);
			oBus.unsubscribe("Test13", this.fnHandler13, this.oObj13);
			oBus.unsubscribe("Test14", this.fnHandler14);
			oBus.unsubscribe("CustomChannel", "Test21", this.fnHandler21, this.oObj21);
			oBus.unsubscribe("CustomChannel", "Test22", this.fnHandler22);
			oBus.unsubscribe("CustomChannel", "Test23", this.fnHandler23, this.oObj23);
			oBus.unsubscribe("CustomChannel", "Test24", this.fnHandler24);
		}
	});

	QUnit.test("Default Channel, with Listener, with Data", function(assert) {
		assert.expect(5);
		oBus.publish("Test11", {data: "data11"});
	});

	QUnit.test("Default Channel, no Listener, with Data", function(assert) {
		assert.expect(5);
		oBus.publish("Test12", {data: "data12"});
	});

	QUnit.test("Default Channel, with Listener, no Data", function(assert) {
		assert.expect(4);
		oBus.publish("Test13");
	});

	QUnit.test("Default Channel, no Listener, no Data", function(assert) {
		assert.expect(4);
		oBus.publish("Test14");
	});

	QUnit.test("Custom Channel, with Listener, with Data", function(assert) {
		assert.expect(5);
		oBus.publish("CustomChannel", "Test21", {data: "data21"});
	});

	QUnit.test("Custom Channel, no Listener, with Data", function(assert) {
		assert.expect(5);
		oBus.publish("CustomChannel", "Test22", {data: "data22"});
	});

	QUnit.test("Custom Channel, with Listener, no Data", function(assert) {
		assert.expect(4);
		oBus.publish("CustomChannel", "Test23");
	});

	QUnit.test("Custom Channel, no Listener, no Data", function(assert) {
		assert.expect(4);
		oBus.publish("CustomChannel", "Test24");
	});

});
