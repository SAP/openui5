/*global QUnit, sinon */
sap.ui.define(["sap/base/util/now"], function(now) {
	"use strict";

	QUnit.module("Time now", {
		beforeEach: function() {
			this.sandbox = sinon.sandbox.create();
		},
		afterEach: function() {
			this.sandbox.restore();
		}
	});

	QUnit.test("tests for window performance object", function(assert) {
		assert.ok(performance && performance.now && performance.timeOrigin, "check for presence of performance");
		assert.ok(new Date(now()) instanceof Date, "should be a valid date");
	});

	QUnit.test("tests for date comparison", function(assert) {
		var iDateNow = Date.now(),
			vTimestamp = now();

		assert.expect(2);
		assert.equal(typeof vTimestamp, "number", "timestamp from now() should be a number");
		var iTimeDifference = Math.abs(vTimestamp - iDateNow);
		assert.ok(iTimeDifference < 200, "time difference of 200ms should not be exceeded. But was " + iTimeDifference);
	});

});