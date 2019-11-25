/*global QUnit, window, sinon */

sap.ui.define([
	"sap/ui/unified/calendar/MonthPicker",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/events/KeyCodes"
], function(MonthPicker, DateRange, CalendarDate, KeyCodes) {
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

		QUnit.test("fires pageChange on pageup/pagedown", function(assert) {
			// arrange
			var oFirePageChangeSpy = this.spy(this.oMP, "firePageChange");

			// act
			this.oMP._oItemNavigation.fireEvent("BorderReached", { event: { type: "sappagedown" } });

			// assert
			assert.equal(oFirePageChangeSpy.callCount, 1, "pageChange is fired once");
			assert.ok(oFirePageChangeSpy.calledWith(sinon.match({ offset: 1 })), "pageChange is fired with the correct arguments");

			// arrange
			oFirePageChangeSpy.reset();

			// act
			this.oMP._oItemNavigation.fireEvent("BorderReached", { event: { type: "sappageup" } });

			// assert
			assert.equal(oFirePageChangeSpy.callCount, 1, "pageChange is fired once");
			assert.ok(oFirePageChangeSpy.calledWith(sinon.match({ offset: -1 })), "pageChange is fired with the correct arguments");
		});

		QUnit.test("fires pageChange on border reached with arrow up/down", function(assert) {
			// arrange
			var oFirePageChangeSpy = this.spy(this.oMP, "firePageChange");

			// act
			this.oMP._oItemNavigation.fireEvent("BorderReached", {
				event: {
						type: "sapprevious",
						keyCode: KeyCodes.ARROW_UP
					}
				});

			// assert
			assert.equal(oFirePageChangeSpy.callCount, 1, "pageChange is fired once");
			assert.ok(oFirePageChangeSpy.calledWith(sinon.match({ offset: -1 })), "pageChange is fired with the correct arguments");

			// arrange
			oFirePageChangeSpy.reset();

			// act
			this.oMP._oItemNavigation.fireEvent("BorderReached", {
				event: {
						type: "sapnext",
						keyCode: KeyCodes.ARROW_DOWN
					}
				});

			// assert
			assert.equal(oFirePageChangeSpy.callCount, 1, "pageChange is fired once");
			assert.ok(oFirePageChangeSpy.calledWith(sinon.match({ offset: 1 })), "pageChange is fired with the correct arguments");
		});

		QUnit.test("fires pageChange on border reached with arrow right/left", function(assert) {
			// arrange
			var oFirePageChangeSpy = this.spy(this.oMP, "firePageChange");

			// act
			this.oMP._oItemNavigation.fireEvent("BorderReached", {
				event: {
						type: "sapprevious",
						keyCode: KeyCodes.ARROW_RIGHT
					}
				});

			// assert
			assert.equal(oFirePageChangeSpy.callCount, 1, "pageChange is fired once");
			assert.ok(oFirePageChangeSpy.calledWith(sinon.match({ offset: -1 })), "pageChange is fired with the correct arguments");

			// arrange
			oFirePageChangeSpy.reset();

			// act
			this.oMP._oItemNavigation.fireEvent("BorderReached", {
				event: {
						type: "sapnext",
						keyCode: KeyCodes.ARROW_LEFT
					}
				});

			// assert
			assert.equal(oFirePageChangeSpy.callCount, 1, "pageChange is fired once");
			assert.ok(oFirePageChangeSpy.calledWith(sinon.match({ offset: 1 })), "pageChange is fired with the correct arguments");
		});

		QUnit.module("interval selection", {
			beforeEach: function() {
				this.MP = new MonthPicker({
					intervalSelection: true
				});
			},
			afterEach: function() {
				this.MP.destroy();
				this.MP = null;
			}
		});

		QUnit.test("_setSelectedDatesControlOrigin", function(assert) {
			// arrange
			var oDates,
				oSelectedDatesProvider = {
					getSelectedDates: function() {
						return "mocked_dates";
					}
				};

			// act
			this.MP._setSelectedDatesControlOrigin(oSelectedDatesProvider);
			oDates = this.MP.getSelectedDates();

			// assert
			assert.equal(oDates, "mocked_dates", "selected dates are taken from the provider");
		});

		QUnit.test("_fnShouldApplySelection", function(assert) {
			// arrange
			var oSep_01_2019 = new Date(2019, 8, 1),
				oNov_01_2019 = new Date(2019, 10, 1),
				oDec_01_2019 = new Date(2019, 11, 1);

			this.MP.addSelectedDate(new DateRange({
				startDate: oSep_01_2019,
				endDate: oDec_01_2019
			}));

			// act & assert
			assert.equal(
				this.MP._fnShouldApplySelection(CalendarDate.fromLocalJSDate(oSep_01_2019)),
				true,
				"is correct with the start date"
			);
			assert.equal(
				this.MP._fnShouldApplySelection(CalendarDate.fromLocalJSDate(oNov_01_2019)),
				false,
				"is correct with a date between"
			);
			assert.equal(
				this.MP._fnShouldApplySelection(CalendarDate.fromLocalJSDate(oDec_01_2019)),
				true,
				"is correct with the end date"
			);
		});

		QUnit.test("_fnShouldApplySelectionBetween", function(assert) {
			// arrange
			var oSep_01_2019 = new Date(2019, 8, 1),
				oOct_01_2019 = new Date(2019, 9, 1),
				oNov_01_2019 = new Date(2019, 10, 1),
				oDec_01_2019 = new Date(2019, 11, 1);

			this.MP.addSelectedDate(new DateRange({
				startDate: oSep_01_2019,
				endDate: oDec_01_2019
			}));

			// act & assert
			assert.equal(
				this.MP._fnShouldApplySelectionBetween(CalendarDate.fromLocalJSDate(oSep_01_2019)),
				false,
				"is correct with the start date"
			);
			assert.equal(
				this.MP._fnShouldApplySelectionBetween(CalendarDate.fromLocalJSDate(oOct_01_2019)),
				true,
				"is correct with a date between"
			);
			assert.equal(
				this.MP._fnShouldApplySelectionBetween(CalendarDate.fromLocalJSDate(oNov_01_2019)),
				true,
				"is correct with another date between"
			);
			assert.equal(
				this.MP._fnShouldApplySelectionBetween(CalendarDate.fromLocalJSDate(oDec_01_2019)),
				false,
				"is correct with the end date"
			);
		});

		QUnit.test("_markInterval", function(assert) {
			// arrange
			var oSep_01_2019 = new Date(2019, 8, 1),
				oDec_01_2019 = new Date(2019, 11, 1),
				aRefs;

			this.MP.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			aRefs = this.MP.$().find(".sapUiCalItem");


			// act
			this.MP._markInterval(
				CalendarDate.fromLocalJSDate(oSep_01_2019),
				CalendarDate.fromLocalJSDate(oDec_01_2019)
			);

			// assert
			assert.ok(aRefs.eq(9).hasClass("sapUiCalItemSelBetween"), "is marked correctly with between class");
			assert.ok(aRefs.eq(10).hasClass("sapUiCalItemSelBetween"), "is marked correctly with between class");
		});
	})();
});