/*global QUnit */

sap.ui.define([
	"sap/ui/unified/Calendar",
	"sap/ui/core/CalendarType",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/Locale",
	"sap/ui/core/LocaleData",
	"sap/ui/unified/DateRange",
	"sap/ui/thirdparty/jquery",
	"sap/ui/qunit/utils/nextUIUpdate",
	// load all required calendars in advance
	"sap/ui/core/date/Gregorian",
	"sap/ui/core/date/Islamic"
], function(Calendar, CalendarType, UniversalDate, DateFormat, Locale, LocaleData, DateRange, jQuery, nextUIUpdate) {
	"use strict";

	var oLocaleData = LocaleData.getInstance(new Locale("en-US"));
	var aMonthNames = oLocaleData.getMonths("wide");

	var oFormat = DateFormat.getDateInstance({
		UTC: true,
		pattern: "yyyyMMdd",
		calendarType: CalendarType.Gregorian
	});

	var oCal1;

	async function initializeCalendar(sSelectedDate) {
		var oDate = oFormat.parse(sSelectedDate, true);
		oCal1.destroySelectedDates();
		oCal1.addSelectedDate(new DateRange({startDate : oDate}));
		oCal1.displayDate(oDate);
		await nextUIUpdate();
	}

	async function checkDate(sSelectedDate, iExpectedDay, iExpectedMonth, iExpectedYear,
		iExpectedDaysOfOtherMonthBefore, iExpectedDaysOfOtherMonthAfter, assert) {

		await initializeCalendar(sSelectedDate);

		var oMonth = oCal1.getAggregation("month")[0].getDomRef();

		assert.equal(oMonth.querySelectorAll(".sapUiCalWH:not(.sapUiCalDummy)").length, 7, "Islamic week has 7 days");
		assert.equal(oCal1.$("-Head-B1").text(), "" + aMonthNames[iExpectedMonth - 1], "Islamic Month is correct");
		assert.equal(oCal1.$("-Head-B2").text(), iExpectedYear + " AH", "Islamic Year is correct");

		var aDays = oMonth.querySelectorAll(".sapUiCalItem"),
			oDay,
			sDate,
			iCount = 0,
			iExpectedDaysInMonth = 42 - iExpectedDaysOfOtherMonthBefore - iExpectedDaysOfOtherMonthAfter,
			oDate = new UniversalDate(UniversalDate.UTC(iExpectedYear, iExpectedMonth - 1, 1));

		assert.equal(aDays.length, 42, "Calendar shows 42 days");

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

	async function checkMonthNavigation(sSelectedDate, iExpectedMonth, bForwardNavigation, assert) {

		async function checkNav(iExpMonth) {
			assert.equal(oCal1.$("-Head-B1").text(), "" + aMonthNames[iExpMonth - 1], "Islamic Month is correct before navigation: " + aMonthNames[iExpMonth - 1]);

			oCal1.$("-Head-" + (bForwardNavigation ? "next" : "prev")).trigger("click");
			await nextUIUpdate();

			var iNextMonthIdx = bForwardNavigation ? iExpMonth : iExpMonth - 2;
			if (iNextMonthIdx < 0) {
				iNextMonthIdx = aMonthNames.length - 1;
			} else if (iNextMonthIdx >= aMonthNames.length) {
				iNextMonthIdx = 0;
			}

			assert.equal(oCal1.$("-Head-B1").text(), "" + aMonthNames[iNextMonthIdx], "Islamic Month is correct after navigation: " + aMonthNames[iNextMonthIdx]);

			return iNextMonthIdx + 1;
		}

		await initializeCalendar(sSelectedDate);
		var iMonth = iExpectedMonth;
		for (var i = 0; i < 12; i++) {
			iMonth = await checkNav(iMonth);
		}
	}

	async function checkMonthPicker(sSelectedDate, iExpectedMonth, assert) {
		await initializeCalendar(sSelectedDate);
		oCal1.$("-Head-B1").trigger("click");
		await nextUIUpdate();

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
		beforeEach: async function () {
			oCal1 = new Calendar("Cal1", {}).placeAt("content");
			await nextUIUpdate();
		},
		afterEach: function () {
			oCal1.destroy();
		}
	});

	QUnit.test("20150701", async function(assert) {
		await checkDate("20150701", 14, 9, 1436, 4, 8, assert);
	});

	QUnit.test("20140701", async function(assert) {
		await checkDate("20140701", 3, 9, 1435, 0, 12, assert);
	});

	QUnit.test("20150805", async function(assert) {
		await checkDate("20150805", 19, 10, 1436, 6, 7, assert);
	});

	QUnit.module("Navigation to next/previous Month", {
		beforeEach: async function () {
			oCal1 = new Calendar("Cal1", {}).placeAt("content");
			await nextUIUpdate();
		},
		afterEach: async function () {
			oCal1.destroy();
			await nextUIUpdate();
		}
	});

	QUnit.test("20150701 -> next", async function(assert) {
		await checkMonthNavigation("20150701", 9, true, assert);
	});

	QUnit.test("20150701 -> prev", async function(assert) {
		await checkMonthNavigation("20150701", 9, false, assert);
	});

	QUnit.module("Monthpicker", {
		beforeEach: async function () {
			oCal1 = new Calendar("Cal1", {}).placeAt("content");
			await nextUIUpdate();
		},
		afterEach:  function () {
			oCal1.destroy();
		}
	});

	QUnit.test("20150701 Monthpicker", async function(assert) {
		await checkMonthPicker("20150701", 9, assert);
	});

	QUnit.test("20140701 Monthpicker", async function(assert) {
		await checkMonthPicker("20140701", 9, assert);
	});

	QUnit.test("20150805 Monthpicker", async function(assert) {
		await checkMonthPicker("20150801", 10, assert);
	});

});