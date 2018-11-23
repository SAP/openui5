/*global QUnit*/
sap.ui.define([
	"sap/ui/model/TreeBindingUtils"
], function(
	TreeBindingUtils
) {
	"use strict";

	QUnit.module("TreeBindingUtils _determineRequestDelta");

	/* Beware:
		Always use skip values significantly greater than the top values!
		Otherwise you face a risk of expected top values matching the result by coincidence. For example if the fut does "oNewRequest.iTop = oPendingRequest.iSkip;" or alike
	*/
	QUnit.test("Expand to the left", function(assert) {
		var oNewRequest = {
			iSkip: 100,
			iTop: 10
		};

		var oPendingRequest = {
			iSkip: 105,
			iTop: 15
		};

		var bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, undefined, "Request shall not be ignored");
		assert.equal(oNewRequest.iSkip, 100, "Skip still at 100");
		assert.equal(oNewRequest.iTop, 5, "Top reduced to 5 (from 10)");
	});

	QUnit.test("Expand to the left - edge case", function(assert) {
		var oNewRequest = {
			iSkip: 100,
			iTop: 10
		};

		var oPendingRequest = {
			iSkip: 110,
			iTop: 5
		};

		var bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, undefined, "Request shall not be ignored");
		assert.equal(oNewRequest.iSkip, 100, "Skip still at 100");
		assert.equal(oNewRequest.iTop, 10, "Top still at 10");
	});

	QUnit.test("Expand to the right", function(assert) {
		var oNewRequest = {
			iSkip: 105,
			iTop: 15
		};

		var oPendingRequest = {
			iSkip: 100,
			iTop: 10
		};

		var bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, undefined, "Request shall not be ignored");
		assert.equal(oNewRequest.iSkip, 110, "Skip increased to 110 (from 105)");
		assert.equal(oNewRequest.iTop, 10, "Top reduced to 10 (from 15)");
	});

	QUnit.test("Expand to the right II", function(assert) {
		var oNewRequest = {
			iSkip: 110,
			iTop: 61
		};

		var bReturnVal, oPendingRequest;

		oPendingRequest = {
			iSkip: 110,
			iTop: 50
		};
		bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, undefined, "Request shall not be ignored");
		assert.equal(oNewRequest.iSkip, 160, "Skip increased to 160 (from 110)");
		assert.equal(oNewRequest.iTop, 11, "Top reduced to 11 (from 61)");

		oPendingRequest = {
			iSkip: 110,
			iTop: 55
		};
		bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, undefined, "Request shall not be ignored");
		assert.equal(oNewRequest.iSkip, 165, "Skip increased to 165 (from 160)");
		assert.equal(oNewRequest.iTop, 6, "Top reduced to 6 (from 11)");
	});

	QUnit.test("Expand to the right - edge case", function(assert) {
		var oNewRequest = {
			iSkip: 110,
			iTop: 5
		};

		var oPendingRequest = {
			iSkip: 100,
			iTop: 10
		};

		var bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, undefined, "Request shall not be ignored");
		assert.equal(oNewRequest.iSkip, 110, "Skip still at 110");
		assert.equal(oNewRequest.iTop, 5, "Top still at 5");
	});

	QUnit.test("Full overlap (cancel old)", function(assert) {
		assert.expect(4);
		var oNewRequest = {
			iSkip: 110,
			iTop: 20
		};

		var oPendingRequest = {
			iSkip: 112,
			iTop: 6,
			oRequestHandle: {
				abort: function() {
					assert.ok("Pending request got aborted");
				}
			}
		};

		var bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, undefined, "Request shall not be ignored");
		assert.equal(oNewRequest.iSkip, 110, "Skip still at 110");
		assert.equal(oNewRequest.iTop, 20, "Top still at 20");
	});

	QUnit.test("Full overlap (ignore new)", function(assert) {
		var oNewRequest = {
			iSkip: 112,
			iTop: 6
		};

		var oPendingRequest = {
			iSkip: 110,
			iTop: 20
		};

		var bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, false, "New request should be ignored");
		assert.equal(oNewRequest.iSkip, 112, "Skip still at 112");
		assert.equal(oNewRequest.iTop, 6, "Top still at 6");
	});

	QUnit.test("Full overlap (edge case)", function(assert) {
		var oNewRequest = {
			iSkip: 110,
			iTop: 20
		};

		var oPendingRequest = {
			iSkip: 110,
			iTop: 20
		};

		var bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, false, "New request should be ignored");
		assert.equal(oNewRequest.iSkip, 110, "Skip still at 110");
		assert.equal(oNewRequest.iTop, 20, "Top still at 20");
	});

	QUnit.test("No overlap", function(assert) {
		var oNewRequest = {
			iSkip: 105,
			iTop: 5
		};

		var oPendingRequest = {
			iSkip: 110,
			iTop: 5
		};

		var bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, undefined, "Request shall not be ignored");
		assert.equal(oNewRequest.iSkip, 105, "Skip still at 105");
		assert.equal(oNewRequest.iTop, 5, "Top still at 5");
	});

	QUnit.test("Expand to the left (with threshold)", function(assert) {
		var oNewRequest = {
			iSkip: 100,
			iTop: 10,
			iThreshold: 20
		};

		var oPendingRequest = {
			iSkip: 105,
			iTop: 15
		};

		var bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, undefined, "Request shall not be ignored");
		assert.equal(oNewRequest.iSkip, 80, "Skip decreased to 80 (from 100) due to threshold (100-20)");
		assert.equal(oNewRequest.iTop, 25, "Top increased to 25 due to threshold (5+20) after being reduced to 5 (from 10)");
	});

	QUnit.test("Expand to the right (with threshold)", function(assert) {
		var oNewRequest = {
			iSkip: 105,
			iTop: 15,
			iThreshold: 20
		};

		var oPendingRequest = {
			iSkip: 100,
			iTop: 10
		};

		var bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, undefined, "Request shall not be ignored");
		assert.equal(oNewRequest.iSkip, 110, "Skip increased to 110 (from 105)");
		assert.equal(oNewRequest.iTop, 30, "Top increased to 30 due to threshold (10+20) after being reduced to 10 (from 15)");
	});

	QUnit.test("Expand to the left (with threshold, edge-case: 0)", function(assert) {
		assert.expect(4);
		var oNewRequest = {
			iSkip: 0,
			iTop: 113,
			iThreshold: 100
		};

		var oPendingRequest = {
			iSkip: 3,
			iTop: 113,
			iThreshold: 100,
			oRequestHandle: {
				abort: function() {
					// should not be called
					assert.ok("Pending request got aborted");
				}
			}
		};

		var bReturnVal = TreeBindingUtils._determineRequestDelta(oNewRequest, oPendingRequest);

		assert.equal(bReturnVal, undefined, "Request shall not be ignored");
		assert.equal(oNewRequest.iSkip, 0, "Skip is still at 0");
		assert.equal(oNewRequest.iTop, 103, "Top should be 3 now");
		assert.equal(oNewRequest.iThreshold, 0, "Threshold should be 0");
	});

});