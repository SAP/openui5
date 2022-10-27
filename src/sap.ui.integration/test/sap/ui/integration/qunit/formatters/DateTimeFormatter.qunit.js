/* global QUnit */
sap.ui.define([
	"sap/ui/integration/formatters/DateTimeFormatter",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UniversalDate"
],
function (
	DateTimeFormatter,
	CoreDateFormat,
	UniversalDate
) {
	"use strict";

	QUnit.module("DateTimeFormatter");

	QUnit.test("Format date should be dd MMM yy", function (assert) {
		var oDateResult = DateTimeFormatter.dateTime(new Date(1993, 11, 11), {format: "yMMMd"});
		assert.strictEqual(oDateResult, "Dec 11, 1993", "Date is formatted correctly");
	});

	QUnit.test("DateTime Formatter should be able to format JSON date format without minutes offset", function (assert) {
		var oDateResult = DateTimeFormatter.dateTime('/Date(0)/', {format: "yMMMd"});
		assert.strictEqual(oDateResult, "Jan 1, 1970", "Date is formatted correctly");
	});

	QUnit.test("DateTime Formatter should be able to format JSON date format with negative minutes offset", function (assert) {
		var oDateResult = DateTimeFormatter.dateTime('/Date(0-1440)/', {format: "yMMMd"});
		assert.strictEqual(oDateResult, "Jan 2, 1970", "Date is formatted correctly");
	});

	QUnit.test("DateTime Formatter should be able to format JSON date format with positive minutes offset", function (assert) {
		var oDateResult = DateTimeFormatter.dateTime('/Date(0+1440)/', {format: "yMMMd"});
		assert.strictEqual(oDateResult, "Dec 31, 1969", "Date is formatted correctly");
	});

	QUnit.test("DateTime Formatter with array of 2 dates and interval option", function (assert) {
		var sResult = DateTimeFormatter.dateTime(["2022-10-05", "2022-10-10"], { interval: true });
		var sExpected = CoreDateFormat.getDateTimeInstance({ interval: true }).format([new UniversalDate("2022-10-05"), new UniversalDate("2022-10-10")]);

		assert.strictEqual(sResult, sExpected, "Interval is formatted correctly");
	});

});
