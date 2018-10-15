/*global QUnit, window */

sap.ui.define([
	"sap/ui/unified/calendar/MonthPicker"
], function(MonthPicker) {
	"use strict";
	(function () {

		QUnit.module("Corner cases", {
			beforeEach: function () {
				this.oMP = new MonthPicker();
				this.oMP.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			afterEach: function () {
				this.oMP.destroy();
				this.oMP = null;
			}
		});

		QUnit.test("onThemeChanged is called before the control is rendered", function (oAssert) {
			var bThrown = false;
			try {
				this.oMP.onThemeChanged();
			} catch (oError) {
				bThrown = true;
			}
			oAssert.ok(!bThrown, "No error should be thrown");
		});

		QUnit.test("_isValueInThreshold return true if provided value is in provided threshold", function (assert) {
			assert.ok(this.oMP._isValueInThreshold(248, 258, 10), "value is between 238 and 258 - upper boundary"); // (reference value, actual value, threshold)
			assert.ok(this.oMP._isValueInThreshold(248, 238, 10), "value is between 238 and 258 - lower boundary"); // (reference value, actual value, threshold)
			assert.ok(this.oMP._isValueInThreshold(248, 240, 10), "value is between 238 and 258"); // (reference value, actual value, threshold)
			assert.ok(this.oMP._isValueInThreshold(248, 250, 10), "value is between 238 and 258"); // (reference value, actual value, threshold)
		});

		QUnit.test("_isValueInThreshold return false if provided value is out of provided threshold", function (assert) {
			assert.equal(this.oMP._isValueInThreshold(248, 237, 10), false, "value is lower"); // (reference value, actual value, threshold)
			assert.equal(this.oMP._isValueInThreshold(248, 259, 10), false, "value is upper"); // (reference value, actual value, threshold)
		});

		QUnit.test("Months are properly selected on touch devices mouseup", function (assert) {
			var iSelectedMonth = 3,
				oMousePosition = { clientX: 10, clientY: 10 },
				deviceStub = this.stub(sap.ui.Device.support, "touch", true),
				isValueInThresholdStub = this.stub(this.oMP, "_isValueInThreshold", function () { return true; }),
				itemNavigationStub = this.stub(this.oMP._oItemNavigation, "getFocusedIndex", function () { return iSelectedMonth; }),
				selectSpy = this.spy(function () {});

			this.oMP.attachSelect(selectSpy);

			assert.equal(this.oMP.getMonth(), 0, "0 month is initially selected");

			this.oMP._oMousedownPosition = oMousePosition;
			this.oMP.onmouseup(oMousePosition);

			assert.equal(this.oMP.getMonth(), iSelectedMonth, "3 month is selected on mouseup");
			assert.equal(selectSpy.callCount, 1, "select event is fired once");

			deviceStub.restore();
			isValueInThresholdStub.restore();
			itemNavigationStub.restore();
		});

	})();
});