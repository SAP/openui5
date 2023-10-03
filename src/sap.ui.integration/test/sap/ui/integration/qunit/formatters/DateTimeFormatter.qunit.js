/* global QUnit */
sap.ui.define([
	"sap/ui/integration/formatters/DateTimeFormatter",
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UniversalDate",
	"sap/ui/core/date/UI5Date",
	"sap/base/Log"
], function (
	DateTimeFormatter,
	CoreDateFormat,
	UniversalDate,
	UI5Date,
	Log
) {
	"use strict";

	QUnit.module("DateTimeFormatter - dateTime");

	QUnit.test("Should produce the same result as DateFormat#getDateTimeInstance", function (assert) {
		const sResult = DateTimeFormatter.dateTime(UI5Date.getInstance(1993, 11, 11, 12, 30));
		const sExpected = CoreDateFormat.getDateTimeInstance().format(UI5Date.getInstance(1993, 11, 11, 12, 30));

		assert.strictEqual(sResult, sExpected, "Date and time are formatted correctly");
	});

	QUnit.test("Should be able to format JSON date format without minutes offset", function (assert) {
		const sResult = DateTimeFormatter.dateTime('/Date(0)/', { format: "yMMMd" });
		assert.strictEqual(sResult, "Jan 1, 1970", "Date is formatted correctly");
	});

	QUnit.test("Should be able to format JSON date format with negative minutes offset", function (assert) {
		const sResult = DateTimeFormatter.dateTime('/Date(0-1440)/', { format: "yMMMd" });
		assert.strictEqual(sResult, "Jan 2, 1970", "Date is formatted correctly");
	});

	QUnit.test("Should be able to format JSON date format with positive minutes offset", function (assert) {
		const sResult = DateTimeFormatter.dateTime('/Date(0+1440)/', { format: "yMMMd" });
		assert.strictEqual(sResult, "Dec 31, 1969", "Date is formatted correctly");
	});

	QUnit.test("Array of 2 dates and interval option", function (assert) {
		const sResult = DateTimeFormatter.dateTime(["2022-10-05", "2022-10-10"], { interval: true });
		const sExpected = CoreDateFormat.getDateTimeInstance({ interval: true }).format([new UniversalDate("2022-10-05"), new UniversalDate("2022-10-10")]);

		assert.strictEqual(sResult, sExpected, "Interval is formatted correctly");
	});

	QUnit.test("Format undefined dateTime", function (assert) {
		this.spy(Log, "error");
		DateTimeFormatter.dateTime(undefined);

		assert.ok(Log.error.notCalled, "There should be no console error");
	});

	QUnit.module("DateTimeFormatter - date");

	QUnit.test("Should produce the same result as DateFormat#getDateInstance", function (assert) {
		const sResult = DateTimeFormatter.date(UI5Date.getInstance(1993, 11, 11, 12, 30));
		const sExpected = CoreDateFormat.getDateInstance().format(UI5Date.getInstance(1993, 11, 11));

		assert.strictEqual(sResult, sExpected, "Date is formatted correctly");
	});

	QUnit.test("dateTime() and date() produce different results", function (assert) {
		const sDateResult = DateTimeFormatter.date(UI5Date.getInstance(1993, 11, 11, 12, 30));
		const sDateTimeResult = DateTimeFormatter.dateTime(UI5Date.getInstance(1993, 11, 11, 12, 30));

		assert.notStrictEqual(sDateResult, sDateTimeResult, "Results should differ in time");
	});

	QUnit.test("Format undefined date", function (assert) {
		this.spy(Log, "error");
		DateTimeFormatter.date(undefined);

		assert.ok(Log.error.notCalled, "There should be no console error");
	});

});
