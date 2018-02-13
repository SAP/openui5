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

	QUnit.test("simulate environment without window.performance", function(assert) {

		assert.ok(window.performance && performance.now && performance.timing, "check for presence of window.performance");

		var bCanStub = false;
		try {
			this.sandbox.stub(window, "performance", false);
			bCanStub = true;
		} catch (e) {/*ignore if window performance cannot be stubbed*/
		}
		if (bCanStub) {
			sap.ui._ui5loader.unloadResources("sap/base/util/now.js", false, true, true);
			var done = assert.async();
			sap.ui.require(["sap/base/util/now"], function(now) {

				assert.notOk(performance.timing, "performance now should not be set");

				assert.ok(new Date(now()) instanceof Date, "should be a valid date");
				done();
			});
		}
	});

	QUnit.test("tests for window performance object", function(assert) {


		assert.ok(window.performance && performance.now && performance.timing, "check for presence of window.performance");

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
