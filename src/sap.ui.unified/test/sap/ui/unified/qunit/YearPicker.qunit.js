/*global QUnit */

sap.ui.define([
	"sap/ui/core/Lib",
    "sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/unified/calendar/YearPicker",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/Device",
	"sap/ui/thirdparty/jquery",
	"sap/ui/core/date/UI5Date"
], function(Library, nextUIUpdate, YearPicker, DateRange, CalendarDate, Device, jQuery, UI5Date) {
	"use strict";

		QUnit.module("API ", {
			beforeEach: async function () {
				this.oYP = new YearPicker();
				this.oYP.placeAt("qunit-fixture");
				await nextUIUpdate();
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

		/**
 		 * @deprecated As of version 1.34
		 */
		QUnit.test("setYear", async function(assert) {
			// Prepare
			const oItemNavigation = this.oYP._oItemNavigation;

			// Act
			this.oYP.setYear(2017);
			await nextUIUpdate();

			const oGridItemRefs = oItemNavigation.getItemDomRefs();
			const iFocusedIndex = oItemNavigation.getFocusedIndex();

			// Assert
			assert.equal(this.oYP.getSelectedDates()[0].getStartDate().getFullYear(), 2017, "There is a selected date");
			assert.ok(oGridItemRefs[iFocusedIndex].classList.contains("sapUiCalItemSel"));
		});

		/**
 		 * @deprecated As of version 1.34
		 */
		QUnit.test("setYear with interval selection", function(assert) {
			// Prepare
			this.oYP.setIntervalSelection(true);

			// Act
			this.oYP.setYear(2017);

			// Assert
			assert.notOk(this.oYP.getSelectedDates(), "There are no selected dates after setYear");

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

		QUnit.test("selectedDates initially", function(assert) {
			// Assert
			assert.notOk(this.YP.getSelectedDates(), "There are no selected dates initially");
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
			/**
 			 * @deprecated As of version 1.34
			 */
			assert.strictEqual(aSelectedDates[0].getStartDate().getFullYear(), this.YP.getYear(),
				"sap.m.DateRange instance start date has the same year as the 'year' property value");

			assert.strictEqual(aSelectedDates[0].getStartDate().getFullYear(), this.YP.getDate().getFullYear(),
				"sap.m.DateRange instance start date has the same year as the 'date' property value");
			assert.notOk(aSelectedDates[0].getEndDate(), "sap.m.DateRange has no endDate set");
		});

		QUnit.test("_selectYear", async function(assert) {
			// arrange
			var oSelectedDates = this.YP._getSelectedDates(),
				aRefs;

			this.YP.placeAt("qunit-fixture");
			await nextUIUpdate();
			aRefs = this.YP.$().find(".sapUiCalItem");

			// act
			this.YP._selectYear(12);
			await nextUIUpdate();

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
			var oJan_01_2019 = UI5Date.getInstance(2019, 0, 1),
				oJan_01_2020 = UI5Date.getInstance(2020, 0, 1);

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

		QUnit.test("_isYearSelected", function(assert) {
			// arrange
			var oJan_01_2019 = UI5Date.getInstance(2019, 0, 1),
				oJan_01_2020 = UI5Date.getInstance(2020, 0, 1),
				oJan_01_2021 = UI5Date.getInstance(2021, 0, 1);

			this.YP.addSelectedDate(new DateRange({
				startDate: oJan_01_2019,
				endDate: oJan_01_2021
			}));

			// act & assert
			assert.equal(
				this.YP._isYearSelected(CalendarDate.fromLocalJSDate(oJan_01_2019)),
				true,
				"is correct with the start date"
			);
			assert.equal(
				this.YP._isYearSelected(CalendarDate.fromLocalJSDate(oJan_01_2020)),
				false,
				"is correct with a date between"
			);
			assert.equal(
				this.YP._isYearSelected(CalendarDate.fromLocalJSDate(oJan_01_2021)),
				true,
				"is correct with the end date"
			);
		});

		QUnit.test("_isYearInsideSelectionRange", function(assert) {
			// arrange
			var oJan_01_2019 = UI5Date.getInstance(2019, 0, 1),
				oJan_01_2020 = UI5Date.getInstance(2020, 0, 1),
				oJan_01_2021 = UI5Date.getInstance(2021, 0, 1),
				oJan_01_2022 = UI5Date.getInstance(2022, 0, 1);

			this.YP.addSelectedDate(new DateRange({
				startDate: oJan_01_2020,
				endDate: oJan_01_2022
			}));

			// act & assert
			assert.equal(
				this.YP._isYearInsideSelectionRange(CalendarDate.fromLocalJSDate(oJan_01_2019)),
				false,
				"is correct with a date outside the range"
			);
			assert.equal(
				this.YP._isYearInsideSelectionRange(CalendarDate.fromLocalJSDate(oJan_01_2020)),
				true,
				"is correct with the start date"
			);
			assert.equal(
				this.YP._isYearInsideSelectionRange(CalendarDate.fromLocalJSDate(oJan_01_2021)),
				true,
				"is correct with a date between"
			);
			assert.equal(
				this.YP._isYearInsideSelectionRange(CalendarDate.fromLocalJSDate(oJan_01_2022)),
				true,
				"is correct with the end date"
			);
		});

		QUnit.test("_markInterval", async function(assert) {
			// arrange
			var oJan_01_2000 = UI5Date.getInstance(2000, 0, 1),
				oJan_01_2003 = UI5Date.getInstance(2003, 0, 1),
				aRefs;

			this.YP.placeAt("qunit-fixture");
			await nextUIUpdate();
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

		QUnit.test("_markInterval", async function (assert) {
			// Prepare
			var aItemsMarkedAsBetween,
				oBeforeStartDate = CalendarDate.fromLocalJSDate(UI5Date.getInstance(2016, 0, 1)),
				oIntervalStartDate = CalendarDate.fromLocalJSDate(UI5Date.getInstance(2018, 0, 1)),
				oIntervalEndDate = CalendarDate.fromLocalJSDate(UI5Date.getInstance(2022, 11, 31)),
				oAfterEndDate = CalendarDate.fromLocalJSDate(UI5Date.getInstance(2024, 11, 31));

			this.YP.getDate().setFullYear(2018);
			this.YP.setDate(this.YP.getDate());
			this.YP._oMinDate = CalendarDate.fromLocalJSDate(UI5Date.getInstance(2018, 0, 1));
			this.YP._oMaxDate = CalendarDate.fromLocalJSDate(UI5Date.getInstance(2022, 11, 31));

			this.YP.placeAt("qunit-fixture");
			await nextUIUpdate();

			// Act
			this.YP._markInterval(oIntervalStartDate, oIntervalEndDate);

			aItemsMarkedAsBetween = jQuery('.sapUiCalItemSelBetween');

			// Assert
			assert.strictEqual(aItemsMarkedAsBetween.length, 4, "4 years inside the interval");

			// Act
			this.YP._markInterval(oBeforeStartDate, oIntervalEndDate);

			aItemsMarkedAsBetween = jQuery('.sapUiCalItemSelBetween');

			// Assert
			assert.strictEqual(aItemsMarkedAsBetween.length, 4, "4 years inside the interval");

			// Act
			this.YP._markInterval(oIntervalStartDate, oAfterEndDate);

			aItemsMarkedAsBetween = jQuery('.sapUiCalItemSelBetween');

			// Assert
			assert.strictEqual(aItemsMarkedAsBetween.length, 4, "4 years inside the interval");
		});

		QUnit.module("Accessibility", {
			beforeEach: async function () {
				this.oYP = new YearPicker();
				this.oYP.placeAt("qunit-fixture");
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oYP.destroy();
				this.oYP = null;
			}
		});

		QUnit.test("Control description", function (assert) {
			// Arrange
			var sControlDescription = Library.getResourceBundleFor("sap.ui.unified").getText("YEAR_PICKER");

			// Assert
			assert.strictEqual(this.oYP.$().attr("aria-roledescription"), sControlDescription , "Control description is added in aria-roledescription");
		});

		QUnit.module("Corner cases", {
			beforeEach: async function () {
				this.oYP = new YearPicker();
				this.oYP.placeAt("qunit-fixture");
				await nextUIUpdate();
			},
			afterEach: function () {
				this.oYP.destroy();
				this.oYP = null;
			}
		});

		QUnit.test("Year is set to 0001", async function(assert) {
			// Act
			this.oYP.getDate().setFullYear(1);
			await nextUIUpdate();

			// Assert
			assert.ok(true, "Error is not thrown trying to format date with negative year value");
		});

		QUnit.test("Year is set to 9999", async function(assert) {
			// Arrange
			var oMaxYear;

			// Act
			this.oYP.getDate().setFullYear(9999);
			await nextUIUpdate();

			this.oYP._updatePage(true, 0, true);
			oMaxYear = this.oYP._oMaxDate.toLocalJSDate().getFullYear();

			// Assert
			assert.strictEqual(oMaxYear, 9999, "Maximum constraint is correct");
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
					deviceStub = this.stub(Device.support, "touch").value(true),
					isValueInThresholdStub = this.stub(this.oYP, "_isValueInThreshold").returns(true),
					itemNavigationStub = this.stub(this.oYP._oItemNavigation, "getFocusedIndex").returns(iSelectedYear),
					selectSpy = this.spy(function () {});

			this.oYP.attachSelect(selectSpy);

			/**
 			 * @deprecated As of version 1.34
			 */
			assert.equal(this.oYP.getYear(), 2000, "2000 year is initially selected");
			assert.equal(this.oYP.getDate().getFullYear(), 2000, "2000 year is initially selected");

			this.oYP._oMousedownPosition = oMousePosition;
			this.oYP.onmouseup(oMousePosition);

			/**
 			 * @deprecated As of version 1.34
			 */
			assert.equal(this.oYP.getYear(), 1993, "1993 year is selected on mouseup");
			assert.equal(this.oYP.getDate().getFullYear(), 1993, "1993 year is selected on mouseup");
			assert.equal(selectSpy.callCount, 1, "select event is fired once");

			deviceStub.restore();
			isValueInThresholdStub.restore();
			itemNavigationStub.restore();
		});

});