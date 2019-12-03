/*global QUnit, window */

sap.ui.define([
	"sap/ui/unified/calendar/YearPicker"
], function(YearPicker) {
	"use strict";

	(function () {

		QUnit.module("API ", {
			beforeEach: function () {
				this.oYP = new YearPicker();
				this.oYP.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			afterEach: function () {
				this.oYP.destroy();
				this.oYP = null;
			}
		});

		QUnit.test("getFirstRenderedDate returns date in local timezone", function (assert) {
			// The test works for all environments whose timezone is different than GMT
			// Act
			var oFirstRenderedDate = this.oYP.getFirstRenderedDate();

			// Assert
			assert.equal(oFirstRenderedDate.getFullYear(), 1990 /*2000 (default date value) - 20 (years per page) / 2 */, "year is correct");
			assert.equal(oFirstRenderedDate.getMonth(), 0, "month is correct");
			assert.equal(oFirstRenderedDate.getDate(), 1, "date is correct");
			assert.equal(oFirstRenderedDate.getHours(), 0, "hours are correct");
		});

		QUnit.module("Accessibility", {
			beforeEach: function () {
				this.oYP = new YearPicker();
				this.oYP.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			afterEach: function () {
				this.oYP.destroy();
				this.oYP = null;
			}
		});

		QUnit.test("Control description", function (assert) {
			// Arrange
			var sControlDescription = sap.ui.getCore().getLibraryResourceBundle("sap.ui.unified").getText("YEAR_PICKER");

			// Assert
			assert.strictEqual(this.oYP.$().attr("aria-label"), sControlDescription , "Control description is added");
		});

		QUnit.module("Corner cases", {
			beforeEach: function () {
				this.oYP = new YearPicker();
				this.oYP.placeAt("qunit-fixture");
				sap.ui.getCore().applyChanges();
			},
			afterEach: function () {
				this.oYP.destroy();
				this.oYP = null;
			}
		});

		QUnit.test("_isValueInThreshold return true if provided value is in provided threshold", function (assert) {
			assert.ok(this.oYP._isValueInThreshold(248, 258, 10), "value is between 238 and 258 - upper boundary"); // (reference value, actual value, threshold)
			assert.ok(this.oYP._isValueInThreshold(248, 238, 10), "value is between 238 and 258 - lower boundary"); // (reference value, actual value, threshold)
			assert.ok(this.oYP._isValueInThreshold(248, 240, 10), "value is between 238 and 258"); // (reference value, actual value, threshold)
			assert.ok(this.oYP._isValueInThreshold(248, 250, 10), "value is between 238 and 258"); // (reference value, actual value, threshold)
		});

		QUnit.test("_isValueInThreshold return false if provided value is out of provided threshold", function (assert) {
			assert.equal(this.oYP._isValueInThreshold(248, 237, 10), false, "value is lower"); // (reference value, actual value, threshold)
			assert.equal(this.oYP._isValueInThreshold(248, 259, 10), false, "value is upper"); // (reference value, actual value, threshold)
		});

		QUnit.test("Years are properly selected on touch devices mouseup", function (assert) {
			var iSelectedYear = 3,
					oMousePosition = { clientX: 10, clientY: 10 },
					deviceStub = this.stub(sap.ui.Device.support, "touch", true),
					isValueInThresholdStub = this.stub(this.oYP, "_isValueInThreshold", function () { return true; }),
					itemNavigationStub = this.stub(this.oYP._oItemNavigation, "getFocusedIndex", function () { return iSelectedYear; }),
					selectSpy = this.spy(function () {});

			this.oYP.attachSelect(selectSpy);

			assert.equal(this.oYP.getYear(), 2000, "2000 year is initially selected");

			this.oYP._oMousedownPosition = oMousePosition;
			this.oYP.onmouseup(oMousePosition);

			assert.equal(this.oYP.getYear(), 1993, "1993 year is selected on mouseup");
			assert.equal(selectSpy.callCount, 1, "select event is fired once");

			deviceStub.restore();
			isValueInThresholdStub.restore();
			itemNavigationStub.restore();
		});

	})();
});