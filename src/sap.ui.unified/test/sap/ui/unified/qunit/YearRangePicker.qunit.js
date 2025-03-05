/*global QUnit */

sap.ui.define([
	"sap/ui/unified/calendar/YearRangePicker",
	"sap/ui/unified/DateRange",
	"sap/ui/unified/calendar/CalendarDate",
	"sap/ui/core/date/UI5Date",
	"sap/ui/test/utils/nextUIUpdate"
], function(YearRangePicker, DateRange, CalendarDate, UI5Date, nextUIUpdate) {
	"use strict";

	QUnit.module("interval selection", {
		beforeEach: function() {
			this.YRP = new YearRangePicker("yrp", {
				intervalSelection: true
			});
		},
		afterEach: function() {
			this.YRP.destroy();
			this.YRP = null;
		}
	});

	QUnit.test("_isYearSelected", function(assert) {
		// Arrange
		const oYear1989 = UI5Date.getInstance(1989, 0, 1);
		const oYear2009 = UI5Date.getInstance(2009, 0, 1);
		const oYear2019 = UI5Date.getInstance(2019, 0, 1);
		const oYear2020 = UI5Date.getInstance(2020, 0, 1);
		const oYear2029 = UI5Date.getInstance(1989, 0, 1);

		this.YRP.addSelectedDate(new DateRange({
			startDate: oYear2019,
			endDate: oYear2020
		}));

		// Act & Assert
		assert.equal(
			this.YRP._isYearSelected(CalendarDate.fromLocalJSDate(oYear1989)),
			false,
			"year range 1989-2008 does not apply selection"
		);
		assert.equal(
			this.YRP._isYearSelected(CalendarDate.fromLocalJSDate(oYear2009)),
			true,
			"year range 2009-2028 applies selection"
		);
		assert.equal(
			this.YRP._isYearSelected(CalendarDate.fromLocalJSDate(oYear2029)),
			false,
			"year range 2009-2028 does not apply selection"
		);
	});

	QUnit.test("Selected & SelectedBetween get correctly applied", async function(assert) {
		// Arrange
		const oYear1995 = UI5Date.getInstance(1995, 0, 1);
		const oYear2037 = UI5Date.getInstance(2037, 0, 1);

		this.YRP.addSelectedDate(new DateRange({
			startDate: oYear1995,
			endDate: oYear2037
		}));

		// Act
		this.YRP.placeAt("qunit-fixture");
		await nextUIUpdate();

		const oYearRange96To15 = document.getElementById('yrp-y19900101');
		const oYearRange16To35 = document.getElementById('yrp-y20100101');
		const oYearRange36To35 = document.getElementById('yrp-y20300101');

		// Assert
		assert.ok( oYearRange96To15.classList.contains("sapUiCalItemSel"),
			"year range 1986-2005 correctly applies selection"
		);

		assert.ok( oYearRange16To35.classList.contains("sapUiCalItemSelBetween"),
			"year range 2006-2025 correctly applies selection-between"
		);

		assert.ok( oYearRange36To35.classList.contains("sapUiCalItem"),
			"year range 2026-2045 correctly applies selection"
		);
	});
});