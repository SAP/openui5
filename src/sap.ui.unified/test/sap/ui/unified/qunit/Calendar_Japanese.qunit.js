/*global QUnit, window */

sap.ui.define([
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/unified/Calendar",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/LocaleData",
	"sap/ui/core/Locale",
	"sap/ui/unified/DateRange"
], function(qutils, Calendar, UniversalDate, DateFormat, LocaleData, Locale, DateRange) {
	"use strict";

	var oLocaleData = LocaleData.getInstance(new Locale("en-US"));
	var aMonthNames = oLocaleData.getMonths("wide");

	var oFormat = DateFormat.getDateInstance({
		UTC: true,
		pattern: "yyyyMMdd",
		calendarType: sap.ui.core.CalendarType.Gregorian
	});

	var oCal1 = new Calendar("Cal1", {}).placeAt("content");

	function initializeCalendar(sSelectedDate) {
		var oDate = oFormat.parse(sSelectedDate, true);
		oCal1.destroySelectedDates();
		oCal1.addSelectedDate(new DateRange({startDate : oDate}));
		oCal1.displayDate(oDate);
		sap.ui.getCore().applyChanges();
	}

	function checkDate(sSelectedDate, iExpectedDay, iExpectedMonth, iExpectedYear, iExpectedEra, sExpectedEra,
		iExpectedDays, iExpectedIndex, iExpectedDaysOfOtherMonthBefore, iExpectedDaysOfOtherMonthAfter, assert) {

		initializeCalendar(sSelectedDate);

		var $Month = oCal1.getAggregation("month")[0].$();

		assert.equal($Month.find(".sapUiCalWH").length, 7, "week has 7 days");
		assert.equal(oCal1.$("-Head-B1").text(), "" + aMonthNames[iExpectedMonth - 1], "Month is correct");
		assert.equal(oCal1.$("-Head-B2").text(), iExpectedYear + " " + sExpectedEra, "Japanese Year is correct");

		var aDays = $Month.find(".sapUiCalItem"),
			$Day,
			sDate,
			iCount = 0,
			oDate = new UniversalDate(UniversalDate.UTC([iExpectedEra, iExpectedYear], iExpectedMonth - 1, 1));

		assert.equal(aDays.length, iExpectedDays + iExpectedDaysOfOtherMonthBefore + iExpectedDaysOfOtherMonthAfter, "Calendar shows all days");

		for (var i = 0; i < 35; i++) {
			$Day = jQuery(aDays[i]);
			sDate = $Day.attr("data-sap-day");

			if (i < iExpectedDaysOfOtherMonthBefore || i >= aDays.length - iExpectedDaysOfOtherMonthAfter) {
				assert.ok($Day.hasClass("sapUiCalItemOtherMonth"), "Item " + i + " (" + sDate + ") is not in current month.");
			} else {
				iCount++;
				assert.ok(!$Day.hasClass("sapUiCalItemOtherMonth"), "Item " + i + " (" + sDate + ") is in current month.");
				assert.equal(sDate, oFormat.format(oDate.getJSDate(), true), "Item " + i + " (" + sDate + ") has correct date (data-sap-day).");
				assert.equal(jQuery($Day.children(".sapUiCalItemText")[0]).text(), "" + iCount, "Item " + i + " (" + sDate + ") has correct date (text).");
				oDate.setUTCDate(oDate.getUTCDate() + 1);
			}

			if (sSelectedDate == sDate) {
				assert.ok($Day.hasClass("sapUiCalItemSel"), "Item " + i + " (" + sDate + ") is selected.");
				assert.equal(jQuery($Day.children(".sapUiCalItemText")[0]).text(), "" + iExpectedDay, "Item " + i + " (" + sDate + ") has selected date (text).");
				assert.equal(i, iExpectedIndex, "Date has expected index");
			} else {
				assert.ok(!$Day.hasClass("sapUiCalItemSel"), "Item " + i + " (" + sDate + ") is not selected.");
			}
		}

		assert.equal(iCount, iExpectedDays, "Number of days in the month correct.");
	}

	function checkMonthNavigation(sSelectedDate, iExpectedMonth, sExpectedYear, bForwardNavigation, assert) {

		initializeCalendar(sSelectedDate);
		oCal1.$("-Head-" + (bForwardNavigation ? "next" : "prev")).click();
		sap.ui.getCore().applyChanges();

		assert.equal(oCal1.$("-Head-B1").text(), "" + aMonthNames[iExpectedMonth], "Month is correct after navigation: " + aMonthNames[iExpectedMonth]);
		assert.equal(oCal1.$("-Head-B2").text(), sExpectedYear, "Year is correct after navigation " + sExpectedYear);

	}

	function checkYearPicker(sSelectedDate, sExpectedStartYear, sExpectedEndYear, sExpectedSelYear, assert) {
		initializeCalendar(sSelectedDate);
		oCal1.$("-Head-B2").click();
		sap.ui.getCore().applyChanges();

		var aYears = oCal1.$("-YP").find(".sapUiCalItem"),
			$Year;

		assert.equal(aYears.length, 20, "Number of Years is correct.");
		assert.equal(jQuery(aYears[0]).text(), sExpectedStartYear, "First Year OK");
		assert.equal(jQuery(aYears[19]).text(), sExpectedEndYear, "Last Year OK");

		for (var i = 0; i < 20; i++) {
			$Year = jQuery(aYears[i]);

			if ($Year.hasClass("sapUiCalItemSel")) {
				assert.equal($Year.text(), sExpectedSelYear, "Selected Year OK");
			}
		}

		aYears[0].focus();
		qutils.triggerKeydown(aYears[0], jQuery.sap.KeyCodes.ENTER, false, false, false);
		sap.ui.getCore().applyChanges();
		assert.equal(oCal1.$("-Head-B2").text(), sExpectedStartYear, "Year is correct after navigation");
	}

	QUnit.module("Dates");

	QUnit.test("20150701", function(assert) {
		checkDate("20150701", 1, 7, 27, 235, "Heisei", 31, 3, 3, 1, assert);
	});

	QUnit.test("19890102", function(assert) {
		checkDate("19890102", 2, 1, 64, 234, "Shōwa", 31, 1, 0, 4, assert);
	});

	QUnit.test("19890202", function(assert) {
		checkDate("19890202", 2, 2, 1, 235, "Heisei", 28, 4, 3, 4, assert);
	});


	QUnit.module("Navigation to next/previous Month");

	QUnit.test("20150701 -> next", function(assert) {
		checkMonthNavigation("20150701", 7, "27 Heisei", true, assert);
	});

	QUnit.test("19890202 -> prev", function(assert) {
		checkMonthNavigation("19890202", 0, "64 Shōwa", false, assert);
	});

	QUnit.test("19890102 -> next", function(assert) {
		checkMonthNavigation("19890102", 1, "1 Heisei", true, assert);
	});

	QUnit.module("Yearpicker");

	QUnit.test("20150701 Yearpicker", function(assert) {
		checkYearPicker("20150701", "17 Heisei", "6 Reiwa", "27 Heisei", assert);
	});

	QUnit.test("19900101 Yearpicker", function(assert) {
		checkYearPicker("19900101", "55 Shōwa", "11 Heisei", "2 Heisei", assert);
	});
});