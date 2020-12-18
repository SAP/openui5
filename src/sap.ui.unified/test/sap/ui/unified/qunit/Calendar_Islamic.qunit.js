/*global QUnit, window */

sap.ui.define([
	"sap/ui/unified/Calendar",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/LocaleData",
	"sap/ui/unified/DateRange"
], function(Calendar, UniversalDate, DateFormat, LocaleData, DateRange) {
	"use strict";

	var oLocaleData = LocaleData.getInstance(new sap.ui.core.Locale("en-US"));
	var aMonthNames = oLocaleData.getMonths("wide");

	var oFormat = DateFormat.getDateInstance({
		UTC: true,
		pattern: "yyyyMMdd",
		calendarType: sap.ui.core.CalendarType.Gregorian
	});

	var oCal1;

	function initializeCalendar(sSelectedDate) {
		var oDate = oFormat.parse(sSelectedDate, true);
		oCal1.destroySelectedDates();
		oCal1.addSelectedDate(new DateRange({startDate : oDate}));
		oCal1.displayDate(oDate);
		sap.ui.getCore().applyChanges();
	}

	function checkDate(sSelectedDate, iExpectedDay, iExpectedMonth, iExpectedYear,
		iExpectedDaysOfOtherMonthBefore, iExpectedDaysOfOtherMonthAfter, assert) {

		initializeCalendar(sSelectedDate);

		var oMonth = oCal1.getAggregation("month")[0].getDomRef();

		assert.equal(oMonth.querySelectorAll(".sapUiCalWH:not(.sapUiCalDummy)").length, 7, "Islamic week has 7 days");
		assert.equal(oCal1.$("-Head-B1").text(), "" + aMonthNames[iExpectedMonth - 1], "Islamic Month is correct");
		assert.equal(oCal1.$("-Head-B2").text(), iExpectedYear + " AH", "Islamic Year is correct");

		var aDays = oMonth.querySelectorAll(".sapUiCalItem"),
			oDay,
			sDate,
			iCount = 0,
			iExpectedDaysInMonth = 35 - iExpectedDaysOfOtherMonthBefore - iExpectedDaysOfOtherMonthAfter,
			oDate = new UniversalDate(UniversalDate.UTC(iExpectedYear, iExpectedMonth - 1, 1));

		assert.equal(aDays.length, 35, "Calendar shows 35 days");

		for (var i = 0; i < 35; i++) {
			oDay = aDays[i];
			sDate = oDay.getAttribute("data-sap-day");

			if (i < iExpectedDaysOfOtherMonthBefore || i >= aDays.length - iExpectedDaysOfOtherMonthAfter) {
				assert.ok(oDay.classList.contains("sapUiCalItemOtherMonth"), "Item " + i + " (" + sDate + ") is not in current month.");
			} else {
				iCount++;
				assert.ok(!oDay.classList.contains("sapUiCalItemOtherMonth"), "Item " + i + " (" + sDate + ") is in current month.");
				assert.equal(sDate, oFormat.format(oDate.getJSDate(), true), "Item " + i + " (" + sDate + ") has correct date (data-sap-day).");
				assert.equal(oDay.textContent, "" + iCount, "Item " + i + " (" + sDate + ") has correct date (text).");
				oDate.setUTCDate(oDate.getUTCDate() + 1);
			}

			if (sSelectedDate == sDate) {
				assert.ok(oDay.classList.contains("sapUiCalItemSel"), "Item " + i + " (" + sDate + ") is selected.");
				assert.equal(oDay.textContent, "" + iExpectedDay, "Item " + i + " (" + sDate + ") has selected date (text).");
			} else {
				assert.ok(!oDay.classList.contains("sapUiCalItemSel"), "Item " + i + " (" + sDate + ") is not selected.");
			}
		}

		assert.equal(iCount, iExpectedDaysInMonth, "Number of days in the month correct.");
	}

	function checkMonthNavigation(sSelectedDate, iExpectedMonth, bForwardNavigation, assert) {

		function checkNav(iExpMonth) {
			assert.equal(oCal1.$("-Head-B1").text(), "" + aMonthNames[iExpMonth - 1], "Islamic Month is correct before navigation: " + aMonthNames[iExpMonth - 1]);

			oCal1.$("-Head-" + (bForwardNavigation ? "next" : "prev")).trigger("click");
			sap.ui.getCore().applyChanges();

			var iNextMonthIdx = bForwardNavigation ? iExpMonth : iExpMonth - 2;
			if (iNextMonthIdx < 0) {
				iNextMonthIdx = aMonthNames.length - 1;
			} else if (iNextMonthIdx >= aMonthNames.length) {
				iNextMonthIdx = 0;
			}

			assert.equal(oCal1.$("-Head-B1").text(), "" + aMonthNames[iNextMonthIdx], "Islamic Month is correct after navigation: " + aMonthNames[iNextMonthIdx]);

			return iNextMonthIdx + 1;
		}

		initializeCalendar(sSelectedDate);
		var iMonth = iExpectedMonth;
		for (var i = 0; i < 12; i++) {
			iMonth = checkNav(iMonth);
		}
	}

	function checkMonthPicker(sSelectedDate, iExpectedMonth, assert) {
		initializeCalendar(sSelectedDate);
		oCal1.$("-Head-B1").trigger("click");
		sap.ui.getCore().applyChanges();

		var aMonths = oCal1.$("-MP").find(".sapUiCalItem"),
			$Month,
			sExpectedName;

		assert.equal(aMonths.length, 12, "Number of months is correct.");

		for (var i = 0; i < 12; i++) {
			sExpectedName = aMonthNames[i];
			$Month = jQuery(aMonths[i]);

			assert.equal($Month.text(), "" + sExpectedName, "Month name (" + sExpectedName + ") is correct.");

			if (iExpectedMonth == i + 1) {
				assert.ok($Month.hasClass("sapUiCalItemSel"), "Month " + sExpectedName + " is selected.");
			} else {
				assert.ok(!$Month.hasClass("sapUiCalItemSel"), "Month " + sExpectedName + " is not selected.");
			}
		}
	}

	QUnit.module("Dates", {
		beforeEach: function () {
			oCal1 = new Calendar("Cal1", {}).placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach:  function () {
			oCal1.destroy();
		}
	});

	QUnit.test("20150701", function(assert) {
		checkDate("20150701", 14, 9, 1436, 4, 1, assert);
	});

	QUnit.test("20140701", function(assert) {
		checkDate("20140701", 3, 9, 1435, 0, 5, assert);
	});

	QUnit.test("20150805", function(assert) {
		checkDate("20150805", 19, 10, 1436, 6, 0, assert);
	});

	QUnit.module("Navigation to next/previous Month", {
		beforeEach: function () {
			oCal1 = new Calendar("Cal1", {}).placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach:  function () {
			oCal1.destroy();
		}
	});

	QUnit.test("20150701 -> next", function(assert) {
		checkMonthNavigation("20150701", 9, true, assert);
	});

	QUnit.test("20150701 -> prev", function(assert) {
		checkMonthNavigation("20150701", 9, false, assert);
	});

	QUnit.module("Monthpicker", {
		beforeEach: function () {
			oCal1 = new Calendar("Cal1", {}).placeAt("content");
			sap.ui.getCore().applyChanges();
		},
		afterEach:  function () {
			oCal1.destroy();
		}
	});

	QUnit.test("20150701 Monthpicker", function(assert) {
		checkMonthPicker("20150701", 9, assert);
	});

	QUnit.test("20140701 Monthpicker", function(assert) {
		checkMonthPicker("20140701", 9, assert);
	});

	QUnit.test("20150805 Monthpicker", function(assert) {
		checkMonthPicker("20150801", 10, assert);
	});

});