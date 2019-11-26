/*global QUnit, window */

sap.ui.define([
	"sap/ui/unified/calendar/YearPicker",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/calendar/CalendarDate"
], function(YearPicker, DateRange, CalendarDate) {
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

		QUnit.module("interval selection", {
			beforeEach: function() {
				this.YP = new YearPicker({
					intervalSelection: true
				});
			},
			afterEach: function() {
				this.YP.destroy();
				this.YP = null;
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
			this.YP._setSelectedDatesControlOrigin(oSelectedDatesProvider);
			oDates = this.YP.getSelectedDates();

			// assert
			assert.equal(oDates, "mocked_dates", "selected dates are taken from the provider");
			assert.equal(this.YP._getSelectedDates(), "mocked_dates", "_getSelectedDates returns the selected date from the provider");
		});

		QUnit.test("_getSelectedDates", function(assert) {
			// act
			var aSelectedDates = this.YP._getSelectedDates();

			// assert
			assert.ok(aSelectedDates[0], "sap.m.DateRange intance is created");
			assert.strictEqual(aSelectedDates[0].getStartDate().getFullYear(), this.YP.getYear(),
				"sap.m.DateRange isntace start date has the same yaer as the 'year' property value");
			assert.notOk(aSelectedDates[0].getEndDate(), "sap.m.DateRange has no endDate set");
		});

		QUnit.test("_selectYear", function(assert) {
			// arrange
			var oSelectedDates = this.YP._getSelectedDates(),
				aRefs;

			this.YP.placeAt("qunit-fixture");
			sap.ui.getCore().applyChanges();
			aRefs = this.YP.$().find(".sapUiCalItem");

			// act
			this.YP._selectYear(12);

			// assert
			assert.strictEqual(oSelectedDates[0].getStartDate().getFullYear(), 2000, "2000 is selected start year");

			// assert
			assert.strictEqual(oSelectedDates[0].getEndDate().getFullYear(), 2002, "2000 is selected end year");
			assert.ok(aRefs.eq(10).hasClass("sapUiCalItemSel"), "is marked correctly with selected class");
			assert.strictEqual(aRefs.eq(10).attr("aria-selected"), "true", "aria selected is set to true");
			assert.ok(aRefs.eq(11).hasClass("sapUiCalItemSelBetween"), "is marked correctly with between class");
			assert.strictEqual(aRefs.eq(11).attr("aria-selected"), "true", "aria selected is set to true");
			assert.ok(aRefs.eq(12).hasClass("sapUiCalItemSel"), "is marked correctly with selected class");
			assert.strictEqual(aRefs.eq(12).attr("aria-selected"), "true", "aria selected is set to true");
		});

		QUnit.test("onmouseover", function(assert) {
			// arrange
			var oFakeEvent = {
					target: jQuery("<div></div>").attr({
						"data-sap-year-start": "19970101",
						"class": "sapUiCalItem"
					}).get(0),
					classList: {
						contains: function() {
							return true;
						}
					}
				},
				fnMarkIntervalSpy = this.spy(this.YP, "_markInterval");

			this.YP._oItemNavigation = {
				getItemDomRefs: function() {
					return [];
				}
			};

			// act
			this.YP.onmouseover(oFakeEvent);

			// assert
			assert.ok(fnMarkIntervalSpy.calledOnce, "_markInterval was called once");

			// clean
			fnMarkIntervalSpy.restore();
		});

		QUnit.test("_isSelectionInProgress", function(assert) {
			// arrange
			var oJan_01_2019 = new Date(2019, 0, 1),
				oJan_01_2020 = new Date(2020, 0, 1);

			this.YP.addSelectedDate(new DateRange({
				startDate: oJan_01_2019
			}));

			// assert
			assert.ok(this.YP._isSelectionInProgress(), "Selection is not finished");

			// act
			this.YP.getSelectedDates()[0].setEndDate(oJan_01_2020);

			// assert
			assert.notOk(this.YP._isSelectionInProgress(), "Selection is finished");
		});

		QUnit.test("_fnShouldApplySelection", function(assert) {
			// arrange
			var oJan_01_2019 = new Date(2019, 0, 1),
				oJan_01_2020 = new Date(2020, 0, 1),
				oJan_01_2021 = new Date(2021, 0, 1);

			this.YP.addSelectedDate(new DateRange({
				startDate: oJan_01_2019,
				endDate: oJan_01_2021
			}));

			// act & assert
			assert.equal(
				this.YP._fnShouldApplySelection(CalendarDate.fromLocalJSDate(oJan_01_2019)),
				true,
				"is correct with the start date"
			);
			assert.equal(
				this.YP._fnShouldApplySelection(CalendarDate.fromLocalJSDate(oJan_01_2020)),
				false,
				"is correct with a date between"
			);
			assert.equal(
				this.YP._fnShouldApplySelection(CalendarDate.fromLocalJSDate(oJan_01_2021)),
				true,
				"is correct with the end date"
			);
		});

		QUnit.test("_fnShouldApplySelectionBetween", function(assert) {
			// arrange
			var oJan_01_2019 = new Date(2019, 0, 1),
				oJan_01_2020 = new Date(2020, 0, 1),
				oJan_01_2021 = new Date(2021, 0, 1),
				oJan_01_2022 = new Date(2022, 0, 1);

			this.YP.addSelectedDate(new DateRange({
				startDate: oJan_01_2019,
				endDate: oJan_01_2022
			}));

			// act & assert
			assert.equal(
				this.YP._fnShouldApplySelectionBetween(CalendarDate.fromLocalJSDate(oJan_01_2019)),
				false,
				"is correct with the start date"
			);
			assert.equal(
				this.YP._fnShouldApplySelectionBetween(CalendarDate.fromLocalJSDate(oJan_01_2020)),
				true,
				"is correct with a date between"
			);
			assert.equal(
				this.YP._fnShouldApplySelectionBetween(CalendarDate.fromLocalJSDate(oJan_01_2021)),
				true,
				"is correct with another date between"
			);
			assert.equal(
				this.YP._fnShouldApplySelectionBetween(CalendarDate.fromLocalJSDate(oJan_01_2022)),
				false,
				"is correct with the end date"
			);
		});

		QUnit.test("_markInterval", function(assert) {
			// arrange
			var oJan_01_2000 = new Date(2000, 0, 1),
				oJan_01_2003 = new Date(2003, 0, 1),
				aRefs;

			this.YP.placeAt("content");
			sap.ui.getCore().applyChanges();
			aRefs = this.YP.$().find(".sapUiCalItem");


			// act
			this.YP._markInterval(
				CalendarDate.fromLocalJSDate(oJan_01_2000),
				CalendarDate.fromLocalJSDate(oJan_01_2003)
			);

			// assert
			assert.ok(aRefs.eq(11).hasClass("sapUiCalItemSelBetween"), "is marked correctly with between class");
			assert.ok(aRefs.eq(12).hasClass("sapUiCalItemSelBetween"), "is marked correctly with between class");
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