/*global sinon, QUnit */
sap.ui.define(['sap/ui/performance/trace/Passport'], function(Passport) {
	"use strict";

	QUnit.module("Passport", {
		beforeEach: function() {
			Passport.setActive(true);
		},
		afterEach: function() {
			Passport.setActive(false);
		}
	});

	QUnit.test("header", function(assert) {
		// Following code is a representation of this string:
		// *TH* SAP_E2E_TA_PlugIn SAP_E2E_TA_User                 SAP_E2E_TA_Request SAP_E2E_TA_PlugIn               4635000000311EE0A5D250999C392B68 F5 1 *TH*
		var sHeaderRef = "2A54482A0300E6000058585858585858585858585858585858585858585858585858585" +
		"8585858585800005341505F4532455F54415F557365722020202020202020202020202020202020585858585" +
		"8585858585858585858585858585858585858585858585858585858202020202020202000055858585858585" +
		"8585858585858585858585858585858585858585858585858585858585858585858585858585858585858585" +
		"8585858585858585858585858582020200007XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX0000000000000000000" +
		"000000000000000000000000000E22A54482A";
		var s = "XXXXXXXX";
		var s32 = s + s + s + s;
		var s40 = s + s + s + s + s;
		var sHeader = Passport.header([0,0], s32, s32, s32, s32, s40);

		assert.strictEqual(sHeader, sHeaderRef, "Header generated correctly");
	});

	QUnit.test("traceFlags", function(assert) {
		assert.deepEqual(Passport.traceFlags(), [0,0], "default");
		assert.deepEqual(Passport.traceFlags("low"), [0,0], "low");
		assert.deepEqual(Passport.traceFlags(), [0,0], "low");
		assert.deepEqual(Passport.traceFlags("medium"), [137,10], "medium");
		assert.deepEqual(Passport.traceFlags(), [137,10], "medium");
		assert.deepEqual(Passport.traceFlags("high"), [159,13], "high");
		assert.deepEqual(Passport.traceFlags(), [159,13], "high");
	});

	QUnit.test("createGUID", function(assert) {
		assert.equal(typeof Passport.createGUID(), "string", "Returns a string");
		assert.equal(Passport.createGUID().length, 32, "GUID length is 32 characters");
		assert.notEqual(Passport.createGUID(), Passport.createGUID(), "Return value changes");
	});

	QUnit.test("getRootId", function(assert) {
		assert.equal(typeof Passport.getRootId(), "string", "Returns a string");
		assert.equal(Passport.getRootId().length, 32, "RootID length is 32 characters");
		assert.strictEqual(Passport.getRootId(), Passport.getRootId(), "RootID is stable");
	});

	QUnit.test("getTransactionId", function(assert) {
		var oReq = new XMLHttpRequest();
		oReq.open("GET", "../../../../../resources/ui5loader.js?noCache=" + Date.now(), false);
		var sTransactionId1 = Passport.getTransactionId();

		assert.equal(typeof Passport.getTransactionId(), "string", "Returns a string");
		assert.equal(Passport.getTransactionId().length, 32, "RootID length is 32 characters");
		assert.strictEqual(Passport.getTransactionId(), Passport.getTransactionId(), "RootID is stable");

		oReq = new XMLHttpRequest();
		oReq.open("GET", "../../../../../resources/ui5loader.js?noCache=" + Date.now(), false);
		var sTransactionId2 = Passport.getTransactionId();

		assert.notEqual(sTransactionId1, sTransactionId2, "TransactionID gets updated per request");
	});

	QUnit.test("XHR#setRequestHeader", function(assert) {
		var spy = sinon.spy(window.XMLHttpRequest.prototype, "setRequestHeader");

		var oReq = new XMLHttpRequest();
		oReq.open("GET", "../../../../../resources/ui5loader.js?noCache=" + Date.now(), false);

		assert.ok(spy.calledWith("SAP-PASSPORT"), "Request header should be set");

		spy.restore();
		oReq.abort();
		oReq = null;
	});

});